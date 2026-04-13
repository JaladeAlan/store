import { createAdminClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Users' };

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: users, count } = await supabase
    .from('users')
    .select('*, orders:orders(id)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Users</h1>
        <p className="text-sm text-stone font-body mt-1">{count ?? 0} registered customers</p>
      </div>

      <div className="bg-white border border-sand overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-blush">
            <tr>
              {['Name', 'Email', 'Phone', 'Role', 'Orders', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs tracking-widest uppercase text-stone font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t border-sand hover:bg-blush/50 transition-colors duration-200">
                <td className="py-3 px-4 font-medium text-ink">{user.full_name || '—'}</td>
                <td className="py-3 px-4 text-stone">{user.email}</td>
                <td className="py-3 px-4 text-stone">{user.phone || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm ${
                    user.role === 'admin' ? 'bg-gold/20 text-gold-dark' : 'bg-blush text-stone'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-stone">{(user.orders as { id: string }[])?.length ?? 0}</td>
                <td className="py-3 px-4 text-stone text-xs">{formatDate(user.created_at)}</td>
                <td className="py-3 px-4">
                  <a href={`/admin/users/${user.id}`} className="text-xs text-gold hover:text-gold-dark transition-colors duration-200">
                    View →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}