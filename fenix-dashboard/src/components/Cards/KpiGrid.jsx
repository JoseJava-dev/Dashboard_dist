import React from 'react';
import './KpiGrid.css';

const KpiGrid = ({ children }) => {
  return (
    <div className="kpi-grid">
      {children}
    </div>
  );
};

export default KpiGrid;
