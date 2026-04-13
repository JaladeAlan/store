'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

type Status = 'loading' | 'success' | 'failed';

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const provider = searchParams.get('provider') as 'paystack' | 'monnify';

  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!reference || !provider) {
      setStatus('failed');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/payments/verify?reference=${reference}&provider=${provider}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verify();
  }, [reference, provider]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={32} className="text-gold animate-spin mx-auto mb-6" />
          <h1 className="font-display text-2xl text-ink mb-2">Confirming your order</h1>
          <p className="text-sm text-stone font-body">Please wait while we verify your payment…</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <XCircle size={48} className="text-red-400 mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-display text-3xl text-ink mb-3">Payment Failed</h1>
          <p className="text-sm text-stone font-body mb-8 leading-relaxed">
            We couldn't verify your payment. Your order may not have been placed.
            Please try again or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/checkout" className="btn-primary">
              Try Again
            </Link>
            <Link href="/pages/contact" className="btn-secondary">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="text-center max-w-lg px-6">
        <CheckCircle size={56} className="text-gold mx-auto mb-6" strokeWidth={1} />

        <p className="section-subtitle mb-3">Order Confirmed</p>
        <h1 className="font-display text-4xl text-ink mb-4">
          Thank you for your order.
        </h1>

        {order && (
          <>
            <p className="text-sm text-stone font-body mb-2">
              Order <span className="text-ink font-medium">#{order.order_number}</span>
            </p>
            <p className="text-sm text-stone font-body mb-8 leading-relaxed">
              We've received your order and will begin processing it shortly.
              A confirmation email will be sent to you.
            </p>

            {/* Order summary */}
            <div className="bg-blush p-6 text-left mb-8 space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm font-body">
                  <span className="text-stone">
                    {item.product?.name} × {item.quantity}
                    {item.variant && (
                      <span className="text-[11px] uppercase tracking-wide ml-1">
                        ({item.variant.size})
                      </span>
                    )}
                  </span>
                  <span className="text-ink">{formatPrice(item.total_price)}</span>
                </div>
              ))}
              <div className="border-t border-sand pt-3 flex justify-between text-sm font-body font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/orders" className="btn-primary">
            Track Your Order
          </Link>
          <Link href="/shop/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
