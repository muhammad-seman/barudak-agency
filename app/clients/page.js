'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  LuPlus, LuPencil, LuTrash2, LuMessageCircle, LuHeart, LuChevronDown, LuChevronUp,
} from 'react-icons/lu';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ namaPasangan: '', noWA: '', alamat: '' });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/bookings').then((r) => r.json()),
    ]).then(([c, b]) => { setClients(c); setBookings(b); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.namaPasangan || !form.noWA) return alert('Nama dan WA wajib diisi!');
    
    setSubmitting(true);
    try {
      if (editId) {
        const res = await fetch(`/api/clients/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const updated = await res.json();
        setClients((cs) => cs.map((c) => (c.id === editId ? updated : c)));
      } else {
        const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const created = await res.json();
        setClients((cs) => [created, ...cs]);
      }
      setForm({ namaPasangan: '', noWA: '', alamat: '' });
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      alert('Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ namaPasangan: c.namaPasangan, noWA: c.noWA, alamat: c.alamat });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/clients/${deleteId}`, { method: 'DELETE' });
    setClients((cs) => cs.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = clients.filter((c) => c.namaPasangan?.toLowerCase().includes(search.toLowerCase()));
  const getClientBookings = (cid) => bookings.filter((b) => b.clientId === cid);
  const CATEGORY_LABEL = { wo: 'WO', wedding_planner: 'WP', mcc: 'MC', wcc: 'WCC' };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Data Klien</div>
            <div className="topbar-sub">Daftar semua pasangan yang pernah booking</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ namaPasangan: '', noWA: '', alamat: '' }); }}>
            <LuPlus size={15} /> Tambah
          </button>
        </div>
        <div className="page-content">
          {showForm && (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
              <div className="modal">
                <div className="modal-header">
                  <span className="modal-title">{editId ? 'Edit Klien' : 'Tambah Klien Baru'}</span>
                  <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="form-grid">
                      <div className="form-group full">
                        <label className="form-label">Nama Pasangan *</label>
                        <input className="input" placeholder="Contoh: Rizki & Annisa" value={form.namaPasangan} onChange={(e) => setForm({ ...form, namaPasangan: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nomor WhatsApp *</label>
                        <input className="input" placeholder="628xxxxxxxxxx" value={form.noWA} onChange={(e) => setForm({ ...form, noWA: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Alamat</label>
                        <input className="input" placeholder="Alamat domisili" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" disabled={submitting} onClick={() => setShowForm(false)}>Batal</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Menyimpan...' : (editId ? 'Simpan' : 'Tambah Klien')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="toolbar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Cari nama pasangan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 300, flex: 1 }}
            />
            <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 13, whiteSpace: 'nowrap' }}>
              {filtered.length} klien
            </span>
          </div>

          {loading ? <div className="loading">Memuat data...</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="hidden-mobile">#</th>
                    <th>Nama Pasangan</th>
                    <th className="hidden-mobile">WhatsApp Client</th>
                    <th className="hidden-mobile">Alamat</th>
                    <th className="hidden-mobile">Layanan</th>
                    <th>Jml. Booking</th>
                    <th className="hidden-mobile"></th>
                    <th className="hidden-desktop" style={{ width: 40, padding: 0 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const cb = getClientBookings(c.id);
                    const cats = [...new Set(cb.map((b) => b.category))];
                    return (
                      <React.Fragment key={c.id}>
                        <tr onClick={() => toggleExpand(c.id)} style={{ cursor: 'pointer' }}>
                          <td className="text-muted hidden-mobile">{i + 1}</td>
                          <td style={{ fontWeight: 700 }}>{c.namaPasangan}</td>
                          <td className="hidden-mobile">
                            <a className="wa-link" href={`https://wa.me/${c.noWA}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <LuMessageCircle size={14} /> {c.noWA}
                            </a>
                          </td>
                          <td className="hidden-mobile" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.alamat || '—'}</td>
                          <td className="hidden-mobile">
                            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                              {cats.map((c, idx) => (
                                <span key={`${c}-${idx}`} className={`badge badge-${c}`}>{CATEGORY_LABEL[c] || c}</span>
                              ))}
                              {cats.length === 0 && <span className="text-muted">—</span>}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{cb.length}</td>
                          <td className="hidden-mobile">
                            <div className="flex gap-2">
                              <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleEdit(c); }}><LuPencil size={12} /></button>
                              <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}><LuTrash2 size={12} /></button>
                            </div>
                          </td>
                          <td className="mobile-chevron-td hidden-desktop">
                            <div className="mobile-chevron">
                              {expandedId === c.id ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
                            </div>
                          </td>
                        </tr>
                        {expandedId === c.id && (
                          <tr className="accordion-row hidden-desktop">
                            <td colSpan={8} style={{ padding: 0 }}>
                              <div className="accordion-content">
                                <div className="accordion-item">
                                  <span className="accordion-label">WhatsApp</span>
                                  <span className="accordion-value">
                                    <a className="wa-link" href={`https://wa.me/${c.noWA}`} target="_blank" rel="noreferrer">
                                      {c.noWA}
                                    </a>
                                  </span>
                                </div>
                                <div className="accordion-item">
                                  <span className="accordion-label">Alamat</span>
                                  <span className="accordion-value">{c.alamat || '—'}</span>
                                </div>
                                <div className="accordion-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                                  <span className="accordion-label">Layanan</span>
                                  <span className="accordion-value" style={{ width: '100%', textAlign: 'left' }}>
                                    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                                      {cats.map((cat) => (
                                        <span key={cat} className={`badge badge-${cat}`}>{CATEGORY_LABEL[cat]}</span>
                                      ))}
                                      {cats.length === 0 && <span className="text-muted">—</span>}
                                    </div>
                                  </span>
                                </div>
                                <div className="flex gap-2" style={{ marginTop: 8 }}>
                                  <button className="btn btn-secondary flex-1" onClick={() => handleEdit(c)}><LuPencil size={12} /> Edit</button>
                                  <button className="btn btn-danger flex-1" onClick={() => setDeleteId(c.id)}><LuTrash2 size={12} /> Hapus</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8}><div className="empty-state"><LuHeart size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-muted)' }} /><p>Belum ada klien.</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Klien"
        message="Apakah Anda yakin ingin menghapus data klien ini beserta seluruh bookingnya?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
