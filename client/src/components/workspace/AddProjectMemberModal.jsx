import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { UserPlus, UserMinus, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';

const AddProjectMemberModal = ({ projectId, currentMembers = [], onClose }) => {
  const queryClient = useQueryClient();
  const { workspaceId } = useParams(); // Need this for workspace member list
  const [search, setSearch] = React.useState('');

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => api.get(`/workspaces/${workspaceId}`).then(r => r.data),
    enabled: !!workspaceId
  });

  const { mutate: addMember, isPending: adding } = useMutation({
    mutationFn: (userId) => api.post(`/projects/${projectId}/members`, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      toast.success('Member added to project');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add member')
  });

  const currentMemberIds = currentMembers.map(m => m._id);
  const eligibleMembers = workspace?.members?.filter(m => 
    !currentMemberIds.includes(m.user._id) && 
    (m.user.name.toLowerCase().includes(search.toLowerCase()) || m.user.email.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <Modal title="Add members to project" onClose={onClose} showFooter={false}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Team members must be in the workspace to be added to this project.
        </p>
        <div className="ws-search-bar">
          <Search size={14} className="ws-search-icon" />
          <input 
            type="text" 
            placeholder="Search team members..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {isLoading ? <p>Loading members...</p> : (
            eligibleMembers.length === 0 ? <p style={{ textAlign: 'center', opacity: 0.5, padding: 20 }}>No matching workspace members found</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {eligibleMembers.map(m => (
                        <div key={m.user._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar name={m.user.name} src={m.user.avatar} size="sm" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.user.name}</div>
                                <div style={{ fontSize: 11, opacity: 0.6 }}>{m.user.email}</div>
                            </div>
                            <button 
                                className="btn btn-secondary btn-sm" 
                                disabled={adding}
                                onClick={() => addMember(m.user._id)}
                            >
                                <UserPlus size={14} /> Add
                            </button>
                        </div>
                    ))}
                </div>
            )
        )}
      </div>
    </Modal>
  );
};

export default AddProjectMemberModal;
