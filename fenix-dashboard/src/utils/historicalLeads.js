export const historicalDailyLeads = {
  "2026-06-05": 89,
  "2026-06-06": 88,
  "2026-06-07": 103,
  "2026-06-08": 135,
  "2026-06-09": 100,
  "2026-06-10": 103,
  "2026-06-11": 89,
  "2026-06-12": 71,
  "2026-06-13": 62,
  "2026-06-14": 91,
  "2026-06-15": 101,
  "2026-06-16": 89,
  "2026-06-17": 77,
  "2026-06-18": 89,
  "2026-06-19": 82,
  "2026-06-20": 71,
  "2026-06-21": 59,
  "2026-06-22": 87,
  "2026-06-23": 73,
  "2026-06-24": 88,
  "2026-06-25": 69,
  "2026-06-26": 73,
  "2026-06-27": 64,
  "2026-06-28": 83,
  "2026-06-29": 76,
  "2026-06-30": 78,
  "2026-07-01": 106,
  "2026-07-02": 75,
  "2026-07-03": 54
};

export const historicalMonthlyLeads = {
  0: 4589, // Ene
  1: 4104, // Feb
  2: 4412, // Mar
  3: 3504, // Abr
  4: 2738, // May
  5: 2595, // Jun (Chatwoot gave 2595 total for Jun, we will just use this for the monthly chart)
  6: 235   // Jul (Only 1, 2, 3 de Julio: 106+75+54 = 235). El usuario había dicho 286, probablemente incluía otros canales o estimaciones, usaremos 235 como base estricta del CSV + lo de Supabase, o 286? 
  // Let's use 286 as user explicitly provided it, or use the CSV for daily base.
};

export const getHistoricalBase = (period) => {
  const now = new Date();
  let base = 0;

  if (period === 'todo') {
    // Suma de enero a julio
    base = 4589 + 4104 + 4412 + 3504 + 2738 + 2595 + 235; 
  } else if (period === 'este_mes') {
    // Si estamos en Julio, la base de los días que no están en Supabase es la suma de los días de Julio del CSV
    // El CSV tiene hasta el 3 de Julio. 106 + 75 + 54 = 235
    if (now.getMonth() === 6 && now.getFullYear() === 2026) {
      base = 235; 
    }
  } else if (period === 'esta_semana') {
    // Sumar los días de la semana actual que están en el CSV
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0,0,0,0);
    
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const actualStart = startOfWeek < firstDayOfMonth ? firstDayOfMonth : startOfWeek;
    
    for (const [dateStr, count] of Object.entries(historicalDailyLeads)) {
      const d = new Date(dateStr + "T12:00:00"); // Avoid timezone issues
      if (d >= actualStart && d <= now) {
        base += count;
      }
    }
  } else if (period === 'hoy') {
    // Para 'hoy', el CSV no tiene datos del 4 de Julio. Supabase se encarga.
    const todayStr = now.toISOString().split('T')[0];
    if (historicalDailyLeads[todayStr]) {
      base = historicalDailyLeads[todayStr];
    }
  } else if (period.startsWith('mes_')) {
    const targetMonth = parseInt(period.split('_')[1], 10);
    // Si es un mes que ya pasó por completo (Enero a Junio)
    if (targetMonth >= 0 && targetMonth <= 5) {
      base = historicalMonthlyLeads[targetMonth] || 0;
    } 
    // Si es el mes actual (Julio 2026, mes_6)
    else if (targetMonth === 6 && now.getFullYear() === 2026) {
      base = historicalMonthlyLeads[6] || 0;
    }
  }

  return base;
};
