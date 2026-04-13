import { createAdminClient } from '@/lib/supabase/server';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { AdminOrderActions } from '@/components/admin/AdminOrderActions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Orders' };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createAdminClient();
  const page = Number(params.page || 1);
  const pageSize = 20;

  let query = supabase
    .from('orders')
    .select(`
      *,
      user:users(full_name, email),
      payment:payments(status, provider),
      items:order_items(id)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (params.status) query = query.eq('status', params.status);

  const { data: orders, count } = await query;

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <p className="text-sm text-stone font-body mt-1">{count ?? 0} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        <a
          href="/admin/orders"
          className={`px-3 py-1.5 text-xs tracking-widest uppercase font-body transition-colors duration-200 ${
            !params.status ? 'bg-ink text-ivory' : 'border border-sand text-stone hover:text-ink'
          }`}
        >
          All
        </a>
        {statuses.map((s) => (
          <a
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 text-xs tracking-widest uppercase font-body transition-colors duration-200 ${
              params.status === s ? 'bg-ink text-ivory' : 'border border-sand text-stone hover:text-ink'
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <div className="bg-white border border-sand overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-blush">
            <tr>
              {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-t border-sand hover:bg-blush/50 transition-colors duration-200">
                <td className="py-3 px-4 font-medium text-ink">#{order.order_number}</td>
                <td className="py-3 px-4">
                  <div className="text-ink">{(order.user as { full_name?: string } | null)?.full_name || '—'}</div>
                  <div className="text-[11px] text-stone">{(order.user as { email?: string } | null)?.email}</div>
                </td>
                <td className="py-3 px-4 text-stone">{(order.items as { id: string }[])?.length ?? 0}</td>
                <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className={`px-1.5 py-0.5 text-[9px] tracking-widest uppercase rounded-sm w-fit ${
                      getStatusColor((order.payment as { status?: string } | null)?.status || 'pending')
                    }`}>
                      {(order.payment as { status?: string } | null)?.status || 'pending'}
                    </span>
                    <span className="text-[10px] text-stone capitalize">
                      {(order.payment as { provider?: string } | null)?.provider || '—'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-stone text-xs">{formatDate(order.created_at)}</td>
                <td className="py-3 px-4">
                  <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {count && count > pageSize && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(count / pageSize) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/orders?page=${p}${params.status ? `&status=${params.status}` : ''}`}
              className={`w-9 h-9 flex items-center justify-center text-xs font-body transition-all duration-200 ${
                p === page ? 'bg-ink text-ivory' : 'border border-sand text-stone hover:border-ink hover:text-ink'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
