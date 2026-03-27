import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, Users, Layout, Settings, Mail, Clock, ShieldCheck, Crown, User as UserIcon, Search, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import CreateProjectModal from '../components/workspace/CreateProjectModal';
import InviteMemberModal from '../components/workspace/InviteMemberModal';
import './WorkspacePage.css';

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState('projects');
  const [showCreateProj, setShowCreateProj] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings Tab State
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');
  const queryClient = useQueryClient();

  // Fetch workspace details
  const { data: ws, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => api.get(`/workspaces/${workspaceId}`).then(r => r.data),
    enabled: !!workspaceId,
  });

  // Sync state once fetched
  React.useEffect(() => {
    if (ws) {
      setEditName(ws.name || '');
      setEditDesc(ws.description || '');
      setEditColor(ws.color || '#6366f1');
    }
  }, [ws]);

  const { mutate: updateWorkspace, isPending: updating } = useMutation({
    mutationFn: (data) => api.put(`/workspaces/${workspaceId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace', workspaceId]);
      queryClient.invalidateQueries(['workspaces']);
      toast.success('Workspace updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update')
  });

  const { mutate: deleteWorkspace, isPending: deleting } = useMutation({
    mutationFn: () => api.delete(`/workspaces/${workspaceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces']);
      toast.success('Workspace deleted');
      navigate('/dashboard');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const { mutate: removeMember, isPending: removing } = useMutation({
    mutationFn: (userId) => api.delete(`/workspaces/${workspaceId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspace', workspaceId]);
      toast.success('Member removed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove')
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editName.trim()) return toast.error('Name is required');
    updateWorkspace({ name: editName, description: editDesc, color: editColor });
  };

  // Fetch projects in workspace
  const { data: projects = [], isLoading: projLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => api.get(`/projects/workspace/${workspaceId}`).then(r => r.data),
    enabled: !!workspaceId,
  });

  if (wsLoading || projLoading) return (
    <div className="workspace-page" style={{ padding: '40px 8%' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <Skeleton width="48px" height="48px" borderRadius={12} />
        <div>
          <Skeleton width="200px" height="28px" style={{ marginBottom: 8 }} />
          <Skeleton width="300px" height="16px" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <Skeleton width="100px" height="32px" />
        <Skeleton width="100px" height="32px" />
      </div>
      <div className="skeleton-grid">
         {[...Array(4)].map((_, i) => <Skeleton key={i} height="120px" borderRadius={12} />)}
      </div>
    </div>
  );
  if (!ws) return <div className="empty-state"><p>Workspace not found.</p></div>;

  const myRole = ws.members?.find(m => m.user?._id === user?._id)?.role;
  const isOwnerAdmin = myRole === 'admin';
  const isManagerOrAdmin = ['admin', 'manager'].includes(myRole);

  return (
    <div className="workspace-page">
      {/* Header */}
      <div className="ws-page-header">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="ws-page-icon" style={{ background: ws.color || '#6366f1' }}>
            {ws.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="ws-page-title-group">
            <h1 className="ws-page-title">{ws.name}</h1>
            <p className="ws-page-desc">{ws.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="ws-page-actions">
          {isManagerOrAdmin && (
            <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>
              <Mail size={14} /> Invite
            </button>
          )}
          {isManagerOrAdmin && (
            <button className="btn btn-primary" onClick={() => setShowCreateProj(true)}>
              <Plus size={14} /> New project
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="ws-tabs-container">
        <div className="ws-tabs">
          <button
            className={`ws-tab ${tab === 'projects' ? 'active' : ''}`}
            onClick={() => setTab('projects')}
          >
            <Layout size={14} />
            Projects
            <span className="ws-tab-badge">{projects.length}</span>
          </button>
          <button
            className={`ws-tab ${tab === 'members' ? 'active' : ''}`}
            onClick={() => setTab('members')}
          >
            <Users size={14} />
            Members
            <span className="ws-tab-badge">{ws.members?.length || 0}</span>
          </button>
          {isOwnerAdmin && (
            <button
              className={`ws-tab ${tab === 'settings' ? 'active' : ''}`}
              onClick={() => setTab('settings')}
            >
              <Settings size={14} />
              Settings
            </button>
          )}
        </div>

        <div className="ws-search-bar">
          <Search size={14} className="ws-search-icon" />
          <input 
            type="text" 
            placeholder={`Search ${tab}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Tab */}
      {tab === 'projects' && (
        <div className="projects-grid">
          {projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((proj, i) => (
            <motion.div
              key={proj._id}
              className="project-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/project/${proj._id}`)}
            >
              <div className="project-card-header">
                <div className="project-card-title-group">
                  <div className="project-card-dot" style={{ background: proj.color || '#6366f1' }} />
                  <h3 className="project-card-title">{proj.name}</h3>
                </div>
              </div>

              <p className="project-card-desc">
                {proj.description || 'No description provided for this project. Add one to give context.'}
              </p>

              <div className="project-card-footer">
                <div className="avatar-group">
                  {proj.members?.slice(0, 3).map((m, idx) => (
                    <Avatar key={idx} name={m.name || '?'} size="sm" src={m.avatar} style={{ border: '2px solid var(--color-surface-raised)' }} />
                  ))}
                  {proj.members?.length > 3 && (
                    <span className="text-xs text-tertiary ml-2">+{proj.members.length - 3}</span>
                  )}
                </div>
                <div className="project-card-meta">
                  <Clock size={12} />
                  {formatDistanceToNow(new Date(proj.updatedAt || proj.createdAt), { addSuffix: true })}
                </div>
              </div>
            </motion.div>
          ))}

          {projects.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Layout size={32} className="empty-state-icon" />
              <h3>No projects yet</h3>
              <p>Create a project to start managing tasks with your team</p>
              {isManagerOrAdmin && (
                <button className="btn btn-primary" onClick={() => setShowCreateProj(true)}>
                  <Plus size={14} /> Create project
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="members-list">
          {ws.members?.filter(m => m.user?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((m, i) => (
            <motion.div
              key={m.user?._id || i}
              className="member-row"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="member-info">
                <Avatar name={m.user?.name || '?'} size="md" src={m.user?.avatar} />
                <div>
                  <div className="member-name">
                    {m.user?.name} {m.user?._id === user?._id && <span className="text-tertiary text-xs ml-1">(You)</span>}
                  </div>
                  <div className="member-email">{m.user?.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {m.role === 'admin' && <Crown size={14} className="text-warning" />}
                {m.role === 'manager' && <ShieldCheck size={14} className="text-accent" />}
                {m.role === 'member' && <UserIcon size={14} className="text-tertiary" />}
                <span className={`badge badge-${m.role === 'admin' ? 'primary' : m.role === 'manager' ? 'warning' : 'default'}`}>
                  {m.role}
                </span>
                {isOwnerAdmin && m.user?._id !== user?._id && (
                  <button 
                    className="btn btn-ghost btn-icon btn-xs text-danger" 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${m.user?.name} from this workspace?`)) {
                        removeMember(m.user?._id);
                      }
                    }}
                    disabled={removing}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && isOwnerAdmin && (
        <motion.div className="settings-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="settings-card" style={{ background: 'var(--color-surface-raised)', padding: 24, borderRadius: 12, border: '1px solid var(--color-border)', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Workspace Details</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Workspace Name</label>
                <input className="input" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input" rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Theme Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                   {['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'].map(c => (
                     <div key={c} onClick={() => setEditColor(c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: editColor === c ? '2px solid white' : '2px solid transparent', boxShadow: editColor === c ? '0 0 0 2px var(--color-accent)' : 'none' }} />
                   ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={updating}>{updating ? 'Saving...' : 'Save changes'}</button>
              </div>
            </form>
          </div>

          <div className="settings-card" style={{ background: 'var(--color-surface-raised)', padding: 24, borderRadius: 12, border: '1px solid var(--color-border)', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Role & Permission Matrix</h3>
            <div className="scroll-x">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Action</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Admin</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Manager</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Member</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Workspace Management', '✅', '❌', '❌'],
                    ['Invite Members', '✅', '✅', '❌'],
                    ['Projects/Columns Management', '✅', '✅', '❌'],
                    ['Create/Edit Tasks', '✅', '✅', '✅'],
                    ['Delete Tasks', '✅', '✅', '❌'],
                    ['Assign Members', '✅', '✅', '❌'],
                    ['View Analytics', '✅', '✅', '❌'],
                  ].map(([act, adm, manager, mem], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 4px', color: 'var(--color-text-secondary)' }}>{act}</td>
                      <td style={{ padding: '10px 4px' }}>{adm}</td>
                      <td style={{ padding: '10px 4px' }}>{manager}</td>
                      <td style={{ padding: '10px 4px' }}>{mem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="settings-card" style={{ background: 'var(--color-surface-raised)', padding: 24, borderRadius: 12, border: '1px solid var(--color-border-danger)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-danger)', marginBottom: 8 }}>Danger Zone</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Permanently delete this workspace and all associated projects, tasks, and data. This action cannot be undone.</p>
            <button className="btn btn-danger" disabled={deleting} onClick={() => {
              if (window.confirm('Are you absolutely sure you want to delete this workspace and all its contents?')) {
                deleteWorkspace();
              }
            }}>
              {deleting ? 'Deleting...' : 'Delete workspace'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      {showCreateProj && <CreateProjectModal workspace={ws} onClose={() => setShowCreateProj(false)} />}
      {showInvite && <InviteMemberModal workspaceId={ws._id} onClose={() => setShowInvite(false)} />}
    </div>
  );
};

export default WorkspacePage;
