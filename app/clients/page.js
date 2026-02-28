'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  LuPlus, LuPencil, LuTrash2, LuMessageCircle, LuHeart,
} from 'react-icons/lu';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ namaPasangan: '', noWA: '', alamat: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/bookings').then((r) => r.json()),
    ]).then(([c, b]) => { setClients(c); setBookings(b); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaPasangan || !form.noWA) return alert('Nama pasangan dan nomor WA wajib diisi!');
    if (editId) {
      const res = await fetch(`/api/clients/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const updated = await res.json();
      setClients((cs) => cs.map((c) => (c.id === editId ? updated : c)));
    } else {
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const created = await res.json();
      setClients((cs) => [...cs, created]);
    }
    setForm({ namaPasangan: '', noWA: '', alamat: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (c) => {
    setForm({ namaPasangan: c.namaPasangan, noWA: c.noWA, alamat: c.alamat });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus klien ini?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    setClients((cs) => cs.filter((c) => c.id !== id));
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
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                    <button type="submit" className="btn btn-primary">{editId ? 'Simpan' : 'Tambah Klien'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="toolbar">
            <input className="input" placeholder="Cari nama pasangan..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
            <span className="text-muted">{filtered.length} klien</span>
          </div>

          {loading ? <div className="loading">Memuat data...</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Nama Pasangan</th><th>WhatsApp</th>
                    <th>Alamat</th><th>Layanan</th><th>Booking</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const cb = getClientBookings(c.id);
                    const cats = [...new Set(cb.map((b) => b.category))];
                    return (
                      <tr key={c.id}>
                        <td className="text-muted">{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{c.namaPasangan}</td>
                        <td>
                          <a className="wa-link" href={`https://wa.me/${c.noWA}`} target="_blank" rel="noreferrer">
                            <LuMessageCircle size={14} /> {c.noWA}
                          </a>
                        </td>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.alamat || '—'}</td>
                        <td>
                          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                            {cats.map((cat) => (
                              <span key={cat} className={`badge badge-${cat}`}>{CATEGORY_LABEL[cat]}</span>
                            ))}
                            {cats.length === 0 && <span className="text-muted">—</span>}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{cb.length}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}><LuPencil size={12} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><LuTrash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7}><div className="empty-state"><LuHeart size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-muted)' }} /><p>Belum ada klien.</p></div></td></tr>
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
