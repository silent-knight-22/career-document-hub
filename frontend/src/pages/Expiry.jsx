import { useState } from 'react';
import { AlarmClock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getVaultItems, updateVaultItem, getExpiryStatus } from '../services/vaultService';
import { getCertificates, getCertExpiryStatus } from '../services/certificateService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import ExpiryRow from '../components/expiry/ExpiryRow';
import './Expiry.css';

export default function ExpiryTracker() {
  const { user } = useAuth();

  const [vaultItems, setVaultItems]   = useState(() => getVaultItems(user?.userId || '').filter((i) => i.expiryDate));
  const [certs, setCerts]             = useState(() => getCertificates(user?.userId || '').filter((c) => c.expiryDate));

  const refresh = () => {
    setVaultItems(getVaultItems(user?.userId || '').filter((i) => i.expiryDate));
    setCerts(getCertificates(user?.userId || '').filter((c) => c.expiryDate));
  };

  const handleRemoveExpiry = (itemId, source) => {
    if (source === 'vault') {
      updateVaultItem(user.userId, itemId, { expiryDate: null });
    }
    // For certificates, could update similarly
    toast.success('Expiry tracking removed');
    refresh();
  };

  // Merge and annotate
  const allItems = [
    ...vaultItems.map((i) => ({ ...i, source: 'vault', status: getExpiryStatus(i.expiryDate) })),
    ...certs.map((c) => ({ ...c, source: 'cert', status: getCertExpiryStatus(c.expiryDate) })),
  ].sort((a, b) => {
    // Sort: expired first, then by days ascending
    const da = a.status?.days ?? 9999;
    const db = b.status?.days ?? 9999;
    return da - db;
  });

  const expired  = allItems.filter((i) => (i.status?.days ?? 1) < 0);
  const soon30   = allItems.filter((i) => i.status?.days >= 0 && i.status.days <= 30);
  const soon90   = allItems.filter((i) => i.status?.days > 30  && i.status.days <= 90);
  const safe     = allItems.filter((i) => i.status?.days > 90);

  const SectionHeader = ({ color, emoji, label, count }) => (
    count > 0 ? (
      <div className="expiry-section-header">
        <span style={{ color }}>{emoji} {label}</span>
        <span className="expiry-section-count" style={{ background: `${color}18`, color }}>{count}</span>
      </div>
    ) : null
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Expiry Tracker" />
        <div className="page-container">

          <div className="page-header animate-fade-in-up">
            <div>
              <h2>Expiry Tracker</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Tracking {allItems.length} item{allItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Summary cards */}
          {allItems.length > 0 && (
            <div className="expiry-summary animate-fade-in-up" style={{ animationDelay: '40ms' }}>
              {[
                { label: 'Expired',    count: expired.length,  color: '#ef4444', bg: '#fee2e2', emoji: '🔴' },
                { label: 'Due <30d',   count: soon30.length,   color: '#f59e0b', bg: '#fef3c7', emoji: '🟠' },
                { label: 'Due <90d',   count: soon90.length,   color: '#3b82f6', bg: '#dbeafe', emoji: '🟡' },
                { label: 'All Good',   count: safe.length,     color: '#10b981', bg: '#d1fae5', emoji: '🟢' },
              ].map(({ label, count, color, bg, emoji }) => (
                <div key={label} className="expiry-stat" style={{ borderColor: `${color}30`, background: bg }}>
                  <span className="expiry-stat-emoji">{emoji}</span>
                  <span className="expiry-stat-count" style={{ color }}>{count}</span>
                  <span className="expiry-stat-label" style={{ color }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {allItems.length === 0 ? (
            <div className="card animate-fade-in-up">
              <div className="empty-state">
                <div className="empty-state-icon animate-float"><AlarmClock size={32} /></div>
                <h3>No expiry dates tracked</h3>
                <p>
                  When you add documents to your <strong>Vault</strong> or <strong>Certificates</strong> with an expiry date,
                  they'll appear here so you never miss a renewal.
                </p>
              </div>
            </div>
          ) : (
            <div className="expiry-list animate-fade-in-up card" style={{ animationDelay: '80ms', padding: 0, overflow: 'hidden' }}>
              <SectionHeader emoji="🔴" label="Expired" color="#ef4444" count={expired.length} />
              {expired.map((i) => <ExpiryRow key={i.id} item={i} source={i.source} status={i.status} onRemoveExpiry={handleRemoveExpiry} />)}

              <SectionHeader emoji="🟠" label="Expiring in 30 days" color="#f59e0b" count={soon30.length} />
              {soon30.map((i) => <ExpiryRow key={i.id} item={i} source={i.source} status={i.status} onRemoveExpiry={handleRemoveExpiry} />)}

              <SectionHeader emoji="🟡" label="Expiring in 90 days" color="#3b82f6" count={soon90.length} />
              {soon90.map((i) => <ExpiryRow key={i.id} item={i} source={i.source} status={i.status} onRemoveExpiry={handleRemoveExpiry} />)}

              <SectionHeader emoji="🟢" label="All Good" color="#10b981" count={safe.length} />
              {safe.map((i) => <ExpiryRow key={i.id} item={i} source={i.source} status={i.status} onRemoveExpiry={handleRemoveExpiry} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
