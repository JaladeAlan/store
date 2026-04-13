import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyPaystackWebhook, verifyPaystackTransaction } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const rawBody = await request.text();

    const isValid = verifyPaystackWebhook(rawBody, signature);
    if (!isValid) {
      console.error('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createAdminClient();

    switch (event.event) {
      case 'charge.success': {
        const { reference, status, paid_at, metadata } = event.data;

        if (status !== 'success') break;

        // Double-verify with Paystack API
        const verification = await verifyPaystackTransaction(reference);
        if (!verification.data || verification.data.status !== 'success') {
          console.error('Paystack verification failed for:', reference);
          break;
        }

        const orderId = metadata?.order_id;
        if (!orderId) break;

        await supabase
          .from('payments')
          .update({
            status: 'paid',
            provider_response: event.data,
            paid_at: paid_at || new Date().toISOString(),
          })
          .eq('reference', reference);

        await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        console.log(`Order ${orderId} confirmed via Paystack`);
        break;
      }

      case 'charge.failed': {
        const { reference } = event.data;
        await supabase
          .from('payments')
          .update({ status: 'failed', provider_response: event.data })
          .eq('reference', reference);
        break;
      }

      case 'refund.processed': {
        const { transaction_reference } = event.data;

        const { data: payment } = await supabase
          .from('payments')
          .select('order_id')
          .eq('reference', transaction_reference)
          .single();

        if (payment) {
          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('reference', transaction_reference);

          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('id', payment.order_id);
        }
        break;
      }

      default:
        console.log('Unhandled Paystack event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}