import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import api from '../../services/api';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import AddProjectMemberModal from '../workspace/AddProjectMemberModal';

const CreateTaskModal = ({ projectId, workspaceId, columnId, project, onClose, myRole }) => {
  const isManagerOrAdmin = ['admin', 'manager'].includes(myRole);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/tasks', data).then(r => r.data),
    onSuccess: (newTask) => {
      // Optimistic update logic is generally better, but a refetch is safer here since socket might also hit
      queryClient.invalidateQueries(['tasks', projectId]);
      toast.success('Task created');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create task'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    mutate({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      assignees,
      projectId: projectId,
      workspaceId: workspaceId,
      columnId,
    });
  };

  const toggleAssignee = (userId) => {
    setAssignees(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  return (
    <Modal title="Create new task" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Task title</label>
          <input 
            className="input" 
            placeholder="e.g. Implement user authentication" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            autoFocus 
          />
        </div>

        <div className="input-group">
          <label className="input-label">Description (Optional)</label>
          <textarea 
            className="input" 
            placeholder="Provide details about what needs to be done..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={3} 
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Priority</label>
            <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Due Date (Optional)</label>
            <input 
              className="input" 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
            />
          </div>
        </div>

        {isManagerOrAdmin && project?.members?.length > 0 && (
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Assignees (Optional)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    style={{ fontSize: 11, padding: '2px 8px 2px 26px', height: 24, borderRadius: 4, border: '1px solid var(--color-border)', background: 'transparent' }}
                  />
                </div>
                <button type="button" className="text-accent text-xs hover-underline" onClick={() => setShowAddMember(true)}>
                  Add Team
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 120, overflowY: 'auto', padding: 2 }}>
              {project.members.filter(m => m.name.toLowerCase().includes(assigneeSearch.toLowerCase())).map(m => {
                const isSelected = assignees.includes(m._id);
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => toggleAssignee(m._id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 8px 4px 4px',
                      borderRadius: 6,
                      border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-surface-raised)',
                      cursor: 'pointer',
                      transition: 'all var(--t-fast)'
                    }}
                  >
                    <Avatar name={m.name || '?'} size="sm" src={m.avatar} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: isSelected ? 'var(--color-text)' : 'var(--color-text)' }}>
                      {m.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showAddMember && (
          <AddProjectMemberModal 
            projectId={projectId}
            currentMembers={project.members}
            onClose={() => setShowAddMember(false)}
          />
        )}

        <div className="modal-footer" style={{ margin: '16px -20px -20px -20px' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isPending || !title.trim()}>
            {isPending ? 'Creating...' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
