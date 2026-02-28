'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/bookings', icon: '📋', label: 'Booking' },
  { href: '/tasks', icon: '📅', label: 'Jadwal & Kru' },
  { href: '/clients', icon: '💑', label: 'Klien' },
  { href: '/crew', icon: '👥', label: 'Master Kru' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>💍 BarudakAgency</h1>
        <p>Wedding Management</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">Menu</div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${isActive ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
