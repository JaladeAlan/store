import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initializePaystackTransaction } from '@/lib/paystack';
import { generatePaystackRef } from '@/lib/utils';

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
      .select('id, total, status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Order already processed' }, { status: 400 });
    }

    const reference = generatePaystackRef();
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?reference=${reference}&provider=paystack`;

    const paystackResponse = await initializePaystackTransaction({
      email,
      amount: order.total,
      reference,
      orderId,
      callbackUrl,
      metadata: {
        customer_name: customerName,
        order_id: orderId,
      },
    });

    if (!paystackResponse.status) {
      return NextResponse.json({ success: false, error: 'Payment initialization failed' }, { status: 500 });
    }

    // Create payment record
    await supabase.from('payments').insert({
      order_id: orderId,
      provider: 'paystack',
      reference,
      amount: order.total,
      currency: 'NGN',
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error('Paystack init error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
