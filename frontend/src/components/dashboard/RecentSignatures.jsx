import React from 'react';
import { Link } from 'react-router-dom';
import { Signature, Clock, Plus, ArrowRight } from 'lucide-react';
import Button from '../common/Button/Button';
import EmptyState from '../common/EmptyState/EmptyState';

export default function RecentSignatures({ recentSigs }) {
  return (
    <section className="card dashboard-panel animate-fade-in-up">
      <div className="card-header">
        <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Signature size={16} style={{ color: 'var(--brand-primary)' }} aria-hidden="true" />
          Recent Signatures
        </h3>
        <Link to="/signatures">
          <Button variant="ghost" size="sm" iconRight={ArrowRight}>View all</Button>
        </Link>
      </div>
      <div className="card-body" style={{ padding: recentSigs.length ? '0.5rem 0 1rem' : undefined }}>
        {recentSigs.length === 0 ? (
          <EmptyState
            compact
            icon={<Signature size={24} />}
            title="No signatures yet"
            description="Create your first digital signature"
            action={
              <Link to="/signatures/create">
                <Button variant="outline" size="sm" icon={Plus}>Create Signature</Button>
              </Link>
            }
          />
        ) : (
          <div className="recent-list">
            {recentSigs.map((sig) => (
              <div key={sig.id} className="recent-item">
                <div className="recent-sig-preview">
                  <img src={sig.dataUrl} alt="" />
                </div>
                <div className="recent-item-info">
                  <p className="recent-item-name">{sig.name}</p>
                  <p className="recent-item-meta">
                    <Clock size={11} aria-hidden="true" /> {new Date(sig.createdAt).toLocaleDateString()}
                    {sig.isDefault && <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Default</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
