import React from 'react';
import { Link } from 'react-router-dom';
import { Signature, Clock, Plus, ArrowRight } from 'lucide-react';
import Button from '../common/Button/Button';

export default function RecentSignatures({ recentSigs }) {
  return (
    <div className="card animate-fade-in-up">
      <div className="card-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Signature size={18} style={{ color: 'var(--brand-primary)' }} />
          Recent Signatures
        </h3>
        <Link to="/signatures">
          <Button variant="ghost" size="sm" icon={ArrowRight}>View all</Button>
        </Link>
      </div>
      <div className="card-body">
        {recentSigs.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon"><Signature size={28} /></div>
            <h3>No signatures yet</h3>
            <p>Create your first digital signature</p>
            <Link to="/signatures/create">
              <Button variant="outline" size="sm" icon={Plus}>Create Signature</Button>
            </Link>
          </div>
        ) : (
          <div className="recent-list">
            {recentSigs.map((sig) => (
              <div key={sig.id} className="recent-item">
                <div className="recent-sig-preview">
                  <img src={sig.dataUrl} alt={sig.name} />
                </div>
                <div className="recent-item-info">
                  <p className="recent-item-name">{sig.name}</p>
                  <p className="recent-item-meta">
                    <Clock size={11} /> {new Date(sig.createdAt).toLocaleDateString()}
                    {sig.isDefault && <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Default</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
