'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LuPlus, LuPencil, LuTrash2, LuMessageCircle, LuUsers, LuChevronDown, LuChevronUp } from 'react-icons/lu';

const CATEGORY_OPTIONS = [
  { key: 'wo', label: 'Wedding Organizer' },
  { key: 'wedding_planner', label: 'Wedding Planner' },
  { key: 'mcc', label: 'MC / Pembawa Acara' },
  { key: 'wcc', label: 'Wedding Content Creator' },
];

const CAT_LABEL = { wo: 'WO', wedding_planner: 'WP', mcc: 'MC', wcc: 'WCC' };

const MASTER_ROLES = [
  'Lead Kru', 'Kru Biasa', 'MC', 'WCC', 'Wedding Planner',
  'Videografer', 'Fotografer', 'Asisten', 'Lainnya'
];

export default function CrewPage() {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', noWA: '', role: [], activeCategories: [], status: 'active' });

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  useEffect(() => {
    fetch('/api/crew').then((r) => r.json()).then((c) => { setCrew(c); setLoading(false); });
  }, []);

  const toggleCat = (key) => {
    setForm((f) => ({
      ...f,
      activeCategories: f.activeCategories.includes(key)
        ? f.activeCategories.filter((k) => k !== key)
        : [...f.activeCategories, key],
    }));
  };

  const openNew = () => {
    setForm({ name: '', noWA: '', role: '', activeCategories: [], status: 'active' });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({ name: c.name, noWA: c.noWA, role: Array.isArray(c.role) ? c.role : (c.role ? [c.role] : []), activeCategories: c.activeCategories || [], status: c.status });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.name || !form.role || form.role.length === 0) return alert('Nama dan minimal satu peran wajib diisi!');
    
    setSubmitting(true);
    try {
      if (editId) {
        const res = await fetch(`/api/crew/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const updated = await res.json();
        setCrew((cr) => cr.map((c) => (c.id === editId ? updated : c)));
      } else {
        const res = await fetch('/api/crew', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const created = await res.json();
        setCrew((cr) => [...cr, created]);
      }
      setShowForm(false);
    } catch (err) {
      alert('Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/crew/${deleteId}`, { method: 'DELETE' });
    setCrew((cr) => cr.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Master Kru</div>
            <div className="topbar-sub">Kelola daftar kru dan kategori yang mereka tangani</div>
          </div>
          <button className="btn btn-primary" onClick={openNew}><LuPlus size={15} /> Tambah Kru</button>
        </div>
        <div className="page-content">
          {showForm && (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
              <div className="modal">
                <div className="modal-header">
                  <span className="modal-title">{editId ? 'Edit Data Kru' : 'Tambah Kru Baru'}</span>
                  <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Nama Kru *</label>
                        <input className="input" placeholder="Nama lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nomor WhatsApp</label>
                        <input className="input" placeholder="628xxx" value={form.noWA} onChange={(e) => setForm({ ...form, noWA: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Peran / Role *</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                          {MASTER_ROLES.map((r) => (
                            <label key={r} style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '7px 12px', background: 'var(--bg-secondary)', borderRadius: 8,
                              border: `1px solid ${form.role?.includes(r) ? 'var(--gold)' : 'var(--border)'}`,
                              cursor: 'pointer', transition: 'border-color 0.15s', fontSize: 13,
                            }}>
                              <input type="checkbox" style={{ accentColor: 'var(--gold)' }} checked={form.role?.includes(r)} onChange={(e) => {
                                const newRoles = e.target.checked
                                  ? [...(form.role || []), r]
                                  : (form.role || []).filter(x => x !== r);
                                setForm({ ...form, role: newRoles });
                              }} />
                              {r}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                          <option value="active">Aktif</option>
                          <option value="inactive">Tidak Aktif</option>
                        </select>
                      </div>
                      <div className="form-group full">
                        <label className="form-label">Kategori Layanan yang Ditangani</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                          {CATEGORY_OPTIONS.map((cat) => (
                            <label key={cat.key} style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '7px 12px', background: 'var(--bg-secondary)', borderRadius: 8,
                              border: `1px solid ${form.activeCategories.includes(cat.key) ? 'var(--gold)' : 'var(--border)'}`,
                              cursor: 'pointer', transition: 'border-color 0.15s', fontSize: 13,
                            }}>
                              <input type="checkbox" style={{ accentColor: 'var(--gold)' }} checked={form.activeCategories.includes(cat.key)} onChange={() => toggleCat(cat.key)} />
                              {cat.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" disabled={submitting} onClick={() => setShowForm(false)}>Batal</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Menyimpan...' : (editId ? 'Simpan' : 'Tambah Kru')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? <div className="loading">Memuat data...</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="hidden-mobile">#</th>
                    <th>Nama Kru</th>
                    <th className="hidden-mobile">WhatsApp</th>
                    <th className="hidden-mobile">Peran</th>
                    <th className="hidden-mobile">Kategori</th>
                    <th>Status</th>
                    <th className="hidden-mobile"></th>
                    <th className="hidden-desktop" style={{ width: 40, padding: 0 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {crew.map((c, i) => (
                    <React.Fragment key={c.id}>
                      <tr onClick={() => toggleExpand(c.id)} style={{ cursor: 'pointer' }}>
                        <td className="text-muted hidden-mobile">{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{c.name}</td>
                        <td className="hidden-mobile">
                          {c.noWA ? (
                            <a className="wa-link" href={`https://wa.me/${c.noWA}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <LuMessageCircle size={14} /> {c.noWA}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="hidden-mobile">{Array.isArray(c.role) ? c.role.join(', ') : c.role}</td>
                        <td className="hidden-mobile">
                          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                            {(c.activeCategories || []).map((cat) => (
                              <span key={cat} className={`badge badge-${cat}`} style={{ fontSize: 10 }}>
                                {CAT_LABEL[cat] || cat.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${c.status === 'active' ? 'badge-paid' : 'badge-unpaid'}`}>
                            {c.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="hidden-mobile">
                          <div className="flex gap-2">
                            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(c); }}><LuPencil size={12} /></button>
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
                                  {c.noWA ? (
                                    <a className="wa-link" href={`https://wa.me/${c.noWA}`} target="_blank" rel="noreferrer">
                                      {c.noWA}
                                    </a>
                                  ) : '—'}
                                </span>
                              </div>
                              <div className="accordion-item">
                                <span className="accordion-label">Peran</span>
                                <span className="accordion-value">{Array.isArray(c.role) ? c.role.join(', ') : (c.role || '—')}</span>
                              </div>
                              <div className="accordion-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                                <span className="accordion-label">Kategori</span>
                                <span className="accordion-value" style={{ width: '100%', textAlign: 'left' }}>
                                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                                    {(c.activeCategories || []).map((cat) => (
                                      <span key={cat} className={`badge badge-${cat}`} style={{ fontSize: 10 }}>
                                        {CAT_LABEL[cat] || cat.toUpperCase()}
                                      </span>
                                    ))}
                                  </div>
                                </span>
                              </div>
                              <div className="flex gap-2" style={{ marginTop: 8 }}>
                                <button className="btn btn-secondary flex-1" onClick={() => openEdit(c)}><LuPencil size={12} /> Edit</button>
                                <button className="btn btn-danger flex-1" onClick={() => setDeleteId(c.id)}><LuTrash2 size={12} /> Hapus</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {crew.length === 0 && (
                    <tr><td colSpan={8}><div className="empty-state"><LuUsers size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-muted)' }} /><p>Belum ada data kru.</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Kru"
        message="Apakah Anda yakin ingin menghapus data kru ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
