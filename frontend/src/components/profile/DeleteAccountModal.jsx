import React from 'react';
import Modal from '../common/Modal/Modal';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import { Trash2 } from 'lucide-react';

export default function DeleteAccountModal({ isOpen, onClose, email, deleteInput, setDeleteInput, onDeleteConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account" size="sm">
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        This will permanently delete your account, all signatures, and all documents. This action <strong>cannot be undone</strong>.
      </p>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600 }}>
        Type your email <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>{email}</code> to confirm:
      </p>
      <Input
        id="delete-confirm"
        placeholder={email}
        value={deleteInput}
        onChange={(e) => setDeleteInput(e.target.value)}
      />
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onDeleteConfirm} disabled={deleteInput !== email} icon={Trash2}>
          Delete Forever
        </Button>
      </div>
    </Modal>
  );
}
