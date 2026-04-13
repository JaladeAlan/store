import { createAdminClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const supabase = await createAdminClient();

  // Fetch stats in parallel
  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalUsers },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'paid'),
  ]);

  const totalRevenue = revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, total, status, created_at, user:users(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(10);

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), color: 'bg-gold/10 text-gold-dark' },
    { label: 'Total Orders', value: totalOrders ?? 0, color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Products', value: totalProducts ?? 0, color: 'bg-green-50 text-green-700' },
    { label: 'Customers', value: totalUsers ?? 0, color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Dashboard</h1>
        <p className="text-sm text-stone font-body mt-1">Overview of your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-sand p-5">
            <p className="text-xs tracking-widest uppercase text-stone font-body mb-2">{label}</p>
            <p className={`font-display text-2xl ${color.split(' ')[1]}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-4">
          Recent Orders
        </h2>
        <div className="bg-white border border-sand overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-blush">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-t border-sand hover:bg-blush/50 transition-colors duration-200">
                  <td className="py-3 px-4 font-medium">#{order.order_number}</td>
                  <td className="py-3 px-4 text-stone">{(order.user as { full_name?: string; email?: string } | null)?.full_name || (order.user as { email?: string } | null)?.email}</td>
                  <td className="py-3 px-4">{formatPrice(order.total)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-NG')}
                  </td>
                  <td className="py-3 px-4">
                    <a href={`/admin/orders/${order.id}`} className="text-xs text-gold hover:text-gold-dark transition-colors duration-200">
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
