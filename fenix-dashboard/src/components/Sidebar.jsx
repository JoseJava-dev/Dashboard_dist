import React from 'react';
import { LayoutDashboard, Activity, Megaphone, Users, ShoppingCart, RefreshCw, Truck } from 'lucide-react';
import { SidebarNavGroup, SidebarNavItem } from './SidebarNavItems';
import logoGapfixers from '../assets/logo_gapfixers.png';
import './Sidebar.css';

const Sidebar = ({ onClose }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand-wrapper">
          <img src="/logo.png.png" alt="Distribuidora Fénix Logo" className="sidebar-logo" />
          <h1 className="sidebar-brand" style={{ color: 'black' }}>Distribuidora<br/>Fénix</h1>
        </div>
      </div>

      <div className="sidebar-content">
        <SidebarNavGroup title="PANEL">
          <SidebarNavItem to="/resumen" icon={LayoutDashboard} label="Resumen" onClick={onClose} />
        </SidebarNavGroup>

        <SidebarNavGroup title="OPERACIÓN">
          <SidebarNavItem to="/operacion" icon={Activity} label="Gestión de stock" onClick={onClose} />
          <SidebarNavItem to="/leads" icon={Users} label="Leads CRM" onClick={onClose} />
        </SidebarNavGroup>

        <SidebarNavGroup title="EXPANSIÓN">
          <SidebarNavItem to="/marketing" icon={Megaphone} label="Marketing / Ads" locked onClick={onClose} />
          <SidebarNavItem to="/ventas" icon={ShoppingCart} label="Ventas de productos" locked onClick={onClose} />
          <SidebarNavItem to="/rotacion" icon={RefreshCw} label="Rotación de productos" locked onClick={onClose} />
          <SidebarNavItem to="/logistica" icon={Truck} label="Logística" locked onClick={onClose} />
        </SidebarNavGroup>
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', padding: '0.75rem', borderRadius: '8px', justifyContent: 'center' }}>
          <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>Desarrollado por Gapfixers</p>
          <img src={logoGapfixers} alt="Gapfixers logo" style={{ height: '24px', objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
