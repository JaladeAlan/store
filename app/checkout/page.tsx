'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { formatPrice, getShippingCost, getImageUrl, calculateDiscount } from '@/lib/utils';
import type { CheckoutFormData } from '@/types';
import toast from 'react-hot-toast';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
  'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [checkingDiscount, setCheckingDiscount] = useState(false);

  const [form, setForm] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'Nigeria',
    saveAddress: false,
    paymentProvider: 'paystack',
  });

  const sub = subtotal();
  const shipping = getShippingCost(sub);
  const total = sub + shipping - discountAmount;

  useEffect(() => {
    if (items.length === 0) router.push('/shop/products');
  }, [items, router]);

  const updateForm = (field: keyof CheckoutFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setCheckingDiscount(true);
    try {
      const res = await fetch(`/api/orders/discount?code=${discountCode}`);
      const data = await res.json();
      if (data.success) {
        const amount = calculateDiscount(sub, data.discount);
        setDiscountAmount(amount);
        toast.success(`Discount applied: -${formatPrice(amount)}`);
      } else {
        toast.error(data.error || 'Invalid discount code');
      }
    } catch {
      toast.error('Failed to apply discount');
    } finally {
      setCheckingDiscount(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Create order first
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.variant.id,
            quantity: item.quantity,
          })),
          formData: { ...form, discountCode: discountCode || undefined },
          discountAmount,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error);

      const { orderId } = orderData;

      // Initialize payment
      const payRes = await fetch(`/api/payments/${form.paymentProvider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email: form.email,
          amount: total,
          customerName: form.fullName,
        }),
      });

      const payData = await payRes.json();
      if (!payData.success) throw new Error(payData.error);

      // Clear cart and redirect to payment
      clearCart();
      window.location.href = payData.authorizationUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process checkout';
      toast.error(message);
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="page-enter">
      <div className="container-luxe py-10">
        <div className="mb-8">
          <p className="section-subtitle mb-2">Checkout</p>
          <h1 className="section-title">Complete Your Order</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <section>
                <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-5 pb-3 border-b border-sand">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => updateForm('fullName', e.target.value)}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className="input-field"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-5 pb-3 border-b border-sand">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={form.addressLine1}
                      onChange={(e) => updateForm('addressLine1', e.target.value)}
                      className="input-field"
                      placeholder="House number, street name"
                    />
                  </div>
                  <div>
                    <label className="label">Address Line 2</label>
                    <input
                      type="text"
                      value={form.addressLine2}
                      onChange={(e) => updateForm('addressLine2', e.target.value)}
                      className="input-field"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">City *</label>
                      <input
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                        className="input-field"
                        placeholder="Lagos"
                      />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <select
                        required
                        value={form.state}
                        onChange={(e) => updateForm('state', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select state</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.saveAddress}
                      onChange={(e) => updateForm('saveAddress', e.target.checked)}
                      className="w-4 h-4 accent-ink"
                    />
                    <span className="text-xs font-body text-stone">
                      Save this address for future orders
                    </span>
                  </label>
                </div>
              </section>

              {/* Payment */}
              <section>
                <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-5 pb-3 border-b border-sand">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      id: 'paystack',
                      name: 'Paystack',
                      description: 'Pay with card, bank transfer, or USSD',
                    },
                    {
                      id: 'monnify',
                      name: 'Monnify',
                      description: 'Pay via bank transfer or card',
                    },
                  ].map((provider) => (
                    <label
                      key={provider.id}
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-200 ${
                        form.paymentProvider === provider.id
                          ? 'border-ink bg-blush'
                          : 'border-sand hover:border-stone'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentProvider"
                        value={provider.id}
                        checked={form.paymentProvider === provider.id}
                        onChange={(e) =>
                          updateForm('paymentProvider', e.target.value)
                        }
                        className="mt-0.5 accent-ink"
                      />
                      <div>
                        <p className="text-sm font-body font-medium text-ink">
                          {provider.name}
                        </p>
                        <p className="text-xs font-body text-stone">
                          {provider.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Notes */}
              <div>
                <label className="label">Order Notes (Optional)</label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  className="input-field resize-none h-20"
                  placeholder="Any special instructions?"
                />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-blush p-6 sticky top-24">
                <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-5">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map(({ product, variant, quantity }) => {
                    const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
                    return (
                      <div key={`${product.id}-${variant.id}`} className="flex gap-3">
                        <div className="relative w-14 h-16 bg-sand flex-shrink-0 overflow-hidden">
                          {img && (
                            <Image
                              src={getImageUrl(img.url)}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          )}
                          <span className="absolute -top-1 -right-1 bg-ink text-ivory text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-body">
                            {quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-body text-ink leading-snug line-clamp-2">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-stone font-body uppercase tracking-wide mt-0.5">
                            {variant.size}
                          </p>
                          <p className="text-xs font-body font-medium text-ink mt-1">
                            {formatPrice(product.price * quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="divider mb-4" />

                {/* Discount Code */}
                <div className="mb-4">
                  <label className="label">Discount Code</label>
                  <div className="flex gap-0">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="LUXE20"
                      className="input-field flex-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={applyDiscount}
                      disabled={checkingDiscount || !discountCode}
                      className="bg-ink text-ivory px-4 text-xs font-body tracking-widest uppercase hover:bg-espresso transition-colors duration-200 disabled:opacity-50"
                    >
                      {checkingDiscount ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-stone">Subtotal</span>
                    <span>{formatPrice(sub)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-gold">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base border-t border-sand pt-3 mt-2">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6 text-xs"
                >
                  {loading
                    ? 'Processing...'
                    : `Pay ${formatPrice(total)} via ${form.paymentProvider === 'paystack' ? 'Paystack' : 'Monnify'}`}
                </button>

                <p className="text-[10px] text-stone font-body text-center mt-3">
                  🔒 Secured by SSL encryption
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
