import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirectTo=/admin');

  const { data: profile } = await supabase.from('users').select('role, full_name').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Sidebar */}
      <aside className="w-56 bg-ink text-ivory flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-stone/20">
          <Link href="/" className="font-display text-xl tracking-[0.2em] text-ivory hover:text-gold-light transition-colors duration-300">
            LUXE
          </Link>
          <p className="text-[10px] tracking-widest uppercase text-stone mt-1 font-body">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase font-body text-stone hover:text-ivory hover:bg-stone/10 transition-all duration-200"
            >
              <Icon size={14} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-stone/20">
          <p className="text-[11px] text-stone font-body mb-3 px-3 truncate">{profile?.full_name || user.email}</p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase font-body text-stone hover:text-ivory transition-colors duration-200 w-full"
            >
              <LogOut size={14} strokeWidth={1.5} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
