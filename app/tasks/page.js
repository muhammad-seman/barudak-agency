'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  LuPlus, LuPencil, LuChevronLeft, LuChevronRight, LuCalendarDays
} from 'react-icons/lu';

const CATEGORY_LABEL = {
  wo: 'Wedding Organizer',
  wedding_planner: 'Wedding Planner',
  mcc: 'MC / Pembawa Acara',
  wcc: 'Wedding Content Creator',
};

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function TasksPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [calDate, setCalDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  const prevMonth = () => setCalDate(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCalDate(new Date(calYear, calMonth + 1, 1));

  const monthStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks?month=${monthStr}`)
      .then((r) => r.json())
      .then((g) => { setBookings(g); setLoading(false); });
  }, [monthStr]);

  const getGroupsForDate = (dateStr) =>
    bookings.filter(g => g.tanggal === dateStr);

  const shortenName = (name) => {
    if (!name) return 'K';
    return name.trim().charAt(0).toUpperCase();
  };

  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Jadwal &amp; Kalender Event</div>
            <div className="topbar-sub">Semua jadwal dalam sebulan</div>
          </div>
          <Link href="/bookings/new" className="btn btn-primary"><LuPlus size={15} /> Booking Baru</Link>
        </div>

        <div className="page-content">
          {/* ─── TOOLBAR / FILTERS ─── */}
          <div className="toolbar" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', 
              padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <button className="btn-nav" onClick={prevMonth} aria-label="Bulan Sebelumnya">
                <LuChevronLeft size={20} />
              </button>
              <div style={{ fontWeight: 800, fontSize: 16, minWidth: 160, textAlign: 'center', color: 'var(--text-primary)' }}>
                {MONTH_NAMES[calMonth]} {calYear}
              </div>
              <button className="btn-nav" onClick={nextMonth} aria-label="Bulan Berikutnya">
                <LuChevronRight size={20} />
              </button>
            </div>
          </div>

          <style>{`
            .btn-nav {
              background: transparent; border: none; color: var(--text-secondary);
              width: 38px; height: 38px; display: flex; alignItems: center; justifyContent: center;
              cursor: pointer; border-radius: 6px; transition: 0.2s;
            }
            .btn-nav:hover { background: var(--bg-hover); color: var(--gold); }
            
            .calendar-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              background: var(--border);
              gap: 1px;
              border: 1px solid var(--border);
              border-radius: var(--radius);
              overflow: hidden;
            }
            .calendar-day-head {
              background: var(--bg-secondary);
              text-align: center; padding: 12px 4px; font-size: 11px;
              fontWeight: 700; color: var(--text-muted);
              text-transform: uppercase; letter-spacing: 0.5px;
            }
            .calendar-cell {
              min-height: 110px; background: var(--bg-card);
              padding: 8px 6px; position: relative;
            }
            .calendar-cell.today { background: rgba(212,168,67,0.05); }
            .calendar-cell.empty { background: rgba(0,0,0,0.02); }
            
            .date-num {
              display: flex; justify-content: flex-end; margin-bottom: 6px;
            }
            .date-num span {
              font-size: 11px; font-weight: 600; color: var(--text-muted);
              width: 24px; height: 24px; display: flex; alignItems: center; justifyContent: center;
            }
            .today .date-num span {
              background: var(--gold); color: #000; border-radius: 50%;
            }
            
            .event-item {
              display: block; padding: 2px 4px; margin-bottom: 2px;
              background: var(--gold); border-radius: 4px;
              text-decoration: none;
              color: #000; transition: 0.1s;
              text-align: center; font-weight: 800; font-size: 11px;
            }
            .event-item:hover { background: var(--gold-hover, #f1c40f); transform: scale(1.05); }

            @media (max-width: 600px) {
              .calendar-cell { min-height: 80px; padding: 4px; }
              .event-item { font-size: 10px; }
            }
          `}</style>

          {loading ? <div className="loading">Memuat jadwal...</div> : (
            <div className="calendar-grid">
              {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
                <div key={d} className="calendar-day-head">{d}</div>
              ))}

              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`e-${i}`} className="calendar-cell empty" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dNum = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
                const groups = getGroupsForDate(dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div key={dNum} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                    <div className="date-num">
                      <span>{dNum}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {groups.map(g => (
                        <Link
                          href={`/bookings/${g.bookings[0]?.id}`}
                          key={`${g.tanggal}-${g.clientId}`}
                          className="event-item"
                          title={`${g.client?.namaPasangan} · ${g.bookings.map(b => CATEGORY_LABEL[b.category] || b.category).join(', ')}`}
                        >
                          {shortenName(g.client?.namaPasangan)}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
