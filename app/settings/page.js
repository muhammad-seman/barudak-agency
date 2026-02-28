'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { LuLogOut, LuSun, LuMoon, LuSettings, LuUser } from 'react-icons/lu';

export default function SettingsPage() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">Setting</div>
            <div className="topbar-sub">Pengaturan aplikasi dan akun</div>
          </div>
        </div>

        <div className="page-content">
          <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                <LuUser size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Admin Barudak</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Administrator System</div>
              </div>
            </div>

            <div className="settings-list">
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Tampilan</div>
                <button 
                  onClick={toggleTheme}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-primary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {theme === 'dark' ? <LuMoon size={18} /> : <LuSun size={18} />}
                    <span style={{ fontWeight: 500 }}>Mode {theme === 'dark' ? 'Gelap' : 'Terang'}</span>
                  </div>
                  <div style={{ 
                    width: 40, height: 20, background: theme === 'dark' ? 'var(--gold)' : '#ccc', 
                    borderRadius: 20, position: 'relative', transition: '0.3s' 
                  }}>
                    <div style={{ 
                      width: 16, height: 16, background: '#fff', borderRadius: '50%', 
                      position: 'absolute', top: 2, left: theme === 'dark' ? 22 : 2, transition: '0.3s' 
                    }} />
                  </div>
                </button>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                <button 
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#ef4444', fontWeight: 600
                  }}
                >
                  <LuLogOut size={18} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
