'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  LuCreditCard, LuClipboardList, LuCalendarDays, LuHeart,
  LuUsers, LuClock, LuPlus, LuMessageCircle,
  LuCircleCheck, LuCircleDot, LuCircleX,
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

function PaymentBadge({ status }) {
  const map = {
    paid: ['paid', <><LuCircleCheck size={10} /> Lunas</>],
    partial: ['partial', <><LuCircleDot size={10} /> Sebagian</>],
    unpaid: ['unpaid', <><LuCircleX size={10} /> Belum Bayar</>],
  };
  const [cls, label] = map[status] || map.unpaid;
  return <span className={`badge badge-${cls}`}>{label}</span>;
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
  const [loading, setLoading] = useState(true);

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
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const catCount = ['wo', 'wedding_planner', 'mcc', 'wcc'].map((cat) => ({
    cat, count: bookings.filter((b) => b.category === cat).length,
  }));

  const stats = [
    { label: 'Total Pendapatan', value: formatRupiah(totalRevenue) },
    { label: 'Total Booking', value: bookings.length },
    { label: 'Booking Bulan Ini', value: thisMonthBookings.length },
    { label: 'Total Klien', value: clients.length },
    { label: 'Total Kru', value: crew.length },
    { label: 'Belum / Sebagian Bayar', value: pending },
  ];

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

              {/* Category counts */}
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

              {/* Recent bookings */}
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
                          <th>Kategori</th>
                          <th>Tanggal</th>
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
                            <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatRupiah(b.harga)}</td>
                            <td><PaymentBadge status={b.payment?.status} /></td>
                          </tr>
                        ))}
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
