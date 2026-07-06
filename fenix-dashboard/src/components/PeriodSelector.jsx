import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import './PeriodSelector.css';

const currentYear = new Date().getFullYear().toString();
const currentMonth = new Date().getMonth();

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const PeriodSelector = () => {
  const { period, setPeriod } = useDashboard();
  const isMonthSelected = period.startsWith('mes_') || period === 'este_mes';
  // Si el periodo es un mes, sacamos el número, sino mostramos el mes actual
  let selectedMonthValue = `mes_${currentMonth}`;
  if (period.startsWith('mes_')) {
    selectedMonthValue = period;
  } else if (period === 'este_mes') {
    selectedMonthValue = `mes_${currentMonth}`;
  }

  // Opciones disponibles: desde enero hasta el mes actual
  const monthOptions = [];
  for (let i = 0; i <= currentMonth; i++) {
    monthOptions.push({ id: `mes_${i}`, label: MONTHS[i] });
  }

  const handleMonthChange = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="period-selector">
      <button
        className={`period-btn ${period === 'hoy' ? 'active' : ''}`}
        onClick={() => setPeriod('hoy')}
      >
        Hoy
      </button>
      
      <button
        className={`period-btn ${period === 'esta_semana' ? 'active' : ''}`}
        onClick={() => setPeriod('esta_semana')}
      >
        Esta semana
      </button>

      <div className={`period-btn-select-wrapper ${isMonthSelected ? 'active' : ''}`}>
        <select 
          className="period-select"
          value={selectedMonthValue}
          onChange={handleMonthChange}
          // Si no está activo el select, al hacer clic forzamos que se active el mes actual
          onClick={(e) => {
            if (!isMonthSelected) {
              setPeriod(selectedMonthValue);
            }
          }}
        >
          {monthOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      <button
        className={`period-btn ${period === 'todo' ? 'active' : ''}`}
        onClick={() => setPeriod('todo')}
      >
        {currentYear}
      </button>
    </div>
  );
};

export default PeriodSelector;
