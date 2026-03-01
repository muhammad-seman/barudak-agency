'use client';
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
      });
  }, [params.id]);

  useEffect(() => {
    if (booking?.id) {
      setTimeout(async () => {
        const element = document.getElementById('pdf-content');
        if (!element) return;

        try {
          window.scrollTo(0, 0);
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0,
            width: element.offsetWidth,
            height: element.offsetHeight
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
          });
          
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
          pdf.save(`Invoice-${booking.clientId || 'booking'}-${booking.tanggal}.pdf`);
          
          // Only close if NOT in iframe
          if (window.self === window.top) {
            setTimeout(() => window.close(), 1000);
          }
        } catch (err) {
          console.error('PDF generation error:', err);
          if (window.self === window.top) {
            window.print();
          }
        }
      }, 1500);
    }
  }, [booking?.id, booking?.clientId, booking?.tanggal]);

  if (loading) return null;
  if (!booking) return null;

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const totalBilling = booking.harga || 0;
  const alreadyPaid = booking.payment?.nominalDibayar || 0;
  const balance = totalBilling - alreadyPaid;

  const getStatusText = () => {
    if (booking.payment?.status === 'paid') return 'Lunas';
    if (booking.payment?.status === 'partial') return 'Dibayar Sebagian';
    return 'Belum Bayar';
  };

  const getWatermarkColor = () => {
    if (booking.payment?.status === 'paid') return '#22c55e'; // Green
    if (booking.payment?.status === 'partial') return '#22c55e'; // Green
    return '#ef4444'; // Red
  };

  const statusText = getStatusText();
  const watermarkColor = getWatermarkColor();

  // Helper formatting for dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div style={{ background: isIframe ? 'transparent' : '#f5f5f5', minHeight: '100vh', padding: isIframe ? 0 : '20px 0', position: 'relative' }}>
      {isIframe && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', color: '#555' }}>
          Mengunduh...
        </div>
      )}
      <div id="pdf-content" style={{ 
        maxWidth: 850, 
        margin: '0 auto', 
        background: '#fff', 
        padding: 40,
        boxShadow: isIframe ? 'none' : '0 0 20px rgba(0,0,0,0.1)',
        position: 'relative',
        opacity: 1,
        pointerEvents: isIframe ? 'none' : 'auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
        color: '#333',
        overflow: 'hidden',
        position: 'relative',
        top: 0,
        left: 0
      }}>
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .print-document { padding: 20px !important; margin: 0 !important; max-width: 100% !important; }
        }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .header-left { display: flex; gap: 15px; }
        .logo { width: 60px; height: 60px; object-fit: contain; }
        .agency-info h2 { margin: 0; font-size: 18px; font-weight: 700; color: #000; }
        .agency-info p { margin: 2px 0; font-size: 12px; color: #444; line-height: 1.3; max-width: 400px; }
        .header-right { text-align: right; max-width: 250px; }
        .package-title { font-size: 16px; font-weight: 800; color: #000; text-transform: capitalize; }
        
        .divider { height: 1px; background-color: #eee; margin-bottom: 25px; }
        
        .client-grid { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 13px; }
        .client-section h3 { font-size: 14px; font-weight: 800; color: #000; margin-bottom: 8px; text-transform: uppercase; }
        .client-section div { margin-bottom: 4px; font-weight: 600; font-size: 14px; }

        .invoice-details { text-align: right; }
        .invoice-details table { border-collapse: collapse; margin-left: auto; background: #fff; }
        .invoice-details td { padding: 4px 8px; text-align: left; vertical-align: middle; border: 1px solid #ddd; font-size: 12px; color: #000; }
        .invoice-details td:first-child { font-weight: 800; text-transform: uppercase; background: #fff; }

        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; position: relative; z-index: 20; background: #fff; border: 1px solid #000; }
        .items-table th { background-color: #fff; color: #000; padding: 12px 15px; text-align: left; font-size: 13px; font-weight: 800; text-transform: uppercase; border: 1px solid #000; }
        .items-table td { padding: 12px 15px; border: 1px solid #000; font-size: 13px; color: #000; line-height: 1.4; background: #fff; }
        .items-table tr.last-row td { border-bottom: none; }
        
        .table-center { text-align: center !important; }
        .table-right { text-align: right !important; }

        .watermark {
          position: absolute; top: 40%; left: 50%; border: 6px solid ${watermarkColor}; 
          color: ${watermarkColor}; font-size: 60px; font-weight: 900; padding: 10px 30px; 
          border-radius: 20px; text-transform: uppercase; opacity: 0.12; 
          transform: translate(-50%, -50%) rotate(-25deg); pointer-events: none; z-index: 999;
          white-space: nowrap;
        }

        .footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 40px; position: relative; z-index: 20; }
        .payments h3 { font-size: 14px; font-weight: 800; color: #000; margin-bottom: 8px; }
        .payments p { font-size: 12.5px; color: #555; margin-bottom: 10px; line-height: 1.4; max-width: 350px; }
        .payment-info { font-style: italic; color: #666; font-size: 12px; margin: 15px 0; }
        .bank-details { font-size: 13px; color: #333; line-height: 1.5; font-weight: 600; }

        .total-box { background-color: #fff; color: #000; min-width: 300px; padding: 0; border-radius: 0; overflow: hidden; display: flex; border: 2px solid #000; }
        .total-label { padding: 12px 20px; font-weight: 800; text-transform: uppercase; font-size: 14px; flex: 1; border-right: 2px solid #000; background: #fff; }
        .total-value { text-align: right; padding: 12px 20px; font-size: 18px; font-weight: 800; background: #fff; }
        .partial-note { text-align: right; font-size: 12px; color: #666; margin-top: 8px; font-style: italic; }

        .motto { font-style: italic; color: #666; font-size: 13px; margin-bottom: 15px; }
      `}</style>

      {/* Watermark */}

      {/* Header */}
      <div className="header">
        <div className="header-left">
          <img src="/logo.png" className="logo" alt="Logo" />
          <div className="agency-info">
            <h2>Barudak Organizer</h2>
            <p>Jl. Bajingah, Komplek Perumahan Berkat Pesona Sarang Halang BLOK A No 05, Pelaihari, Tanah Laut, Kalsel.</p>
            <p>085822004589</p>
            <p>barudakorganizer@gmail.com</p>
          </div>
        </div>
        <div className="header-right">
          <div className="package-title">{booking.categories?.map(c => CATEGORY_LABEL[c] || c).join(' & ')}</div>
          <div className="package-title">{booking.package}</div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Client & Invoice Details */}
      <div className="client-grid">
        <div className="client-section">
          <h3>TAGIHAN KEPADA</h3>
          <div>{booking.client?.namaPasangan || '-'}</div>
          <div>{booking.client?.noWA || '-'}</div>
        </div>
        <div className="invoice-details">
          <table>
            <tbody>
              <tr>
                <td>TAGIHAN</td>
                <td>{booking.id?.replace('bk','INV') || 'INV0000'}</td>
              </tr>
              <tr>
                <td>TANGGAL</td>
                <td>{formatDate(booking.tanggal)}</td>
              </tr>
              <tr>
                <td>BATAS WAKTU</td>
                <td>{formatDate(booking.tanggal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th style={{ width: '45%' }}>Deskripsi</th>
            <th className="table-center" style={{ width: '15%' }}>KUANTITAS</th>
            <th className="table-center" style={{ width: '20%' }}>Harga</th>
            <th className="table-right" style={{ width: '20%' }}>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {booking.pricing?.map((p, i) => (
            <tr key={i} className={i === booking.pricing.length - 1 ? 'last-row' : ''}>
              <td>
                <div style={{ fontWeight: 700 }}>{p.label}</div>
                {p.desc && <div style={{ fontSize: 11, color: '#666', marginTop: 2, whiteSpace: 'pre-line' }}>{p.desc}</div>}
              </td>
              <td className="table-center">1</td>
              <td className="table-center">{formatRupiah(p.amount)}</td>
              <td className="table-right">{formatRupiah(p.amount)}</td>
            </tr>
          ))}
          {(!booking.pricing || booking.pricing.length === 0) && (
            <tr>
              <td>{booking.catatan || 'Paket Layanan'}</td>
              <td className="table-center">1</td>
              <td className="table-center">{formatRupiah(booking.harga)}</td>
              <td className="table-right">{formatRupiah(booking.harga)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Footer Area */}
      <div className="footer">
        <div className="payments">
          <h3>Cara Pembayaran</h3>
          <p>Terima kasih telah memilih kami sebagai partner perencanaan momen penting Anda. Kepercayaan Anda adalah prioritas kami.</p>
          <div className="motto">“Barudak Organizer | Menata Setiap Detail”</div>
          <div className="payment-info">Informasi Pembayaran</div>
          <div className="bank-details">BANK BRI : 0239 0105 4782 504 A/N Wilda Salsabila</div>
          <div style={{ marginTop: 25, fontSize: 11, color: '#999' }}>
            *Dokumen ini sah tanpa tanda tangan basah<br/>
            Dicetak pada: {new Date().toLocaleString('id-ID')}
          </div>
        </div>
        <div>
          <div className="total-box">
            <div className="total-label">TOTAL</div>
            <div className="total-value">{formatRupiah(totalBilling)}</div>
          </div>
          {alreadyPaid > 0 && (
            <div className="partial-note">
              *Dibayar Sebagian {formatRupiah(alreadyPaid)}
              {balance > 0 && <span style={{ display: 'block' }}>Sisa: {formatRupiah(balance)}</span>}
            </div>
          )}
        </div>
      </div>
      
      {/* Watermark moved to bottom of content to ensure top layer rendering */}
      <div className="watermark">{statusText}</div>
      </div>
      {!isIframe && (
        <div style={{ 
          maxWidth: 850, margin: '20px auto', display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '0 20px'
        }} className="no-print">
          <button onClick={() => window.close()} className="btn btn-secondary">Tutup</button>
          <button onClick={() => window.print()} className="btn btn-primary">Cetak Sekarang</button>
        </div>
      )}
    </div>
  );
}
