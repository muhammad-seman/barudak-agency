'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LuLayoutDashboard,
  LuClipboardList,
  LuCalendarDays,
  LuHeart,
  LuUsers,
  LuX,
  LuLogOut,
  LuUser,
  LuSettings,
} from 'react-icons/lu';

const navItems = [
  { href: '/dashboard', icon: LuLayoutDashboard, label: 'Dashboard' },
  { href: '/bookings', icon: LuClipboardList, label: 'Booking' },
  { href: '/tasks', icon: LuCalendarDays, label: 'Jadwal & Kru' },
  { href: '/clients', icon: LuHeart, label: 'Klien' },
  { href: '/crew', icon: LuUsers, label: 'Master Kru' },
  { href: '/settings', icon: LuSettings, label: 'Setting' },
];

function NavLinks({ onClose }) {
  const pathname = usePathname();
  return (
    <>
      <div className="nav-section">Menu</div>
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function LogoutButton({ style }) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };
  return (
    <button onClick={handleLogout} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 12px', background: 'var(--red-bg)',
      border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)',
      color: 'var(--red)', fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
      cursor: 'pointer', transition: 'background 0.15s',
      ...style,
    }}>
      <LuLogOut size={15} /> Keluar
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const Brand = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Logo Removed */}
      <div>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--gold)', lineHeight: 1.1 }}>BarudakAgency</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wedding Mgmt</div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand"><Brand /></div>
        <nav className="sidebar-nav">
          <NavLinks onClose={() => {}} />
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile topbar title will now align left naturally */}

      {/* ── Bottom nav (mobile only) ── */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          let label = item.label;
          if (label === 'Master Kru') label = 'Master';
          if (label === 'Jadwal & Kru') label = 'Jadwal';

          return (
            <Link key={item.href} href={item.href} className={`bottom-nav-item${isActive ? ' active' : ''}`}>
              <Icon size={20} />
              <span style={{ fontSize: 10 }}>{label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
