import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';
import Layout from './components/Layout';
import Resumen from './pages/Resumen';
import Leads from './pages/Leads';
import LockedSectionView from './pages/LockedSectionView';

function App() {
  return (
    <DashboardProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/resumen" replace />} />
            <Route path="resumen" element={<Resumen />} />
            <Route path="operacion" element={<Resumen />} />
            <Route path="marketing" element={<LockedSectionView title="Marketing / Ads" />} />
            <Route path="leads" element={<Leads />} />
            <Route path="ventas" element={<LockedSectionView title="Ventas de productos" />} />
            <Route path="rotacion" element={<LockedSectionView title="Rotación de productos" />} />
            <Route path="logistica" element={<LockedSectionView title="Logística" />} />
            <Route path="*" element={<Navigate to="/resumen" replace />} />
          </Route>
        </Routes>
      </Router>
    </DashboardProvider>
  );
}

export default App;
