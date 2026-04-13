import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/orders';
import { formatPrice, formatDate, getStatusColor, getImageUrl } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Orders' };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const orders = await getUserOrders(user.id);

  return (
    <div className="page-enter">
      <div className="container-luxe py-10">
        <div className="mb-8">
          <p className="section-subtitle mb-2">Account</p>
          <h1 className="section-title">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-ink mb-3">No orders yet</p>
            <p className="text-sm text-stone font-body mb-8">Start shopping to see your orders here.</p>
            <Link href="/shop/products" className="btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-sand p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-sand">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs tracking-widest uppercase text-stone font-body">Order</p>
                      <p className="text-sm font-body font-medium text-ink">#{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-stone font-body">Placed</p>
                      <p className="text-sm font-body text-ink">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-stone font-body">Total</p>
                      <p className="text-sm font-body font-medium text-ink">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-[10px] tracking-widest uppercase rounded-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <Link href={`/account/orders/${order.id}`} className="btn-secondary text-xs py-2 px-4">
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex gap-3 flex-wrap">
                  {order.items?.slice(0, 4).map((item) => {
                    const img = item.product?.images?.find((i) => i.is_primary) ?? item.product?.images?.[0];
                    return (
                      <div key={item.id} className="relative w-14 h-16 bg-blush overflow-hidden flex-shrink-0">
                        {img && (
                          <Image
                            src={getImageUrl(img.url)}
                            alt={item.product?.name || ''}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        )}
                      </div>
                    );
                  })}
                  {(order.items?.length ?? 0) > 4 && (
                    <div className="w-14 h-16 bg-blush flex items-center justify-center">
                      <span className="text-xs text-stone font-body">+{(order.items?.length ?? 0) - 4}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
