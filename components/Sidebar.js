'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/bookings', icon: '📋', label: 'Booking' },
  { href: '/tasks', icon: '📅', label: 'Jadwal & Kru' },
  { href: '/clients', icon: '💑', label: 'Klien' },
  { href: '/crew', icon: '👥', label: 'Master Kru' },
];

// Show only 4 items in bottom nav (most important)
const bottomNavItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/bookings', icon: '📋', label: 'Booking' },
  { href: '/tasks', icon: '📅', label: 'Jadwal' },
  { href: '/clients', icon: '💑', label: 'Klien' },
  { href: '/crew', icon: '👥', label: 'Kru' },
];

function NavLinks({ onClose }) {
  const pathname = usePathname();
  return (
    <>
      <div className="nav-section">Menu</div>
      {navItems.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>💍 BarudakAgency</h1>
          <p>Wedding Management</p>
        </div>
        <nav className="sidebar-nav">
          <NavLinks onClose={() => {}} />
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: 'var(--red-bg)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)',
              color: 'var(--red)', font: '600 13px Inter', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* ── Mobile: hamburger button (rendered inside topbar via portal-like approach) ── */}
      {/* We export a separate component for the topbar trigger */}

      {/* ── Mobile drawer overlay ── */}
      <div
        className={`mobile-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>💍 BarudakAgency</h1>
            <p>Wedding Management</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', padding: 4 }}
          >×</button>
        </div>
        <nav className="sidebar-nav">
          <NavLinks onClose={() => setDrawerOpen(false)} />
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', background: 'var(--red-bg)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)',
              color: 'var(--red)', font: '600 14px Inter', cursor: 'pointer',
            }}
          >
            🚪 Keluar
          </button>
        </div>
      </div>

      {/* ── Hamburger trigger (floating, top-left on mobile) ── */}
      <button
        className="hamburger-btn"
        onClick={() => setDrawerOpen(true)}
        aria-label="Buka menu"
        style={{
          position: 'fixed', top: 11, left: 12, zIndex: 60,
        }}
      >
        ☰
      </button>

      {/* ── Bottom nav (mobile only) ── */}
      <nav className="bottom-nav">
        {bottomNavItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="bnav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
