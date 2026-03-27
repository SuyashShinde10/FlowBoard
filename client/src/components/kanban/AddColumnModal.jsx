import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../ui/Modal';

const AddColumnModal = ({ projectId, onClose }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: (title) => api.post(`/projects/${projectId}/columns`, { title }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      toast.success('Column added');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add column'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    mutate(title);
  };

  return (
    <Modal title="Add new column" onClose={onClose} size="modal-sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Column title</label>
          <input 
            className="input" 
            placeholder="e.g. In QA, Ready for Launch" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            autoFocus 
          />
        </div>

        <div className="modal-footer" style={{ margin: '16px -20px -20px -20px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending || !title.trim()}>
            {isPending ? 'Adding...' : 'Add column'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddColumnModal;
