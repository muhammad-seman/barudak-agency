'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  LuMessageCircle, LuMapPin, LuStickyNote, LuPlus, LuPencil,
  LuCircleCheck, LuCircleDot, LuCircleX, LuCalendarDays,
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

function PaymentBadge({ status, nominalDibayar }) {
  const map = {
    paid: ['paid', <><LuCircleCheck size={10} /> Lunas</>],
    partial: ['partial', <><LuCircleDot size={10} /> Sebagian · {formatRupiah(nominalDibayar)}</>],
    unpaid: ['unpaid', <><LuCircleX size={10} /> Belum Bayar</>],
  };
  const [cls, label] = map[status] || map.unpaid;
  return <span className={`badge badge-${cls}`}>{label}</span>;
}

function getMonthOptions() {
  const opts = [{ val: '', label: 'Semua Bulan' }];
  const now = new Date();
  for (let i = -1; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({ val: d.toISOString().slice(0, 7), label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) });
  }
  return opts;
}

export default function TasksPage() {
  const [groups, setGroups] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = month ? `?month=${month}` : '';
    fetch(`/api/tasks${q}`).then((r) => r.json()).then((g) => { setGroups(g); setLoading(false); });
  }, [month]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      dayName: d.toLocaleDateString('id-ID', { weekday: 'long' }),
      dayNum: d.getDate(),
      monthYear: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
    };
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Jadwal & Penugasan Kru</div>
            <div className="topbar-sub">Job dikelompokkan per tanggal dan klien</div>
          </div>
          <Link href="/bookings/new" className="btn btn-primary"><LuPlus size={15} /> Booking Baru</Link>
        </div>
        <div className="page-content">
          <div className="toolbar">
            <select className="select" value={month} onChange={(e) => setMonth(e.target.value)}>
              {getMonthOptions().map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
            <span className="text-muted">{groups.length} event · {groups.reduce((s,g)=>s+g.bookings.length,0)} layanan</span>
          </div>

          {loading ? <div className="loading">Memuat jadwal...</div>
          : groups.length === 0 ? (
            <div className="empty-state">
              <LuCalendarDays size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-muted)' }} />
              <p>Tidak ada jadwal di bulan ini.</p>
            </div>
          ) : groups.map((group) => {
            const { dayName, dayNum, monthYear } = formatDate(group.tanggal);
            return (
              <div key={`${group.tanggal}-${group.clientId}`} className="task-date-group">
                <div className="task-date-header">
                  <div className="task-date-badge">
                    <div className="day-name">{dayName.slice(0, 3)}</div>
                    <div className="day-num">{dayNum}</div>
                    <div className="month-year">{monthYear}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{group.client?.namaPasangan || 'Klien tidak diketahui'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>{group.bookings.length} layanan</span>
                      {group.client?.noWA && (
                        <a className="wa-link" href={`https://wa.me/${group.client.noWA}`} target="_blank" rel="noreferrer">
                          <LuMessageCircle size={13} /> WA Klien
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="task-client-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    <LuMapPin size={13} />
                    <span>{group.bookings[0]?.lokasi}</span>
                  </div>

                  <div className="task-services">
                    {group.bookings.map((b) => (
                      <div key={b.id} className={`task-service-row ${b.category}`}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <span className={`badge badge-${b.category}`}>{CATEGORY_LABEL[b.category]}</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{b.package}</span>
                            <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 13 }}>
                              {formatRupiah(b.harga)}
                              {b.pricing?.length > 1 && (
                                <span style={{ fontWeight: 400, fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>
                                  {b.pricing.map(p => `${p.label}: ${formatRupiah(p.amount)}`).join(' · ')}
                                </span>
                              )}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Kru:</span>
                              {b.crew?.length > 0 ? (
                                <div className="crew-chips" style={{ display: 'inline-flex' }}>
                                  {b.crew.map((c) => (
                                    <span key={c.id} className="crew-chip">
                                      <strong>{c.jobRole || c.role}</strong>: {c.name}
                                    </span>
                                  ))}
                                </div>
                              ) : <span className="text-muted" style={{ fontSize: 12 }}>Belum ada kru</span>}
                            </div>
                            <PaymentBadge status={b.payment?.status} nominalDibayar={b.payment?.nominalDibayar} />
                          </div>
                          {b.catatan && (
                            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <LuStickyNote size={12} /> {b.catatan}
                            </div>
                          )}
                        </div>
                        <Link href={`/bookings/${b.id}`} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                          <LuPencil size={12} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
