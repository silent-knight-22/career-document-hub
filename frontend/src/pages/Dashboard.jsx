import { Link } from 'react-router-dom';
import {
  PenLine, FileText, Signature, TrendingUp,
  Clock, CheckCircle, Plus, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSignatures } from '../services/signatureService';
import { getDocuments, getDocumentStats } from '../services/documentService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import './Dashboard.css';

function StatCard({ icon: Icon, label, value, color, trend }) {
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

export default function Dashboard() {
  const { user } = useAuth();
  const signatures = getSignatures(user?.userId || '');
  const documents  = getDocuments(user?.userId  || '');
  const stats      = getDocumentStats(user?.userId || '');

  const firstName = user?.name?.split(' ')[0] || 'there';

  const recentSigs = [...signatures].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const recentDocs = [...documents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <div className="page-container">

          {/* Welcome Banner */}
          <div className="dashboard-banner animate-fade-in-up">
            <div className="dashboard-banner-text">
              <h2>{greeting}, {firstName}! 👋</h2>
              <p>Manage your digital signatures and documents all in one place.</p>
            </div>
            <div className="dashboard-banner-actions">
              <Link to="/signatures/create">
                <Button icon={PenLine} size="md">New Signature</Button>
              </Link>
              <Link to="/documents">
                <Button variant="secondary" icon={FileText} size="md">Upload Document</Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid stagger-children">
            <StatCard
              icon={Signature}
              label="Total Signatures"
              value={signatures.length}
              color="linear-gradient(135deg, #6366f1, #8b5cf6)"
              trend={signatures.length === 0 ? 'Create your first one →' : `${signatures.length} saved`}
            />
            <StatCard
              icon={FileText}
              label="Documents"
              value={stats.total}
              color="linear-gradient(135deg, #3b82f6, #06b6d4)"
              trend={`${stats.signed} signed`}
            />
            <StatCard
              icon={CheckCircle}
              label="Signed Documents"
              value={stats.signed}
              color="linear-gradient(135deg, #10b981, #059669)"
              trend={stats.total > 0 ? `${Math.round((stats.signed / stats.total) * 100) || 0}% complete` : 'No documents yet'}
            />
            <StatCard
              icon={TrendingUp}
              label="Pending"
              value={stats.unsigned}
              color="linear-gradient(135deg, #f59e0b, #ef4444)"
              trend={stats.unsigned > 0 ? 'Needs attention' : 'All caught up!'}
            />
          </div>

          {/* Recent Activity */}
          <div className="dashboard-grid">

            {/* Recent Signatures */}
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

            {/* Recent Documents */}
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
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <div className="empty-state-icon"><FileText size={28} /></div>
                    <h3>No documents yet</h3>
                    <p>Upload a document to sign it digitally</p>
                    <Link to="/documents">
                      <Button variant="outline" size="sm" icon={Plus}>Upload Document</Button>
                    </Link>
                  </div>
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

          </div>

          {/* Quick Actions */}
          <div className="quick-actions animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              {[
                { to: '/signatures/create', icon: PenLine,   label: 'Draw Signature',    desc: 'Use mouse or touch',          color: '#6366f1' },
                { to: '/signatures/create', icon: Signature,  label: 'Upload Signature',  desc: 'From image file',             color: '#8b5cf6' },
                { to: '/documents',         icon: FileText,   label: 'Sign Document',     desc: 'PDF, JPG, PNG',               color: '#3b82f6' },
                { to: '/profile',           icon: TrendingUp, label: 'View Profile',      desc: 'Account settings',            color: '#10b981' },
              ].map(({ to, icon: Icon, label, desc, color }) => (
                <Link key={label} to={to} className="quick-action-card hover-lift">
                  <div className="quick-action-icon" style={{ background: color }}>
                    <Icon size={20} color="white" />
                  </div>
                  <div>
                    <p className="quick-action-label">{label}</p>
                    <p className="quick-action-desc">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
