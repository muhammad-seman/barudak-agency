'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  LuCreditCard, LuClipboardList, LuCalendarDays, LuHeart,
  LuUsers, LuClock, LuPlus, LuChevronDown, LuChevronUp,
} from 'react-icons/lu';

const CATEGORY_LABEL = {
  wo: 'Wedding Organizer',
  wedding_planner: 'Wedding Planner',
  mcc: 'MC / Pembawa Acara',
  wcc: 'Wedding Content Creator',
};

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function CategoryBadge({ cat }) {
  return <span className={`badge badge-${cat}`}>{CATEGORY_LABEL[cat] || cat}</span>;
}

const STAT_ICONS = [
  { icon: LuCreditCard, color: 'var(--gold)' },
  { icon: LuClipboardList, color: 'var(--wo)' },
  { icon: LuCalendarDays, color: 'var(--mcc)' },
  { icon: LuHeart, color: 'var(--wp)' },
  { icon: LuUsers, color: 'var(--wcc)' },
  { icon: LuClock, color: 'var(--red)' },
];

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [crew, setCrew] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/crew').then((r) => r.json()),
    ]).then(([b, c, cr]) => {
      setBookings(b); setClients(c); setCrew(cr); setLoading(false);
    });
  }, []);

  const totalRevenue = bookings.reduce((s, b) => s + (b.payment?.nominalDibayar || 0), 0);
  const pending = bookings.filter((b) => b.payment?.status !== 'paid').length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthBookings = bookings.filter((b) => b.tanggal?.startsWith(thisMonth));
  
  const catCount = ['wo', 'wedding_planner', 'mcc', 'wcc'].map((cat) => ({
    cat, count: bookings.filter((b) => b.categories?.includes(cat)).length,
  }));

  const stats = [
    { label: 'Total Pendapatan', value: formatRupiah(totalRevenue) },
    { label: 'Total Booking', value: bookings.length },
    { label: 'Booking Bulan Ini', value: thisMonthBookings.length },
    { label: 'Total Klien', value: clients.length },
    { label: 'Total Kru', value: crew.length },
    { label: 'Belum / Sebagian Bayar', value: pending },
  ];

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-sub">Selamat datang di BarudakAgency</div>
          </div>
          <Link href="/bookings/new" className="btn btn-primary">
            <LuPlus size={15} /> Booking Baru
          </Link>
        </div>
        <div className="page-content">
          {loading ? <div className="loading">Memuat data...</div> : (
            <>
              <div className="stats-grid">
                {stats.map((s, i) => {
                  const { icon: Icon, color } = STAT_ICONS[i];
                  return (
                    <div key={i} className="stat-card">
                      <Icon size={22} style={{ color, marginBottom: 8 }} />
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="card mb-6">
                <div className="fw-700 mb-4" style={{ fontSize: 15 }}>Booking per Kategori</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                  {catCount.map(({ cat, count }) => (
                    <div key={cat} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: `var(--${cat === 'wedding_planner' ? 'wp' : cat})`, marginBottom: 6 }}>{count}</div>
                      <CategoryBadge cat={cat} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="fw-700" style={{ fontSize: 15 }}>Booking Terbaru</div>
                  <Link href="/bookings" className="btn btn-secondary btn-sm">Lihat Semua</Link>
                </div>
                {recentBookings.length === 0 ? (
                  <div className="empty-state"><div className="icon"><LuClipboardList size={36} /></div><p>Belum ada booking.</p></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Pasangan</th>
                          <th className="hidden-mobile">Kategori</th>
                          <th>Tanggal</th>
                          <th className="hidden-mobile">Harga</th>
                          <th className="hidden-desktop" style={{ width: 40, padding: 0 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => {
                          const allCategories = b.categories?.length > 0 ? b.categories : (b.category ? [b.category] : []);
                          return (
                            <React.Fragment key={b.id}>
                              <tr onClick={() => toggleExpand(b.id)} style={{ cursor: 'pointer' }}>
                                <td>
                                  <Link href={`/bookings/${b.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                                    {b.client?.namaPasangan || '—'}
                                  </Link>
                                </td>
                                <td className="hidden-mobile">
                                  <div className="flex gap-1">
                                    {allCategories.map(c => <CategoryBadge key={c} cat={c} />)}
                                  </div>
                                </td>
                                <td style={{ whiteSpace: 'nowrap' }}>{b.hari}, {b.tanggal}</td>
                                <td className="hidden-mobile" style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatRupiah(b.harga)}</td>
                                <td className="mobile-chevron-td hidden-desktop">
                                  <div className="mobile-chevron">
                                    {expandedId === b.id ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                                  </div>
                                </td>
                              </tr>
                              {expandedId === b.id && (
                                <tr className="accordion-row hidden-desktop">
                                  <td colSpan={5} style={{ padding: 0 }}>
                                    <div className="accordion-content">
                                      <div className="accordion-item">
                                        <span className="accordion-label">Kategori</span>
                                        <span className="accordion-value">
                                          <div className="flex gap-1" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            {allCategories.map(c => <CategoryBadge key={c} cat={c} />)}
                                          </div>
                                        </span>
                                      </div>
                                      <div className="accordion-item">
                                        <span className="accordion-label">Harga</span>
                                        <span className="accordion-value" style={{ color: 'var(--gold)' }}>{formatRupiah(b.harga)}</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
