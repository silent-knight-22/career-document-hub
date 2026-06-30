import { useState } from 'react';
import { Award, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getCertificates, addCertificate, deleteCertificate
} from '../services/certificateService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import AddCertModal from '../components/certificates/AddCertModal';
import CertCard from '../components/certificates/CertCard';
import './Certificates.css';

// ---- Main Page ----
export default function Certificates() {
  const { user } = useAuth();
  const [certs, setCerts]     = useState(() => getCertificates(user?.userId || ''));
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch]   = useState('');

  const refresh = () => setCerts(getCertificates(user?.userId || ''));

  const handleSave = (data) => {
    addCertificate(user.userId, data);
    toast.success('Certificate added! 🏆');
    refresh();
  };

  const handleDelete = (certId) => {
    deleteCertificate(user.userId, certId);
    toast.success('Certificate removed');
    refresh();
  };

  const filtered = certs.filter((c) =>
    `${c.name} ${c.issuer}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Certificates" />
        <div className="page-container">

          <div className="page-header animate-fade-in-up">
            <div>
              <h2>My Certificates</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {certs.length} certificate{certs.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button icon={Plus} onClick={() => setShowAdd(true)}>Add Certificate</Button>
          </div>

          {certs.length > 0 && (
            <div className="vault-search animate-fade-in-up" style={{ animationDelay: '40ms', marginBottom: '1.25rem' }}>
              <Search size={15} />
              <input
                className="vault-search-input"
                placeholder="Search by name or issuer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {certs.length === 0 ? (
            <div className="card animate-fade-in-up">
              <div className="empty-state">
                <div className="empty-state-icon animate-float"><Award size={32} /></div>
                <h3>No certificates yet</h3>
                <p>Add your AWS, Google, NPTEL, Coursera, or any other certificates to keep them organized.</p>
                <Button icon={Plus} onClick={() => setShowAdd(true)}>Add Your First Certificate</Button>
              </div>
            </div>
          ) : (
            <div className="cert-grid stagger-children">
              {filtered.map((cert) => (
                <CertCard key={cert.id} cert={cert} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddCertModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />
    </div>
  );
}
