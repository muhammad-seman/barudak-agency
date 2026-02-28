'use client';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Hapus', isDangerous = true }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 999 }}>
      <div className="modal" style={{ maxWidth: 400, borderRadius: 'var(--radius)' }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
        </div>
        <div className="modal-body" style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
          {message}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Batal</button>
          <button className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
