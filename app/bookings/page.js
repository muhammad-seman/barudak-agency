'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import ConfirmDialog from '@/components/ConfirmDialog';
import Link from 'next/link';
import {
  LuPlus, LuMessageCircle, LuPencil, LuTrash2,
  LuCircleCheck, LuCircleDot, LuCircleX, LuClipboardList,
  LuChevronDown, LuChevronUp, LuList, LuCalendarDays, LuPrinter, LuUser, LuFileText
} from 'react-icons/lu';

const CATEGORIES = [
  { key: 'wo', label: 'Wedding Organizer' },
  { key: 'wedding_planner', label: 'Wedding Planner' },
  { key: 'mcc', label: 'MC / Pembawa Acara' },
  { key: 'wcc', label: 'Wedding Content Creator' },
];

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function PaymentBadge({ status, nominalDibayar }) {
  const map = {
    paid: ['paid', <><LuCircleCheck size={10} /> Lunas</>],
    partial: ['partial', <><LuCircleDot size={10} /> Sebagian ({formatRupiah(nominalDibayar)})</>],
    unpaid: ['unpaid', <><LuCircleX size={10} /> Belum Bayar</>],
  };
  const [cls, label] = map[status] || map.unpaid;
  return <span className={`badge badge-${cls}`}>{label}</span>;
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, i) => (currentYear - 2 + i).toString());
}

