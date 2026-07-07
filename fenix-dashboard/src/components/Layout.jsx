import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="layout">
      {/* Mobile Header for hamburger menu */}
      <div className="mobile-header">
        <div className="mobile-brand-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png.png" alt="Distribuidora Fénix Logo" style={{ height: '32px' }} />
          <span className="mobile-brand" style={{ color: 'black', fontWeight: '700', fontSize: '1.1rem' }}>Distribuidora Fénix</span>
        </div>
        <button onClick={toggleSidebar} className="menu-btn" aria-label="Toggle menu">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
