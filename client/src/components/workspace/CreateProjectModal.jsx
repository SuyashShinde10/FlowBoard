import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../ui/Modal';

const presetColors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

const CreateProjectModal = ({ workspace, onClose }) => {
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(presetColors[6]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post(`/projects`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects', workspace._id]);
      toast.success('Project created');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create project'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    mutate({ name, description, color, workspaceId: workspace._id });
  };

  return (
    <Modal title={`Create project in ${workspace?.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Project name</label>
          <input 
            className="input" 
            placeholder="e.g. Website Redesign" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            autoFocus 
          />
        </div>

        <div className="input-group">
          <label className="input-label">Description (Optional)</label>
          <textarea 
            className="input" 
            placeholder="What is this project about?" 
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
            {isPending ? 'Creating...' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
