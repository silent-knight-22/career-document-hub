import React from 'react';

export default function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className={`stat-card hover-lift animate-fade-in-up`}>
      <div className="stat-card-icon" style={{ background: color }}>
        <Icon size={20} color="white" />
      </div>
      <div className="stat-card-content">
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
        {trend && <p className="stat-card-trend">{trend}</p>}
      </div>
    </div>
  );
}
