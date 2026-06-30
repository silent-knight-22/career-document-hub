import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Archive, Upload, Search, Star, Trash2, Download,
  Tag, Calendar, StickyNote, Filter, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Vault allows larger files (not rendered on canvas)
const MAX_FILE_SIZE    = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE_MB = 5;
import {
  getVaultItems, addVaultItem, updateVaultItem, deleteVaultItem,
  toggleStar, VAULT_CATEGORIES, getCategoryById, getExpiryStatus
} from '../services/vaultService';
import Navbar from '../components/layout/Navbar/Navbar';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import './Vault.css';

function formatBytes(b) {
  if (!b) return '';
  const k = 1024;
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${['B','KB','MB'][i]}`;
}

// ---- Upload Modal ----
function UploadModal({ isOpen, onClose, onSave }) {
  const [file, setFile]         = useState(null);
  const [category, setCategory] = useState('other');
  const [tags, setTags]         = useState('');
  const [note, setNote]         = useState('');
  const [expiry, setExpiry]     = useState('');
  const [saving, setSaving]     = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (files) => setFile(files[0]),
  });

  const reset = () => { setFile(null); setCategory('other'); setTags(''); setNote(''); setExpiry(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = () => {
    if (!file) { toast.error('Please select a file'); return; }
    // ── Size guard ────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File too large (${formatBytes(file.size)}). Max size is ${MAX_FILE_SIZE_MB} MB.`,
        { duration: 5000 }
      );
      return;
    }
    setSaving(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        onSave({
          name: file.name,
          dataUrl: e.target.result,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          size: file.size,
          category,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          note,
          expiryDate: expiry || null,
        });
      } catch (err) {
        if (err.name === 'QuotaExceededError' || err.code === 22) {
          toast.error('Storage full. Delete some documents to free space.');
        } else {
          toast.error('Upload failed. Please try again.');
        }
      } finally {
        setSaving(false);
        handleClose();
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
      setSaving(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add to Vault" size="md">
      <div className="upload-modal-body">
        {/* File drop */}
        {!file ? (
          <div {...getRootProps()} className={`vault-dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <Upload size={22} style={{ color: 'var(--brand-primary)' }} />
            <p>{isDragActive ? 'Drop it!' : 'Drop a file or click to browse'}</p>
            <span className="dropzone-formats">PDF · JPG · PNG · Any</span>
          </div>
        ) : (
          <div className="vault-file-chosen">
            <span className="vault-file-icon">📄</span>
            <div className="vault-file-info">
              <p className="vault-file-name">{file.name}</p>
              <p className="vault-file-size">{formatBytes(file.size)}</p>
            </div>
            <button className="vault-file-remove" onClick={() => setFile(null)}><X size={14} /></button>
          </div>
        )}

        {/* Category */}
        <div className="vault-form-group">
          <label className="vault-form-label">Category</label>
          <div className="category-pills">
            {VAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill ${category === cat.id ? 'active' : ''}`}
                style={category === cat.id ? { background: cat.color, color: 'white', borderColor: cat.color } : {}}
                onClick={() => setCategory(cat.id)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="vault-form-group">
          <label className="vault-form-label"><Tag size={13} /> Tags <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(comma separated)</span></label>
          <input
            className="vault-input"
            placeholder="internship, urgent, signed..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Expiry */}
        <div className="vault-form-group">
          <label className="vault-form-label"><Calendar size={13} /> Expiry Date <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
          <input
            className="vault-input"
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Note */}
        <div className="vault-form-group">
          <label className="vault-form-label"><StickyNote size={13} /> Note <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
          <textarea
            className="vault-input vault-textarea"
            placeholder="Add a private note about this document..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} disabled={!file}>Add to Vault</Button>
        </div>
      </div>
    </Modal>
  );
}

// ---- Vault Item Card ----
function VaultCard({ item, onDelete, onToggleStar, onUpdateNote }) {
  const cat    = getCategoryById(item.category);
  const expiry = getExpiryStatus(item.expiryDate);
  const [editNote, setEditNote] = useState(false);
  const [note, setNote]         = useState(item.note || '');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href     = item.dataUrl;
    a.download = item.name;
    a.click();
    toast.success('Downloading...');
  };

  const saveNote = () => {
    onUpdateNote(item.id, note);
    setEditNote(false);
    toast.success('Note saved');
  };

  return (
    <div className="vault-card card hover-lift animate-fade-in-up">
      {/* Category stripe */}
      <div className="vault-card-stripe" style={{ background: cat.color }} />

      <div className="vault-card-body">
        <div className="vault-card-top">
          <span className="vault-cat-badge" style={{ background: `${cat.color}18`, color: cat.color }}>
            {cat.emoji} {cat.label}
          </span>
          <button
            className={`vault-star-btn ${item.starred ? 'starred' : ''}`}
            onClick={() => onToggleStar(item.id)}
          >
            <Star size={15} fill={item.starred ? 'currentColor' : 'none'} />
          </button>
        </div>

        <p className="vault-item-name">{item.name}</p>
        <p className="vault-item-size">{formatBytes(item.size)}</p>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="vault-tags">
            {item.tags.map((t) => (
              <span key={t} className="vault-tag">#{t}</span>
            ))}
          </div>
        )}

        {/* Expiry badge */}
        {expiry && (
          <span className="vault-expiry-badge" style={{ background: expiry.bg, color: expiry.color }}>
            <Calendar size={10} /> {expiry.label}
          </span>
        )}

        {/* Note */}
        {editNote ? (
          <div className="vault-note-edit">
            <textarea
              className="vault-input vault-textarea"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="sm" onClick={saveNote}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditNote(false)}>Cancel</Button>
            </div>
          </div>
        ) : item.note ? (
          <p className="vault-note" onClick={() => setEditNote(true)}>
            <StickyNote size={11} /> {item.note}
          </p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="vault-card-footer">
        <button
          className="vault-action"
          onClick={() => setEditNote(true)}
          title="Add note"
        >
          <StickyNote size={14} />
        </button>
        <button className="vault-action" onClick={handleDownload} title="Download">
          <Download size={14} />
        </button>
        <button className="vault-action danger" onClick={() => onDelete(item.id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

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

          {/* Category summary strip */}
          <div className="vault-cat-strip animate-fade-in-up" style={{ animationDelay: '40ms' }}>
            <button
              className={`vault-cat-chip ${filterCat === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCat('all')}
            >
              All <span className="chip-count">{items.length}</span>
            </button>
            {VAULT_CATEGORIES.map((cat) => (
              catCounts[cat.id] ? (
                <button
                  key={cat.id}
                  className={`vault-cat-chip ${filterCat === cat.id ? 'active' : ''}`}
                  style={filterCat === cat.id ? { borderColor: cat.color, color: cat.color, background: `${cat.color}12` } : {}}
                  onClick={() => setFilterCat(filterCat === cat.id ? 'all' : cat.id)}
                >
                  {cat.emoji} {cat.label} <span className="chip-count">{catCounts[cat.id]}</span>
                </button>
              ) : null
            ))}
          </div>

          {/* Search & sort bar */}
          <div className="vault-toolbar animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <div className="vault-search">
              <Search size={15} />
              <input
                className="vault-search-input"
                placeholder="Search by name, tag, or note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="vault-clear-search" onClick={() => setSearch('')}><X size={13} /></button>}
            </div>
            <div className="vault-sort">
              <Filter size={14} />
              <select
                className="vault-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="name">Name A–Z</option>
                <option value="starred">Starred first</option>
                <option value="expiry">Expiring soon</option>
              </select>
            </div>
          </div>

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
