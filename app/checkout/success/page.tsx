import { Suspense } from 'react';
import { CheckoutSuccessContent } from '@/components/checkout/CheckoutSuccessContent';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone font-body">Verifying your payment...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
