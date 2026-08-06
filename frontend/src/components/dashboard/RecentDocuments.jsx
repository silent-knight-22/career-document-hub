import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Plus, ArrowRight } from 'lucide-react';
import Button from '../common/Button/Button';
import EmptyState from '../common/EmptyState/EmptyState';

export default function RecentDocuments({ recentDocs }) {
  return (
    <section className="card dashboard-panel animate-fade-in-up" style={{ animationDelay: '60ms' }}>
      <div className="card-header">
        <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} style={{ color: 'var(--brand-primary)' }} aria-hidden="true" />
          Recent Documents
        </h3>
        <Link to="/documents">
          <Button variant="ghost" size="sm" iconRight={ArrowRight}>View all</Button>
        </Link>
      </div>
      <div className="card-body" style={{ padding: recentDocs.length ? '0.5rem 0 1rem' : undefined }}>
        {recentDocs.length === 0 ? (
          <EmptyState
            compact
            icon={<FileText size={24} />}
            title="No documents yet"
            description="Upload a document to sign it digitally"
            action={
              <Link to="/documents">
                <Button variant="outline" size="sm" icon={Plus}>Upload Document</Button>
              </Link>
            }
          />
        ) : (
          <div className="recent-list">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="recent-item">
                <div className="recent-doc-icon" aria-hidden="true">
                  <FileText size={16} />
                </div>
                <div className="recent-item-info">
                  <p className="recent-item-name">{doc.name}</p>
                  <p className="recent-item-meta">
                    <Clock size={11} aria-hidden="true" /> {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${doc.signed ? 'badge-success' : 'badge-warning'}`}>
                  {doc.signed ? 'Signed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
