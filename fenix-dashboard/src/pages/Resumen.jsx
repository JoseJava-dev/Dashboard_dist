import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import PageHeader from '../components/PageHeader';
import PeriodSelector from '../components/PeriodSelector';
import KpiGrid from '../components/Cards/KpiGrid';
import KpiCard from '../components/Cards/KpiCard';
import DetailCard from '../components/Cards/DetailCard';
import { Package, FileText, Image as ImageIcon, Loader2, Database, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Resumen.css';
import './Charts.css';

const Resumen = () => {
  const { data, leadsData, baserowData, loading, error, period, setPeriod } = useDashboard();
  const location = useLocation();
  const isResumen = location.pathname.includes('resumen');

  useEffect(() => {
    if (isResumen && period !== 'todo') {
      setPeriod('todo');
    }
  }, [isResumen, period, setPeriod]);

  if (error) {
    return (
      <div className="resumen-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  let periodLabel = 'Todo';
  if (period === 'hoy') periodLabel = 'Hoy';
  else if (period === 'esta_semana') periodLabel = 'Esta semana';
  else if (period === 'este_mes') periodLabel = 'Este mes';
  else if (period === 'todo') periodLabel = new Date().getFullYear().toString();
  else if (period.startsWith('mes_')) {
    const m = parseInt(period.split('_')[1], 10);
    periodLabel = MONTHS[m] || 'Mes';
  }

  const getPromedioItems = () => {
    if (!data?.facturasProcesadas) return 0;
    if (data.facturasProcesadas.promedioItems > 0) return data.facturasProcesadas.promedioItems;
    
    const items = data.facturasProcesadas.items || [];
    if (items.length === 0) return 0;
    
    const totalItems = items.reduce((sum, invoice) => sum + (Number(invoice.cantidad_items) || 0), 0);
    const avg = totalItems / items.length;
    return avg % 1 === 0 ? avg : avg.toFixed(1);
  };

  const getMesesBase = () => [
    { name: 'Ene', cantidad: 0 },
    { name: 'Feb', cantidad: 0 },
    { name: 'Mar', cantidad: 0 },
    { name: 'Abr', cantidad: 0 },
    { name: 'May', cantidad: 0 },
    { name: 'Jun', cantidad: 0 },
    { name: 'Jul', cantidad: 0 },
    { name: 'Ago', cantidad: 0 },
    { name: 'Sep', cantidad: 0 },
    { name: 'Oct', cantidad: 0 },
    { name: 'Nov', cantidad: 0 },
    { name: 'Dic', cantidad: 0 }
  ];

  // Helper para procesar datos de las gráficas
  const procesarDatosProductosPorMes = () => {
    const items = data?.productosProcesados?.items || [];
    const currentYear = new Date().getFullYear();
    const datos = getMesesBase();
    
    items.forEach(item => {
      if(!item.creado_en) return;
      const date = new Date(item.creado_en);
      if (date.getFullYear() !== currentYear) return;
      
      datos[date.getMonth()].cantidad += 1;
    });
    return datos;
  };

  const procesarFacturasPorMes = () => {
    const items = data?.facturasProcesadas?.items || [];
    const currentYear = new Date().getFullYear();
    const datos = getMesesBase();
    
    items.forEach(item => {
      if(!item.creado_en) return;
      const date = new Date(item.creado_en);
      if (date.getFullYear() !== currentYear) return;
      
      datos[date.getMonth()].cantidad += 1;
    });
    return datos;
  };

  const procesarLeadsPorMes = () => {
    const currentYear = new Date().getFullYear();
    const datos = getMesesBase();

    // Histórico fijo (Enero a Julio 2026)
    if (currentYear === 2026) {
      datos[0].cantidad = 4589; // Ene
      datos[1].cantidad = 4104; // Feb
      datos[2].cantidad = 4412; // Mar
      datos[3].cantidad = 3504; // Abr
      datos[4].cantidad = 2738; // May
      datos[5].cantidad = 2595; // Jun
      datos[6].cantidad = 235;  // Jul (base from CSV)
    }

    // Sumar dinámicamente los registros de Supabase
    const items = leadsData?.items || [];
    
    items.forEach(item => {
      if(!item.creado_en) return;
      const date = new Date(item.creado_en);
      if (date.getFullYear() !== currentYear) return;

      datos[date.getMonth()].cantidad += 1;
    });

    return datos;
  };

  return (
    <div className="resumen-container animate-fade-in">
      <div className="resumen-top-bar">
        <PageHeader 
          title={isResumen ? "Resumen General" : "Gestión de stock"} 
          subtitle={isResumen ? "Métricas históricas y totales" : "Rendimiento de la automatización de stock de Fenix"} 
        />
        {!isResumen ? (
          <div className="period-selector-wrapper">
            <PeriodSelector />
          </div>
        ) : (
          <div className="period-selector-wrapper">
            <div className="period-selector">
              <span className="period-btn active" style={{ cursor: 'default' }}>Año: {new Date().getFullYear()}</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spinner" size={40} />
          <p>Cargando métricas...</p>
        </div>
      ) : (
        <>
          <div className="resumen-content">
            {isResumen ? (
              <div className="horizontal-kpi-row">
                <KpiCard 
                  icon={Database}
                  label="Productos en Dux"
                  value={baserowData?.productosTotal || 0}
                  subtitle="total sincronizado"
                />
                <KpiCard 
                  icon={Briefcase}
                  label="Proveedores en Dux"
                  value={baserowData?.proveedoresTotal || 0}
                  subtitle="total registrados"
                />
                <KpiCard 
                  icon={Package}
                  label="Productos procesados"
                  value={data?.productosProcesados?.total || 0}
                  subtitle="histórico ingresados"
                />
                <KpiCard 
                  icon={FileText}
                  label="Facturas procesadas"
                  value={data?.facturasProcesadas?.total || 0}
                  subtitle={`prom. ${getPromedioItems()} ítems`}
                />
                <KpiCard 
                  icon={ImageIcon}
                  label="Imágenes generadas"
                  value={data?.imagenesGeneradas?.total || 0}
                  subtitle="histórico creadas"
                />
              </div>
            ) : (
              <KpiGrid>
                <KpiCard 
                  icon={Package}
                  label="Productos procesados"
                  value={data?.productosProcesados?.total || 0}
                  subtitle="productos ingresados a stock"
                />
                <KpiCard 
                  icon={FileText}
                  label="Facturas procesadas"
                  value={data?.facturasProcesadas?.total || 0}
                  subtitle={`prom. ${getPromedioItems()} ítems por factura`}
                />
                <KpiCard 
                  icon={ImageIcon}
                  label="Imágenes generadas"
                  value={data?.imagenesGeneradas?.total || 0}
                  subtitle="listas para marketplace"
                />
              </KpiGrid>
            )}
          </div>
          
          {isResumen ? (
            <div className="charts-grid">
              <div className="chart-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="chart-title">Productos ingresados por mes</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={procesarDatosProductosPorMes()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="cantidad" fill="#4318FF" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="chart-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="chart-title">Facturas procesadas por mes</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={procesarFacturasPorMes()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="cantidad" fill="#05CD99" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="chart-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h3 className="chart-title">Leads al CRM por mes</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={procesarLeadsPorMes()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="cantidad" fill="#FFB547" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="resumen-detail">
              <DetailCard title="Detalles de Gestión de stock" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Resumen;
