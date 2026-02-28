'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { LuSave, LuPlus, LuArrowLeft } from 'react-icons/lu';

const CATEGORIES = [
  { key: 'wo', label: 'Wedding Organizer' },
  { key: 'wedding_planner', label: 'Wedding Planner' },
  { key: 'mcc', label: 'MC / Pembawa Acara' },
  { key: 'wcc', label: 'Wedding Content Creator' },
];

const PAYMENT_STATUS = [
  { key: 'unpaid', label: 'Belum Bayar' },
  { key: 'partial', label: 'Sebagian' },
  { key: 'paid', label: 'Lunas' },
];

export default function BookingFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== 'new';

  const [clients, setClients] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    category: 'wo',
    tanggal: '',
    lokasi: '',
    package: '',
    pricing: [{ label: 'Harga Jasa', amount: '' }], // dynamic breakdown
    paymentStatus: 'unpaid',
    nominalDibayar: '',
    crewAssignments: [], // [{ crewId, jobRole }]
    catatan: '',
  });

  // New client inline
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ namaPasangan: '', noWA: '', alamat: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/crew').then((r) => r.json()),
    ]).then(([c, cr]) => {
      setClients(c);
      setCrew(cr);
    });

    if (isEdit) {
      fetch(`/api/bookings/${params.id}`)
        .then((r) => r.json())
        .then((b) => {
          setForm({
            clientId: b.clientId,
            category: b.category,
            tanggal: b.tanggal,
            lokasi: b.lokasi,
            package: b.package,
            pricing: b.pricing?.length > 0 ? b.pricing : [{ label: 'Harga Jasa', amount: b.harga || '' }],
            paymentStatus: b.payment?.status,
            nominalDibayar: b.payment?.nominalDibayar || '',
            crewAssignments: b.crewAssignments || [],
            catatan: b.catatan || '',
          });
        });
    }
  }, [isEdit, params?.id]);

  // Toggle crew member — if unchecking, remove. If checking, add with default jobRole from master crew.
  const handleCrewToggle = (crewMember) => {
    setForm((f) => {
      const exists = f.crewAssignments.find((a) => a.crewId === crewMember.id);
      return {
        ...f,
        crewAssignments: exists
          ? f.crewAssignments.filter((a) => a.crewId !== crewMember.id)
          : [...f.crewAssignments, { crewId: crewMember.id, jobRole: crewMember.role }],
      };
    });
  };

  // Update the jobRole for a specific crew member in the assignment
  const handleCrewRoleChange = (crewId, jobRole) => {
    setForm((f) => ({
      ...f,
      crewAssignments: f.crewAssignments.map((a) =>
        a.crewId === crewId ? { ...a, jobRole } : a
      ),
    }));
  };

  const handleAddClient = async () => {
    if (!newClient.namaPasangan || !newClient.noWA) return alert('Nama pasangan dan WA wajib diisi!');
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient),
    });
    const created = await res.json();
    setClients((c) => [...c, created]);
    setForm((f) => ({ ...f, clientId: created.id }));
    setShowNewClient(false);
    setNewClient({ namaPasangan: '', noWA: '', alamat: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalHarga = form.pricing.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    if (!form.clientId || !form.tanggal || !form.lokasi || !form.package || totalHarga === 0) {
      return alert('Mohon lengkapi semua field wajib dan tambahkan minimal satu harga.');
    }
    setLoading(true);
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/bookings/${params.id}` : '/api/bookings';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form), // crewAssignments sent as-is
    });
    router.push('/bookings');
  };

  // Only show crew whose activeCategories include the selected category
  const filteredCrew = crew.filter((c) =>
    c.activeCategories?.includes(form.category)
  );
  // Also include all-category crew that aren't category-specific (shows full crew pool)
  const allOtherCrew = crew.filter((c) =>
    !c.activeCategories?.includes(form.category)
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{isEdit ? 'Edit Booking' : 'Tambah Booking Baru'}</div>
            <div className="topbar-sub">Isi data booking dengan lengkap</div>
          </div>
          <Link href="/bookings" className="btn btn-secondary"><LuArrowLeft size={14}/> Kembali</Link>
        </div>
        <div className="page-content">
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="form-grid">
                {/* Kategori */}
                <div className="form-group">
                  <label className="form-label">Kategori Layanan *</label>
                  <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, crewIds: [] })}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                {/* Klien */}
                <div className="form-group">
                  <label className="form-label">Nama Pasangan *</label>
                  <div className="flex gap-2">
                    <select className="select" style={{ flex: 1 }} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                      <option value="">-- Pilih Pasangan --</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.namaPasangan}</option>)}
                    </select>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewClient(!showNewClient)}>+ Baru</button>
                  </div>
                </div>

                {/* Inline new client */}
                {showNewClient && (
                  <div className="form-group full" style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div className="form-label mb-4">Tambah Klien Baru</div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Nama Pasangan *</label>
                        <input className="input" placeholder="Contoh: Rizki & Annisa" value={newClient.namaPasangan} onChange={(e) => setNewClient({ ...newClient, namaPasangan: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nomor WA *</label>
                        <input className="input" placeholder="628xxx" value={newClient.noWA} onChange={(e) => setNewClient({ ...newClient, noWA: e.target.value })} />
                      </div>
                      <div className="form-group full">
                        <label className="form-label">Alamat</label>
                        <input className="input" placeholder="Alamat lengkap" value={newClient.alamat} onChange={(e) => setNewClient({ ...newClient, alamat: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleAddClient}>Simpan Klien</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewClient(false)}>Batal</button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tanggal Acara *</label>
                  <input className="input" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lokasi / Venue *</label>
                  <input className="input" placeholder="Nama gedung/lokasi" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Package *</label>
                  <input className="input" placeholder="Nama package" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} />
                </div>
                {/* Dynamic Pricing Breakdown */}
                <div className="form-group full">
                  <label className="form-label">
                    Rincian Harga *
                    <span className="text-muted" style={{ marginLeft: 8, fontSize: 11, textTransform: 'none' }}>
                      Total: Rp {form.pricing.reduce((s,p) => s + (Number(p.amount)||0), 0).toLocaleString('id-ID')}
                    </span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {form.pricing.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          className="input"
                          style={{ flex: 1 }}
                          placeholder="Nama biaya (cth: Harga Jasa, Transport)"
                          value={item.label}
                          onChange={(e) => {
                            const p = [...form.pricing];
                            p[idx] = { ...p[idx], label: e.target.value };
                            setForm({ ...form, pricing: p });
                          }}
                        />
                        <input
                          className="input"
                          style={{ width: 180 }}
                          type="number"
                          placeholder="Nominal"
                          value={item.amount}
                          onChange={(e) => {
                            const p = [...form.pricing];
                            p[idx] = { ...p[idx], amount: e.target.value };
                            setForm({ ...form, pricing: p });
                          }}
                        />
                        {form.pricing.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '7px 10px' }}
                            onClick={() => {
                              const p = form.pricing.filter((_, i) => i !== idx);
                              setForm({ ...form, pricing: p });
                            }}
                          >✕</button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ alignSelf: 'flex-start', marginTop: 4 }}
                      onClick={() => setForm({ ...form, pricing: [...form.pricing, { label: '', amount: '' }] })}
                    >
                      + Tambah Rincian
                    </button>
                  </div>
                </div>

                {/* Payment */}
                <div className="form-group">
                  <label className="form-label">Status Pembayaran</label>
                  <select className="select" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                    {PAYMENT_STATUS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                {form.paymentStatus === 'partial' && (
                  <div className="form-group">
                    <label className="form-label">Nominal Sudah Dibayar</label>
                    <input className="input" type="number" placeholder="0" value={form.nominalDibayar} onChange={(e) => setForm({ ...form, nominalDibayar: e.target.value })} />
                  </div>
                )}

                {/* Crew Selection — with per-member job role */}
                <div className="form-group full">
                  <label className="form-label">
                    Kru Bertugas
                    <span className="text-muted" style={{ marginLeft: 8, fontSize: 11, textTransform: 'none' }}>
                      ({filteredCrew.length} kru kategori ini · {allOtherCrew.length} kru lainnya)
                    </span>
                  </label>

                  {/* Primary crew for this category */}
                  <div className="crew-select-list">
                    {filteredCrew.length === 0 && allOtherCrew.length === 0 ? (
                      <div className="text-muted" style={{ padding: '8px 4px' }}>Tidak ada kru. <Link href="/crew">Tambah kru →</Link></div>
                    ) : [
                      ...filteredCrew,
                      // Show separator + other crew
                      ...allOtherCrew,
                    ].map((c, idx) => {
                      const isOther = !c.activeCategories?.includes(form.category);
                      const assignment = form.crewAssignments.find((a) => a.crewId === c.id);
                      const isChecked = Boolean(assignment);
                      return (
                        <div key={c.id}>
                          {isOther && idx === filteredCrew.length && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '4px 4px 2px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 6 }}>
                              — Kru kategori lain (opsional) —
                            </div>
                          )}
                          <div className="crew-select-item" style={{ opacity: isOther ? 0.65 : 1 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCrewToggle(c)}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.role}</span>
                              </div>
                            </div>
                            {/* Job role input — only visible when checked */}
                            {isChecked && (
                              <input
                                className="input"
                                style={{ width: 160, padding: '4px 10px', fontSize: 12.5 }}
                                placeholder="Peran di job ini..."
                                value={assignment?.jobRole || ''}
                                onChange={(e) => handleCrewRoleChange(c.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {form.crewAssignments.length > 0 && (
                    <div className="text-muted" style={{ marginTop: 6 }}>
                      {form.crewAssignments.length} kru ditugaskan:
                      {form.crewAssignments.map(a => {
                        const m = crew.find(c => c.id === a.crewId);
                        return m ? ` ${m.name} (${a.jobRole || '—'})` : '';
                      }).join(', ')}
                    </div>
                  )}
                </div>

                <div className="form-group full">
                  <label className="form-label">Catatan</label>
                  <textarea
                    className="input"
                    rows={3}
                    style={{ resize: 'vertical' }}
                    placeholder="Catatan tambahan..."
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
                <Link href="/bookings" className="btn btn-secondary">Batal</Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Menyimpan...' : isEdit ? <><LuSave size={14}/> Simpan</> : <><LuPlus size={14}/> Tambah Booking</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
