import React from 'react';

export default function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <article className="stat-card animate-fade-in-up">
      <div className="stat-card-icon" style={{ background: color }} aria-hidden="true">
        <Icon size={18} color="white" strokeWidth={2.25} />
      </div>
      <div className="stat-card-content">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {trend ? <p className="stat-card-trend">{trend}</p> : null}
      </div>
    </article>
  );
}
