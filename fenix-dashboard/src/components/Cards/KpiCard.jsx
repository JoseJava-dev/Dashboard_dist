import React from 'react';
import './KpiCard.css';

const KpiCard = ({ icon: Icon, label, value, subtitle }) => {
  return (
    <div className="card kpi-card">
      <div className="kpi-content">
        <span className="kpi-label">{label}</span>
        <div className="kpi-value">{value}</div>
        <span className="kpi-subtitle text-muted">{subtitle}</span>
      </div>
      <div className="kpi-icon-wrapper">
        <Icon className="kpi-icon" />
      </div>
    </div>
  );
};

export default KpiCard;
