import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAppStore from '../../store/appStore';
import Modal from '../ui/Modal';

const presetColors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

const CreateWorkspaceModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useAppStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(presetColors[5]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/workspaces', data).then(r => r.data),
    onSuccess: (newWs) => {
      queryClient.invalidateQueries(['workspaces']);
      setActiveWorkspace(newWs);
      toast.success('Workspace created');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create workspace'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    mutate({ name, description, color });
  };

  return (
    <Modal title="Create workspace" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Workspace name</label>
          <input 
            className="input" 
            placeholder="e.g. Acme Corp" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            autoFocus 
          />
        </div>

        <div className="input-group">
          <label className="input-label">Description (Optional)</label>
          <textarea 
            className="input" 
            placeholder="What is this workspace for?" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={3} 
          />
        </div>

        <div className="input-group">
          <label className="input-label">Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {presetColors.map(c => (
              <button
                key={c}
                type="button"
                className="btn btn-icon"
                style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: c,
                  border: color === c ? '2px solid var(--color-text)' : '2px solid transparent',
                  padding: 0
                }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '16px -20px -20px -20px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending || !name.trim()}>
            {isPending ? 'Creating...' : 'Create workspace'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
