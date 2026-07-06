import React from 'react';
import { NavLink } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const SidebarNavGroup = ({ title, children }) => {
  return (
    <div className="sidebar-group">
      <h3 className="sidebar-group-title">{title}</h3>
      <nav className="sidebar-nav">
        {children}
      </nav>
    </div>
  );
};

export const SidebarNavItem = ({ to, icon: Icon, label, locked, onClick }) => {
  const content = (
    <>
      <Icon size={18} className="nav-icon" />
      <span className="nav-label">{label}</span>
      {locked && <Lock size={16} className="nav-icon-locked" />}
    </>
  );

  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => 
        `nav-item ${isActive ? 'active' : ''} ${locked ? 'locked' : ''}`
      }
    >
      {content}
    </NavLink>
  );
};
