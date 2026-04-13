import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initializeMonnifyTransaction } from '@/lib/monnify';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, email, amount, customerName } = await request.json();

    if (!orderId || !email || !amount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total, order_number, status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Order already processed' }, { status: 400 });
    }

    const reference = `MNF-${order.order_number}-${Date.now()}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?reference=${reference}&provider=monnify`;

    const monnifyResponse = await initializeMonnifyTransaction({
      amount: order.total,
      customerEmail: email,
      customerName,
      paymentReference: reference,
      paymentDescription: `${process.env.NEXT_PUBLIC_APP_NAME} Order ${order.order_number}`,
      orderId,
      redirectUrl,
    });

    if (!monnifyResponse.requestSuccessful) {
      return NextResponse.json({ success: false, error: 'Payment initialization failed' }, { status: 500 });
    }

    // Create payment record
    await supabase.from('payments').insert({
      order_id: orderId,
      provider: 'monnify',
      reference,
      amount: order.total,
      currency: 'NGN',
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: monnifyResponse.responseBody.checkoutUrl,
      reference,
    });
  } catch (error) {
    console.error('Monnify init error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
