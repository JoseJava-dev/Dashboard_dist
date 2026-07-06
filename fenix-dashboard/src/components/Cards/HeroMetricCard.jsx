import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './HeroMetricCard.css';

const HeroMetricCard = ({ 
  label, 
  value, 
  prevValue, 
  subtitle, 
  breakdown = [] 
}) => {
  const calculateVariation = () => {
    if (!prevValue || prevValue === 0) return null;
    const variation = ((value - prevValue) / prevValue) * 100;
    return variation.toFixed(1);
  };

  const variation = calculateVariation();
  const isPositive = variation && variation > 0;

  return (
    <div className="card hero-card">
      <div className="hero-header">
        <span className="hero-label text-muted">{label}</span>
        {variation && (
          <div className={`hero-badge ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(variation)}%</span>
          </div>
        )}
      </div>
      
      <div className="hero-value">{value}</div>
      <div className="hero-subtitle text-muted text-small">{subtitle}</div>

      {breakdown && breakdown.length > 0 && (
        <div className="hero-breakdown">
          {breakdown.map((item, index) => {
            const maxVal = Math.max(...breakdown.map(b => b.value));
            const percentage = (item.value / maxVal) * 100;
            
            return (
              <div key={index} className="breakdown-row">
                <span className="breakdown-label text-small">{item.label}</span>
                <div className="breakdown-bar-container">
                  <div 
                    className="breakdown-bar" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="breakdown-value text-small font-semibold">{item.value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HeroMetricCard;
