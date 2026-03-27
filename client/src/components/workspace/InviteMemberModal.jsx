import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../ui/Modal';

const InviteMemberModal = ({ workspaceId, onClose }) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post(`/workspaces/${workspaceId}/invite`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace', workspaceId]);
      queryClient.invalidateQueries(['workspaces']);
      toast.success('Member invited successfully');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to invite member'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !role) return toast.error('Email and role are required');
    mutate({ email, role });
  };

  return (
    <Modal title="Invite member" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p className="text-secondary text-sm">
          Invite teammates to collaborate on all projects within this workspace.
        </p>

        <div className="input-group">
          <label className="input-label">Email address</label>
          <input 
            className="input" 
            type="email" 
            placeholder="colleague@company.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            autoFocus 
          />
        </div>

        <div className="input-group">
          <label className="input-label">Role</label>
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="member">Member (Can view and edit tasks)</option>
            <option value="manager">Manager (Can manage projects)</option>
            <option value="admin">Admin (Full workspace control)</option>
          </select>
        </div>

        <div className="modal-footer" style={{ margin: '16px -20px -20px -20px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending || !email.trim()}>
            {isPending ? 'Sending invite...' : 'Send invitation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
