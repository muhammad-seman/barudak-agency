'use client';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'wo', label: 'Wedding Organizer' },
  { key: 'wedding_planner', label: 'Wedding Planner' },
  { key: 'mcc', label: 'MC / Pembawa Acara' },
  { key: 'wcc', label: 'Wedding Content Creator' },
];

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function PaymentBadge({ status, nominalDibayar, harga }) {
  const map = {
    paid: ['paid', '✓ Lunas'],
    partial: ['partial', `◑ Sebagian (${formatRupiah(nominalDibayar)})`],
    unpaid: ['unpaid', '✕ Belum Bayar'],
  };
  const [cls, label] = map[status] || map.unpaid;
  return <span className={`badge badge-${cls}`}>{label}</span>;
}

function getMonthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    opts.push({ val, label });
  }
  return opts;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('wo');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthOptions = getMonthOptions();

  const fetchBookings = useCallback(() => {
    setLoading(true);
    fetch(`/api/bookings?category=${activeTab}&month=${month}`)
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false); });
  }, [activeTab, month]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleDelete = async (id) => {
    if (!confirm('Hapus booking ini?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    fetchBookings();
  };

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((s, b) => s + (b.harga || 0), 0);
  const totalMasuk = bookings.reduce((s, b) => s + (b.payment?.nominalDibayar || 0), 0);
  const sisaTagihan = totalRevenue - totalMasuk;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Data Booking</div>
            <div className="topbar-sub">Rekap booking per kategori layanan</div>
          </div>
          <Link href="/bookings/new" className="btn btn-primary">+ Tambah Booking</Link>
        </div>
        <div className="page-content">
          {/* Tabs */}
          <div className="tabs mb-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`tab-btn${activeTab === cat.key ? ' active' : ''}`}
                onClick={() => setActiveTab(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <select className="select" value={month} onChange={(e) => setMonth(e.target.value)}>
              {monthOptions.map((o) => (
                <option key={o.val} value={o.val}>{o.label}</option>
              ))}
            </select>
            <span className="text-muted">
              {totalBookings} job · {formatRupiah(totalRevenue)} tagihan · {formatRupiah(totalMasuk)} masuk · sisa {formatRupiah(sisaTagihan)}
            </span>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading">Memuat data...</div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <p>Belum ada booking {CATEGORIES.find(c => c.key === activeTab)?.label} di bulan ini.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pasangan</th>
                      <th>Kontak WA</th>
                      <th>Tanggal & Hari</th>
                      <th>Lokasi</th>
                      <th>Package</th>
                      <th>Harga</th>
                      <th>Kru</th>
                      <th>Pembayaran</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={b.id}>
                        <td className="text-muted">{i + 1}</td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{b.client?.namaPasangan || '—'}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>{b.lokasi}</div>
                        </td>
                        <td>
                          {b.client?.noWA ? (
                            <a
                              className="wa-link"
                              href={`https://wa.me/${b.client.noWA}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              💬 WhatsApp
                            </a>
                          ) : '—'}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600 }}>{b.tanggal}</div>
                          <div className="text-muted">{b.hari}</div>
                        </td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.lokasi}</td>
                        <td>
                          <span style={{ background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>
                            {b.package}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                          <div>{formatRupiah(b.harga)}</div>
                          {b.pricing?.length > 1 && (
                            <div style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {b.pricing.map(p => `${p.label}: ${formatRupiah(p.amount)}`).join(' · ')}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="crew-chips">
                            {b.crew?.length > 0
                              ? b.crew.map((c) => (
                                  <span key={c.id} className="crew-chip" title={c.jobRole}>
                                    {c.name}{c.jobRole ? ` · ${c.jobRole}` : ''}
                                  </span>
                                ))
                              : <span className="text-muted">—</span>}
                          </div>
                        </td>
                        <td>
                          <PaymentBadge
                            status={b.payment?.status}
                            nominalDibayar={b.payment?.nominalDibayar}
                            harga={b.harga}
                          />
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/bookings/${b.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
