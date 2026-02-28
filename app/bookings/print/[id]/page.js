'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const CATEGORY_LABEL = {
  wo: 'Wedding Organizer',
  wedding_planner: 'Wedding Planner',
  mcc: 'MC / Pembawa Acara',
  wcc: 'Wedding Content Creator',
};

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

export default function BookingPrintPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
        // Auto print after a short delay
        setTimeout(() => {
          if (typeof window !== 'undefined') window.print();
        }, 800);
      });
  }, [params.id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Memuat dokumen...</div>;
  if (!booking) return <div style={{ padding: 40, textAlign: 'center' }}>Booking tidak ditemukan.</div>;

  const totalBilling = booking.harga || 0;
  const alreadyPaid = booking.payment?.nominalDibayar || 0;
  const balance = totalBilling - alreadyPaid;

  const cats = booking.categories?.length > 0 ? booking.categories : (booking.category ? [booking.category] : []);

  return (
    <div className="print-document" style={{ 
      maxWidth: '800px', margin: '0 auto', padding: '40px', 
      fontFamily: 'serif', color: '#000', backgroundColor: '#fff',
      lineHeight: 1.5, minHeight: '100vh'
    }}>
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
        }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 13px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .info-item { display: flex; gap: 8px; margin-bottom: 4px; font-size: 14px; }
        .info-label { font-weight: bold; min-width: 120px; }
        .section-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; margin-top: 30px; }
      `}</style>

      <div className="header">
        <h1 style={{ margin: 0, fontSize: 24, textTransform: 'uppercase' }}>Konfirmasi Booking - BARUDAK AGENCY</h1>
        <p style={{ margin: '5px 0' }}>Manajemen Event & Kru Pernikahan</p>
        <p style={{ fontSize: 12 }}>ID Booking: {booking.id} | Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      <div className="info-grid">
        <div>
          <div className="section-title">Informasi Klien</div>
          <div className="info-item"><span className="info-label">Nama Pasangan :</span> {booking.client?.namaPasangan || '-'}</div>
          <div className="info-item"><span className="info-label">WhatsApp :</span> {booking.client?.noWA || '-'}</div>
          <div className="info-item"><span className="info-label">Alamat :</span> {booking.client?.alamat || '-'}</div>
        </div>
        <div>
          <div className="section-title">Informasi Event</div>
          <div className="info-item"><span className="info-label">Tanggal :</span> {booking.hari}, {booking.tanggal}</div>
          <div className="info-item"><span className="info-label">Lokasi :</span> {booking.lokasi || '-'}</div>
          <div className="info-item"><span className="info-label">Package :</span> {booking.package || '-'}</div>
        </div>
      </div>

      <div className="section-title">Layanan & Harga</div>
      <table>
        <thead>
          <tr>
            <th>Deskripsi Layanan</th>
            <th style={{ textAlign: 'right', width: '150px' }}>Harga</th>
          </tr>
        </thead>
        <tbody>
          {booking.pricing && booking.pricing.length > 0 ? (
            booking.pricing.map((p, i) => (
              <tr key={i}>
                <td>{p.label} {p.label === 'WO' || p.label === 'WCC' ? `(${CATEGORY_LABEL[p.label.toLowerCase()]})` : ''}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(p.amount)}</td>
              </tr>
            ))
          ) : (
            cats.map((c, i) => (
              <tr key={i}>
                <td>{CATEGORY_LABEL[c] || c}</td>
                <td style={{ textAlign: 'right' }}>{i === 0 ? formatRupiah(booking.harga) : '-'}</td>
              </tr>
            ))
          )}
          <tr style={{ fontWeight: 'bold' }}>
            <td style={{ textAlign: 'right' }}>TOTAL TAGIHAN</td>
            <td style={{ textAlign: 'right' }}>{formatRupiah(totalBilling)}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'right' }}>Nominal Dibayar</td>
            <td style={{ textAlign: 'right' }}>{formatRupiah(alreadyPaid)}</td>
          </tr>
          <tr style={{ fontWeight: 'bold', fontSize: 16 }}>
            <td style={{ textAlign: 'right' }}>SISA TAGIHAN</td>
            <td style={{ textAlign: 'right' }}>{formatRupiah(balance)}</td>
          </tr>
        </tbody>
      </table>

      <div className="section-title">Penugasan Kru</div>
      {booking.crew && booking.crew.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Nama Kru</th>
              <th>Role Pekerjaan</th>
            </tr>
          </thead>
          <tbody>
            {booking.crew.map((c, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{c.name}</td>
                <td>{c.jobRole || c.role || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontStyle: 'italic', fontSize: 13 }}>Belum ada kru yang ditugaskan untuk event ini.</p>
      )}

      {booking.catatan && (
        <div style={{ marginTop: 20 }}>
          <div className="section-title">Catatan Tambahan</div>
          <p style={{ fontSize: 13 }}>{booking.catatan}</p>
        </div>
      )}

      <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
        <div style={{ width: '200px' }}>
          <p>Dibuat Oleh,</p>
          <div style={{ marginTop: 60, borderTop: '1px solid #000', paddingTop: 5 }}>Admin Barudak Agency</div>
        </div>
        <div style={{ width: '200px' }}>
          <p>Diterima Oleh,</p>
          <div style={{ marginTop: 60, borderTop: '1px solid #000', paddingTop: 5 }}>{booking.client?.namaPasangan || 'Pihak Klien'}</div>
        </div>
      </div>

      <div className="no-print" style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Cetak Dokumen</button>
      </div>
    </div>
  );
}
