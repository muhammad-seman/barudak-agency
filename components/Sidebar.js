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
  LuMenu,
  LuX,
  LuLogOut,
} from 'react-icons/lu';

const navItems = [
  { href: '/', icon: LuLayoutDashboard, label: 'Dashboard' },
  { href: '/bookings', icon: LuClipboardList, label: 'Booking' },
  { href: '/tasks', icon: LuCalendarDays, label: 'Jadwal & Kru' },
  { href: '/clients', icon: LuHeart, label: 'Klien' },
  { href: '/crew', icon: LuUsers, label: 'Master Kru' },
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
      <Image src="/images/logo.PNG" alt="Logo" width={36} height={36}
        style={{ objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
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

      {/* ── Mobile overlay ── */}
      <div className={`mobile-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

      {/* ── Mobile drawer ── */}
      <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Brand />
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <LuX size={22} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLinks onClose={() => setDrawerOpen(false)} />
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <LogoutButton />
        </div>
      </div>

      {/* ── Hamburger (fixed, mobile only) ── */}
      <button
        className="hamburger-btn"
        onClick={() => setDrawerOpen(true)}
        aria-label="Buka menu"
        style={{ position: 'fixed', top: 11, left: 12, zIndex: 60 }}
      >
        <LuMenu size={20} />
      </button>

      {/* ── Bottom nav (mobile only) ── */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`bottom-nav-item${isActive ? ' active' : ''}`}>
              <Icon size={22} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
