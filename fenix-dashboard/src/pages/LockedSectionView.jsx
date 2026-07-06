import React from 'react';
import { Lock } from 'lucide-react';
import './LockedSectionView.css';

const LockedSectionView = ({ title }) => {
  return (
    <div className="locked-view animate-fade-in">
      <div className="locked-content">
        <div className="locked-icon-wrapper">
          <Lock size={48} className="locked-icon" />
        </div>
        <h2 className="locked-title">{title}</h2>
        <p className="locked-message text-muted">
          Esta sección está planificada como una posible expansión futura del dashboard.
        </p>
      </div>
    </div>
  );
};

export default LockedSectionView;
