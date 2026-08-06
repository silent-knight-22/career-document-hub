import { Link } from 'react-router-dom';
import {
  PenLine, FileText, Signature, TrendingUp, CheckCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSignatures } from '../services/signatureService';
import { getDocuments, getDocumentStats } from '../services/documentService';
import PageLayout from '../components/layout/PageLayout/PageLayout';
import Button from '../components/common/Button/Button';
import StatCard from '../components/dashboard/StatCard';
import RecentSignatures from '../components/dashboard/RecentSignatures';
import RecentDocuments from '../components/dashboard/RecentDocuments';
import './Dashboard.css';

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
    <PageLayout title="Dashboard">
      <section className="dashboard-banner animate-fade-in-up" aria-label="Welcome">
        <div className="dashboard-banner-text">
          <p className="dashboard-banner-eyebrow">
            <Sparkles size={12} aria-hidden="true" />
            Career Document Hub
          </p>
          <h2>{greeting}, {firstName}</h2>
          <p>Manage signatures, documents, and career credentials in one place.</p>
        </div>
        <div className="dashboard-banner-actions">
          <Link to="/signatures/create">
            <Button icon={PenLine} size="md">New Signature</Button>
          </Link>
          <Link to="/documents">
            <Button className="btn-on-brand" icon={FileText} size="md">Upload Document</Button>
          </Link>
        </div>
      </section>

      <section className="stats-grid stagger-children" aria-label="Overview stats">
        <StatCard
          icon={Signature}
          label="Total Signatures"
          value={signatures.length}
          color="linear-gradient(135deg, #6366f1, #8b5cf6)"
          trend={signatures.length === 0 ? 'Create your first one' : `${signatures.length} saved`}
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
          trend={stats.unsigned > 0 ? 'Needs attention' : 'All caught up'}
        />
      </section>

      <section className="dashboard-grid" aria-label="Recent activity">
        <RecentSignatures recentSigs={recentSigs} />
        <RecentDocuments recentDocs={recentDocs} />
      </section>

      <section className="quick-actions animate-fade-in-up" style={{ animationDelay: '80ms' }} aria-label="Quick actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {[
            { to: '/signatures/create', icon: PenLine,   label: 'Draw Signature',    desc: 'Mouse or touch',     color: '#6366f1' },
            { to: '/signatures/create', icon: Signature,  label: 'Upload Signature',  desc: 'From image file',    color: '#8b5cf6' },
            { to: '/documents',         icon: FileText,   label: 'Sign Document',     desc: 'PDF, JPG, PNG',      color: '#3b82f6' },
            { to: '/profile',           icon: TrendingUp, label: 'View Profile',      desc: 'Account settings',   color: '#10b981' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={label} to={to} className="quick-action-card">
              <div className="quick-action-icon" style={{ background: color }} aria-hidden="true">
                <Icon size={18} color="white" />
              </div>
              <div>
                <p className="quick-action-label">{label}</p>
                <p className="quick-action-desc">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
