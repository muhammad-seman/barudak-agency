'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

const CATEGORY_LABEL = {
  wo: 'Wedding Organizer',
  wedding_planner: 'Wedding Planner',
  mcc: 'MC/Pembawa Acara',
  wcc: 'Wedding Content Creator',
};

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function PaymentBadge({ status }) {
  const map = { paid: ['paid', '✓ Lunas'], partial: ['partial', '◑ Sebagian'], unpaid: ['unpaid', '✕ Belum Bayar'] };
  const [cls, label] = map[status] || map.unpaid;
  return <span className={`badge badge-${cls}`}>{label}</span>;
}

function CategoryBadge({ cat }) {
  return <span className={`badge badge-${cat}`}>{CATEGORY_LABEL[cat] || cat}</span>;
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/crew').then((r) => r.json()),
    ]).then(([b, c, cr]) => {
      setBookings(b);
      setClients(c);
      setCrew(cr);
      setLoading(false);
    });
  }, []);

  const totalRevenue = bookings.reduce((s, b) => s + (b.payment?.nominalDibayar || 0), 0);
  const pending = bookings.filter((b) => b.payment?.status !== 'paid').length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthBookings = bookings.filter((b) => b.tanggal?.startsWith(thisMonth));

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const catCount = ['wo', 'wedding_planner', 'mcc', 'wcc'].map((cat) => ({
    cat,
    count: bookings.filter((b) => b.category === cat).length,
  }));

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-sub">Selamat datang di BarudakAgency Management</div>
          </div>
          <Link href="/bookings/new" className="btn btn-primary">+ Booking Baru</Link>
        </div>
        <div className="page-content">
          {loading ? (
            <div className="loading">Memuat data...</div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💳</div>
                  <div className="stat-value">{formatRupiah(totalRevenue)}</div>
                  <div className="stat-label">Total Pendapatan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{bookings.length}</div>
                  <div className="stat-label">Total Booking</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-value">{thisMonthBookings.length}</div>
                  <div className="stat-label">Booking Bulan Ini</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💑</div>
                  <div className="stat-value">{clients.length}</div>
                  <div className="stat-label">Total Klien</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{crew.length}</div>
                  <div className="stat-label">Total Kru</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-value">{pending}</div>
                  <div className="stat-label">Belum / Sebagian Bayar</div>
                </div>
              </div>

              {/* Category counts */}
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="fw-700" style={{ fontSize: 15 }}>Booking per Kategori</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {catCount.map(({ cat, count }) => (
                    <div key={cat} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: `var(--${cat === 'wedding_planner' ? 'wp' : cat})` }}>{count}</div>
                      <CategoryBadge cat={cat} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent bookings */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="fw-700" style={{ fontSize: 15 }}>Booking Terbaru</h3>
                  <Link href="/bookings" className="btn btn-secondary btn-sm">Lihat Semua</Link>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Pasangan</th>
                        <th>Kategori</th>
                        <th>Tanggal</th>
                        <th>Lokasi</th>
                        <th>Harga</th>
                        <th>Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <Link href={`/bookings/${b.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                              {b.client?.namaPasangan || '—'}
                            </Link>
                          </td>
                          <td><CategoryBadge cat={b.category} /></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{b.hari}, {b.tanggal}</td>
                          <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.lokasi}</td>
                          <td>{formatRupiah(b.harga)}</td>
                          <td><PaymentBadge status={b.payment?.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
