import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/orders';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Account' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirectTo=/account/dashboard');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const orders = await getUserOrders(user.id);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="page-enter">
      <div className="container-luxe py-10">
        <div className="mb-8">
          <p className="section-subtitle mb-2">Welcome back</p>
          <h1 className="section-title">{profile?.full_name || user.email}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Orders', value: orders.length, href: '/account/orders' },
            {
              label: 'Total Spent',
              value: formatPrice(orders.filter(o => o.payment?.status === 'paid').reduce((sum, o) => sum + o.total, 0)),
              href: '/account/orders',
            },
            { label: 'Wishlist Items', value: '—', href: '/account/wishlist' },
          ].map(({ label, value, href }) => (
            <Link key={label} href={href} className="bg-blush p-6 hover:bg-sand transition-colors duration-200">
              <p className="text-xs tracking-widest uppercase text-stone font-body mb-2">{label}</p>
              <p className="font-display text-2xl text-ink">{value}</p>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { href: '/account/orders', label: 'My Orders' },
            { href: '/account/profile', label: 'Edit Profile' },
            { href: '/account/addresses', label: 'Addresses' },
            { href: '/account/wishlist', label: 'Wishlist' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="btn-secondary text-center text-xs py-3">
              {label}
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink">
                Recent Orders
              </h2>
              <Link href="/account/orders" className="text-xs text-stone hover:text-gold font-body transition-colors duration-200">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-sand">
                    {['Order', 'Date', 'Status', 'Total', ''].map(h => (
                      <th key={h} className="text-left py-3 pr-4 text-xs tracking-widest uppercase text-stone font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-sand hover:bg-blush transition-colors duration-200">
                      <td className="py-3 pr-4 text-ink font-medium">#{order.order_number}</td>
                      <td className="py-3 pr-4 text-stone">{formatDate(order.created_at)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-ink">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        <Link href={`/account/orders/${order.id}`} className="text-xs text-stone hover:text-gold transition-colors duration-200">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
