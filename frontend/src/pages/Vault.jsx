import { useState } from 'react';
import { Archive, Upload, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getVaultItems, addVaultItem, updateVaultItem, deleteVaultItem,
  toggleStar, VAULT_CATEGORIES
} from '../services/vaultService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import UploadModal from '../components/vault/UploadModal';
import VaultCard from '../components/vault/VaultCard';
import VaultToolbar from '../components/vault/VaultToolbar';
import './Vault.css';

// ---- Main Page ----
export default function Vault() {
  const { user } = useAuth();
  const [items, setItems]         = useState(() => getVaultItems(user?.userId || ''));
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [sortBy, setSortBy]       = useState('newest');

  const refresh = () => setItems(getVaultItems(user?.userId || ''));

  const handleSave = (data) => {
    addVaultItem(user.userId, data);
    toast.success('Document added to vault! 🗂️');
    refresh();
  };

  const handleDelete = (itemId) => {
    deleteVaultItem(user.userId, itemId);
    toast.success('Removed from vault');
    refresh();
  };

  const handleToggleStar = (itemId) => {
    toggleStar(user.userId, itemId);
    refresh();
  };

  const handleUpdateNote = (itemId, note) => {
    updateVaultItem(user.userId, itemId, { note });
    refresh();
  };

  // Filter & sort
  let filtered = [...items];
  if (search) filtered = filtered.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
    i.note?.toLowerCase().includes(search.toLowerCase())
  );
  if (filterCat !== 'all') filtered = filtered.filter((i) => i.category === filterCat);
  if (sortBy === 'name')    filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'starred') filtered.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  if (sortBy === 'expiry')  filtered.sort((a, b) => {
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  });

  const catCounts = {};
  items.forEach((i) => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Document Vault" />
        <div className="page-container">

          {/* Header */}
          <div className="page-header animate-fade-in-up">
            <div>
              <h2>Document Vault</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {items.length} document{items.length !== 1 ? 's' : ''} stored securely
              </p>
            </div>
            <Button icon={Upload} onClick={() => setShowUpload(true)}>Add Document</Button>
          </div>

          <VaultToolbar
            items={items}
            filterCat={filterCat}
            setFilterCat={setFilterCat}
            search={search}
            setSearch={setSearch}
            sortBy={sortBy}
            setSortBy={setSortBy}
            catCounts={catCounts}
          />

          {/* Grid */}
          {items.length === 0 ? (
            <div className="card animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <div className="empty-state">
                <div className="empty-state-icon animate-float">
                  <Archive size={32} />
                </div>
                <h3>Your vault is empty</h3>
                <p>Store your Aadhaar, marksheets, offer letters, certificates and more. Access them anytime, anywhere.</p>
                <Button icon={Upload} onClick={() => setShowUpload(true)}>Add Your First Document</Button>
              </div>
            </div>
          ) : (
            <>
              {filtered.length === 0 ? (
                <div className="vault-no-results">
                  <Search size={24} />
                  <p>No documents match &ldquo;{search}&rdquo;</p>
                  <button onClick={() => { setSearch(''); setFilterCat('all'); }}>Clear filters</button>
                </div>
              ) : (
                <div className="vault-grid stagger-children">
                  {filtered.map((item) => (
                    <VaultCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      onToggleStar={handleToggleStar}
                      onUpdateNote={handleUpdateNote}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSave={handleSave}
      />
    </div>
  );
}
