'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

const CATEGORY_OPTIONS = [
  { key: 'wo', label: 'Wedding Organizer' },
  { key: 'wedding_planner', label: 'Wedding Planner' },
  { key: 'mcc', label: 'MC / Pembawa Acara' },
  { key: 'wcc', label: 'Wedding Content Creator' },
];

export default function CrewPage() {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', noWA: '', role: '', activeCategories: [], status: 'active' });

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
    setForm({ name: c.name, noWA: c.noWA, role: c.role, activeCategories: c.activeCategories || [], status: c.status });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role) return alert('Nama dan peran wajib diisi!');
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
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kru ini?')) return;
    await fetch(`/api/crew/${id}`, { method: 'DELETE' });
    setCrew((cr) => cr.filter((c) => c.id !== id));
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
          <button className="btn btn-primary" onClick={openNew}>+ Tambah Kru</button>
        </div>
        <div className="page-content">

          {/* Modal */}
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
                        <input className="input" placeholder="Contoh: WO Lead, Videografer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
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
                            <label key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: `1px solid ${form.activeCategories.includes(cat.key) ? 'var(--gold)' : 'var(--border)'}`, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                              <input type="checkbox" style={{ accentColor: 'var(--gold)' }} checked={form.activeCategories.includes(cat.key)} onChange={() => toggleCat(cat.key)} />
                              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{cat.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                    <button type="submit" className="btn btn-primary">{editId ? 'Simpan Perubahan' : 'Tambah Kru'}</button>
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
                    <th>#</th>
                    <th>Nama Kru</th>
                    <th>WhatsApp</th>
                    <th>Peran</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {crew.map((c, i) => (
                    <tr key={c.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td>
                        {c.noWA ? (
                          <a className="wa-link" href={`https://wa.me/${c.noWA}`} target="_blank" rel="noreferrer">
                            💬 {c.noWA}
                          </a>
                        ) : '—'}
                      </td>
                      <td>{c.role}</td>
                      <td>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                          {(c.activeCategories || []).map((cat) => (
                            <span key={cat} className={`badge badge-${cat}`} style={{ fontSize: 10 }}>
                              {{ wo: 'WO', wedding_planner: 'WP', mcc: 'MC', wcc: 'WCC' }[cat] || cat.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'active' ? 'badge-paid' : 'badge-unpaid'}`}>
                          {c.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {crew.length === 0 && (
                    <tr><td colSpan={7}><div className="empty-state"><div className="icon">👥</div><p>Belum ada data kru.</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
