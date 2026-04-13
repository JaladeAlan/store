import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyMonnifyWebhook, verifyMonnifyTransaction } from '@/lib/monnify';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('monnify-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const rawBody = await request.text();

    const isValid = verifyMonnifyWebhook(rawBody, signature);
    if (!isValid) {
      console.error('Invalid Monnify webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createAdminClient();

    const { eventType, eventData } = event;

    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      const { paymentReference, transactionReference, paidOn } = eventData;

      // Verify with Monnify API
      const verification = await verifyMonnifyTransaction(transactionReference);
      if (verification.status !== 'PAID') {
        console.error('Monnify verification failed for:', transactionReference);
        return NextResponse.json({ received: true });
      }

      const { data: payment } = await supabase
        .from('payments')
        .select('id, order_id')
        .eq('reference', paymentReference)
        .single();

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'paid',
            provider_response: eventData,
            paid_at: paidOn || new Date().toISOString(),
          })
          .eq('id', payment.id);

        await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.order_id);

        console.log(`Order ${payment.order_id} confirmed via Monnify`);
      }
    } else if (eventType === 'FAILED_TRANSACTION') {
      const { paymentReference } = eventData;
      await supabase
        .from('payments')
        .update({ status: 'failed', provider_response: eventData })
        .eq('reference', paymentReference);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Monnify webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}