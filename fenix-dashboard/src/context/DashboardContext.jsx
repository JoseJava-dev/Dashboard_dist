import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDashboardData, getLeadsData, getBaserowData, getChatwootLabelMetrics, getChatwootAgentMetrics, supabase } from '../services/api';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [period, setPeriod] = useState('hoy');
  const [data, setData] = useState(null);
  const [leadsData, setLeadsData] = useState(null);
  const [labelsData, setLabelsData] = useState([]);
  const [agentMetricsData, setAgentMetricsData] = useState(null);
  const [baserowData, setBaserowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dbData, cwData, brData, cwLabels, cwAgentMetrics] = await Promise.all([
        getDashboardData(period),
        getLeadsData(period),
        getBaserowData(),
        getChatwootLabelMetrics(period),
        getChatwootAgentMetrics(period)
      ]);
      setData(dbData);
      setLeadsData(cwData);
      setBaserowData(brData);
      setLabelsData(cwLabels);
      setAgentMetricsData(cwAgentMetrics);
    } catch (err) {
      setError('Error al cargar métricas de la base de datos');
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial y cambio de periodo
  useEffect(() => {
    fetchAllData();
  }, [period]);

  /* 
  // Suscripción en tiempo real a Supabase deshabilitada temporalmente
  // debido a que el servidor de Supabase no tiene el puerto WSS expuesto correctamente.
  useEffect(() => {
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'eventos_automatizacion' },
        (payload) => {
          console.log('Nuevo evento recibido en tiempo real!', payload);
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  */

  return (
    <DashboardContext.Provider value={{ period, setPeriod, data, leadsData, labelsData, agentMetricsData, baserowData, loading, error }}>
      {children}
    </DashboardContext.Provider>
  );
};