function getMonthList() {
  return [
    { val: '01', label: 'Januari' }, { val: '02', label: 'Februari' }, { val: '03', label: 'Maret' },
    { val: '04', label: 'April' }, { val: '05', label: 'Mei' }, { val: '06', label: 'Juni' },
    { val: '07', label: 'Juli' }, { val: '08', label: 'Agustus' }, { val: '09', label: 'September' },
    { val: '10', label: 'Oktober' }, { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
  ];
}

export default function BookingsPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients);
  }, []);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    let url = `/api/bookings?`;
    if (selectedCategories.length > 0) url += `category=${selectedCategories.join(',')}&`;
    if (selectedYear || selectedMonth) url += `month=${selectedYear || '-'}-${selectedMonth || '-'}&`;
    if (selectedClient !== 'all') url += `clientId=${selectedClient}&`;
    
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        // Sort descending by created date
        data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(data);
        setLoading(false);
      });
  }, [selectedCategories, selectedClient, selectedYear, selectedMonth]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleDelete = async () => {
    if (!deleteId || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/bookings/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchBookings();
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="topbar-sub">Seluruh riwayat event dan tagihan klien</div>
          </div>
          <Link href="/bookings/new" className="btn btn-primary"><LuPlus size={15} /> Tambah</Link>
        </div>
        
        <div className="page-content">
          <div className="toolbar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div className="flex gap-2">
              <select className="select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ minWidth: 130 }}>
                <option value="">Semua Bulan</option>
                {getMonthList().map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
              <select className="select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ minWidth: 100 }}>
                <option value="">Semua Tahun</option>
                {getYearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <select className="select" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} style={{ minWidth: 180 }}>
              <option value="all">Semua Klien</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.namaPasangan}</option>)}
            </select>

            <div className="badge badge-secondary mobile-full-width" style={{ marginLeft: 'auto', padding: '10px 16px', fontSize: 13, border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 800, color: 'var(--gold)' }}>{bookings.length}</span> event · sisa tagihan <span style={{ fontWeight: 800, color: 'var(--gold)' }}>{formatRupiah(sisaTagihan)}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
            <span className="text-muted" style={{ fontSize: 13, alignSelf: 'center', marginRight: 4 }}>Filter Layanan:</span>
            {CATEGORIES.map(c => {
              const isActive = selectedCategories.includes(c.key);
              return (
                <button 
                  key={c.key} 
                  className={`badge ${isActive ? 'badge-wo' : ''}`}
                  style={{ 
                    cursor: 'pointer', 
                    opacity: isActive ? 1 : 0.6, 
                    border: '1px solid var(--border)',
                    background: isActive ? undefined : 'var(--bg-secondary)',
                    color: isActive ? undefined : 'var(--text-primary)'
                  }}
                  onClick={() => {
                    if (isActive) setSelectedCategories(selectedCategories.filter(k => k !== c.key));
                    else setSelectedCategories([...selectedCategories, c.key]);
                  }}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          <div className="card" style={{ padding: 0 }}>
            {loading ? <div className="loading">Memuat data...</div>
              : bookings.length === 0 ? (
                <div className="empty-state">
                  <LuClipboardList size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-muted)' }} />
                  <p>Belum ada event booking ditemukan untuk filter ini.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th className="hidden-mobile" style={{ width: 40 }}>#</th>
                        <th style={{ minWidth: 140 }}>Pasangan</th>
                        <th className="hidden-mobile" style={{ minWidth: 150 }}>WhatsApp Client</th>
                        <th style={{ minWidth: 120 }}>Tanggal</th>
                        <th className="hidden-mobile" style={{ minWidth: 140 }}>Layanan</th>
                        <th className="hidden-mobile">Lokasi</th>
                        <th className="hidden-mobile">Package WO</th>
                        <th className="hidden-mobile" style={{ minWidth: 130 }}>Harga Total</th>
                        <th className="hidden-mobile" style={{ minWidth: 80 }}>Kru</th>
                        <th className="hidden-mobile" style={{ minWidth: 130 }}>Status</th>
                        <th className="hidden-mobile" style={{ width: 130 }}>Aksi</th>
                        <th className="hidden-desktop" style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => {
                        const allCategories = b.categories?.length > 0 ? b.categories : (b.category ? [b.category] : []);
                        return (
                          <React.Fragment key={b.id}>
                            <tr onClick={() => toggleExpand(b.id)} style={{ cursor: 'pointer' }}>
                              <td className="text-muted hidden-mobile">{i + 1}</td>
                              <td>
                                <div style={{ fontWeight: 700 }}>{b.client?.namaPasangan || '—'}</div>
                                <div className="text-muted" style={{ fontSize: 11 }}>{b.catatan}</div>
                              </td>
                              <td className="hidden-mobile">
                                {b.client?.noWA ? (
                                  <a className="wa-link" href={`https://wa.me/${b.client.noWA}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                    <LuMessageCircle size={14} /> WA
                                  </a>
                                ) : '—'}
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 600 }}>{b.tanggal}</div>
                                <div className="text-muted">{b.hari}</div>
                              </td>
                              <td className="hidden-mobile">
                                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                                  {allCategories.map(cat => (
                                    <span key={cat} className="badge badge-wo" style={{ fontSize: 10, padding: '2px 6px' }}>
                                      {CATEGORIES.find(c => c.key === cat)?.label || cat}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="hidden-mobile" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.lokasi}</td>
                              <td className="hidden-mobile">
                                <span style={{ background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>
                                  {b.package}
                                </span>
                              </td>
                              <td className="hidden-mobile" style={{ fontWeight: 600, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                                <div>{formatRupiah(b.harga)}</div>
                                {b.pricing?.length > 1 && (
                                  <div style={{ fontWeight: 400, fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {b.pricing.map((p, idx) => `${p.label}: ${formatRupiah(p.amount)}`).join(' · ')}
                                  </div>
                                )}
                              </td>
                              <td className="hidden-mobile">
                                <div className="crew-chips">
                                  {b.crew?.length > 0
                                    ? b.crew.map((c, idx) => (
                                        <span key={`${c.id}-${idx}`} className="crew-chip" title={c.jobRole}>
                                          {c.name}{c.jobRole ? ` · ${c.jobRole}` : ''}
                                        </span>
                                      ))
                                    : <span className="text-muted">—</span>}
                                </div>
                              </td>
                              <td className="hidden-mobile">
                                <PaymentBadge status={b.payment?.status} nominalDibayar={b.payment?.nominalDibayar} />
                              </td>
                              <td className="hidden-mobile">
                                <div className="flex gap-2" style={{ whiteSpace: 'nowrap' }}>
                                  <button 
                                    className="btn btn-secondary btn-sm" 
                                    title="Download Info PDF"
                                    onClick={(e) => { e.stopPropagation(); window.open(`/bookings/print/${b.id}`, '_blank'); }}
                                  >
                                    <LuFileText size={14} />
                                  </button>
                                  <Link href={`/bookings/${b.id}`} className="btn btn-secondary btn-sm" onClick={(e) => e.stopPropagation()}><LuPencil size={12} /></Link>
                                  <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(b.id); }}><LuTrash2 size={12} /></button>
                                </div>
                              </td>
                              <td className="mobile-chevron-td hidden-desktop">
                                <div className="mobile-chevron">
                                  {expandedId === b.id ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                                </div>
                              </td>
                            </tr>
                            {expandedId === b.id && (
                              <tr className="accordion-row hidden-desktop">
                                <td colSpan={12} style={{ padding: 0 }}>
                                  <div className="accordion-content">
                                    <div className="accordion-item">
                                      <span className="accordion-label">Status Bayar</span>
                                      <span className="accordion-value">
                                        <PaymentBadge status={b.payment?.status} nominalDibayar={b.payment?.nominalDibayar} />
                                      </span>
                                    </div>
                                    <div className="accordion-item">
                                      <span className="accordion-label">Kategori Layanan</span>
                                      <span className="accordion-value">
                                        <div className="flex gap-1" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                          {allCategories.map(cat => (
                                            <span key={cat} className="badge badge-wo" style={{ fontSize: 10, padding: '2px 6px' }}>
                                              {CATEGORIES.find(c => c.key === cat)?.label || cat}
                                            </span>
                                          ))}
                                        </div>
                                      </span>
                                    </div>
                                    <div className="accordion-item">
                                      <span className="accordion-label">Harga Total</span>
                                      <span className="accordion-value" style={{ color: 'var(--gold)' }}>
                                        <div>{formatRupiah(b.harga)}</div>
                                      </span>
                                    </div>
                                    <div className="accordion-item">
                                      <span className="accordion-label">Package WO</span>
                                      <span className="accordion-value">{b.package}</span>
                                    </div>
                                    <div className="accordion-item">
                                      <span className="accordion-label">Kru Bertugas</span>
                                      <span className="accordion-value">
                                        <div className="crew-chips" style={{ justifyContent: 'flex-end' }}>
                                          {b.crew?.length > 0
                                            ? b.crew.map((c, idx) => (
                                                <span key={`${c.id}-${idx}`} className="crew-chip" title={c.jobRole}>
                                                  {c.name}{c.jobRole ? ` · ${c.jobRole}` : ''}
                                                </span>
                                              ))
                                            : <span className="text-muted">—</span>}
                                        </div>
                                      </span>
                                    </div>
                                    <div className="accordion-item">
                                      <span className="accordion-label">WhatsApp Client</span>
                                      <span className="accordion-value">
                                        {b.client?.noWA ? (
                                          <a className="wa-link" href={`https://wa.me/${b.client.noWA}`} target="_blank" rel="noreferrer">
                                            {b.client.noWA}
                                          </a>
                                        ) : '—'}
                                      </span>
                                    </div>
                                    <div className="accordion-item" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
                                      <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={(e) => { e.stopPropagation(); window.open(`/bookings/print/${b.id}`, '_blank'); }}
                                        style={{ flex: 1, justifyContent: 'center' }}
                                      >
                                        <LuFileText size={14} /> Info
                                      </button>
                                      <Link href={`/bookings/${b.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                                        <LuPencil size={14} /> Edit
                                      </Link>
                                      <button 
                                        className="btn btn-danger btn-sm" 
                                        style={{ flex: 1, justifyContent: 'center' }}
                                        onClick={(e) => { e.stopPropagation(); setDeleteId(b.id); }}
                                      >
                                        <LuTrash2 size={14} /> Hapus
                                      </button>
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
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Event Booking"
        message={`Apakah Anda yakin ingin menghapus data event booking beserta layanannya? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
