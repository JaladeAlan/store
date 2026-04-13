import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { verifyMonnifyTransaction } from '@/lib/monnify';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const provider = searchParams.get('provider') as 'paystack' | 'monnify';

    if (!reference || !provider) {
      return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check our DB first
    const { data: payment } = await supabase
      .from('payments')
      .select(`
        *,
        order:orders(
          *,
          items:order_items(
            *,
            product:products(name, slug),
            variant:product_variants(size, color)
          )
        )
      `)
      .eq('reference', reference)
      .single();

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    // If already paid in DB, return success immediately
    if (payment.status === 'paid') {
      return NextResponse.json({ success: true, order: payment.order });
    }

    // Otherwise verify with provider
    let verified = false;

    if (provider === 'paystack') {
      const result = await verifyPaystackTransaction(reference);
      verified = result.data?.status === 'success';
    } else if (provider === 'monnify') {
      const result = await verifyMonnifyTransaction(reference);
      verified = result.status === 'PAID';
    }

    if (!verified) {
      return NextResponse.json({ success: false, error: 'Payment not successful' });
    }

    // Update payment + order status (webhook may not have fired yet)
    const adminSupabase = supabase; // use service role via admin client if needed
    await adminSupabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('reference', reference);

    await adminSupabase
      .from('orders')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', payment.order_id);

    // Fetch updated order
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(name, slug),
          variant:product_variants(size, color)
        )
      `)
      .eq('id', payment.order_id)
      .single();

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
