import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Plus, ArrowRight } from 'lucide-react';
import Button from '../common/Button/Button';
import EmptyState from '../common/EmptyState/EmptyState';

export default function RecentDocuments({ recentDocs }) {
  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '60ms' }}>
      <div className="card-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} style={{ color: 'var(--brand-primary)' }} />
          Recent Documents
        </h3>
        <Link to="/documents">
          <Button variant="ghost" size="sm" icon={ArrowRight}>View all</Button>
        </Link>
      </div>
      <div className="card-body">
        {recentDocs.length === 0 ? (
          <EmptyState
            compact
            icon={<FileText size={28} />}
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
                <div className="recent-doc-icon">
                  <FileText size={18} />
                </div>
                <div className="recent-item-info">
                  <p className="recent-item-name">{doc.name}</p>
                  <p className="recent-item-meta">
                    <Clock size={11} /> {new Date(doc.createdAt).toLocaleDateString()}
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
    </div>
  );
}
