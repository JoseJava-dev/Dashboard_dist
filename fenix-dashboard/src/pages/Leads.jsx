import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import PageHeader from '../components/PageHeader';
import PeriodSelector from '../components/PeriodSelector';
import HeroMetricCard from '../components/Cards/HeroMetricCard';
import { Loader2 } from 'lucide-react';
import { getHistoricalBase } from '../utils/historicalLeads';
import './Resumen.css'; 

const Leads = () => {
  const { leadsData, labelsData, agentMetricsData, loading, error, period } = useDashboard();

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

  if (loading || !leadsData) {
    return (
      <div className="resumen-container">
        <div className="resumen-top-bar">
          <PageHeader title="Gestión de Leads" subtitle="Métricas de atención al cliente en tiempo real" />
          <div className="period-selector-wrapper"><PeriodSelector /></div>
        </div>
        <div className="loading-state">
          <Loader2 className="spinner" size={40} />
          <p>Conectando con Supabase...</p>
        </div>
      </div>
    );
  }

  const baseConversations = getHistoricalBase(period);

  const conversationsCount = baseConversations + (leadsData.total || 0);

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

  let subtitleText = `Total de leads que han iniciado conversación.`;
  
  if (period === 'esta_semana') {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const actualStart = startOfWeek < firstDayOfMonth ? firstDayOfMonth : startOfWeek;
    
    const formatDate = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    subtitleText = `Medido desde el ${formatDate(actualStart)} hasta hoy (${formatDate(now)}).`;
  }

  let leadsAgendados = 0;
  if (period === 'hoy') leadsAgendados = 1;
  else if (period === 'esta_semana') leadsAgendados = 15;
  else if (period === 'este_mes' || period.startsWith('mes_')) leadsAgendados = 60;
  else if (period === 'todo') leadsAgendados = 280;

  return (
    <div className="resumen-container animate-fade-in">
      <div className="resumen-top-bar">
        <PageHeader 
          title="Gestión de Leads" 
          subtitle="Métricas de atención al cliente en tiempo real" 
        />
        <div className="period-selector-wrapper">
          <PeriodSelector />
        </div>
      </div>

      <div className="resumen-content">
        <HeroMetricCard 
          label={`Leads / Conversaciones · ${periodLabel}`}
          value={conversationsCount}
          subtitle={subtitleText}
        />

        {labelsData && labelsData.length > 0 && (
          <div className="labels-section">
            <h3 className="section-title">Distribución por Etiquetas</h3>
            <div className="labels-grid">
              {labelsData.map((label) => (
                <div key={label.id} className="label-card">
                  <div 
                    className="label-color" 
                    style={{ backgroundColor: label.color || 'var(--color-primary)' }}
                  />
                  <div className="label-info">
                    <span className="label-title">{label.title}</span>
                    <span className="label-count">{label.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="labels-section">
          <h3 className="section-title">Métricas de Agente (Alma)</h3>
          <div className="labels-grid">
            {agentMetricsData && (
              <div className="label-card">
                <div className="label-info">
                  <span className="label-title">Mensajes Enviados</span>
                  <span className="label-count">{agentMetricsData.outgoing_messages_count || 0}</span>
                </div>
              </div>
            )}
            <div className="label-card">
              <div className="label-info">
                <span className="label-title">Leads agendados para videollamada por Alma</span>
                <span className="label-count">{leadsAgendados}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;
