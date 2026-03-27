import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Users, ChevronRight, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/authStore';
import useAppStore from '../store/appStore';
import api from '../services/api';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import CreateWorkspaceModal from '../components/workspace/CreateWorkspaceModal';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { setActiveWorkspace } = useAppStore();
  const navigate = useNavigate();
  const [showCreateWS, setShowCreateWS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then(r => r.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      {/* Page header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{greeting()}, {user?.name?.split(' ')[0]}</h1>
          <p className="dashboard-subtitle">
            {workspaces.length === 0
              ? 'Create your first workspace to get started'
              : `You have ${workspaces.length} workspace${workspaces.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateWS(true)}>
          <Plus size={14} />
          New workspace
        </button>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats">
        <div className="stat-item">
          <span className="stat-value">{workspaces.length}</span>
          <span className="stat-label">Workspaces</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {workspaces.reduce((acc, ws) => acc + (ws.members?.length || 0), 0)}
          </span>
          <span className="stat-label">Total members</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {user?.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: false }) : '—'}
          </span>
          <span className="stat-label">
            {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()} for` : 'Member for'}
          </span>
        </div>
      </div>

      {/* Workspaces */}
      <section className="dashboard-section">
        <div className="section-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 className="section-title">Workspaces</h2>
            <div className="ws-search-bar" style={{ height: 28, width: 200 }}>
              <Search size={12} className="ws-search-icon" />
              <input 
                type="text" 
                placeholder="Search workspaces..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateWS(true)}>
            <Plus size={13} /> New
          </button>
        </div>

        {isLoading ? (
          <div className="ws-grid">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height="140px" borderRadius={12} />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 64 }}>
            <FolderKanban size={32} className="empty-state-icon" />
            <h3>No workspaces yet</h3>
            <p>Create a workspace to start organizing your team's projects</p>
            <button className="btn btn-primary" onClick={() => setShowCreateWS(true)}>
              <Plus size={14} /> Create workspace
            </button>
          </div>
        ) : (
          <div className="ws-grid">
            {workspaces.filter(ws => ws.name.toLowerCase().includes(searchQuery.toLowerCase())).map((ws, i) => {
              const myRole = ws.members?.find(m => m.user?._id === user?._id)?.role;
              return (
                <motion.div
                  key={ws._id}
                  className="ws-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setActiveWorkspace(ws); navigate(`/workspace/${ws._id}`); }}
                >
                  <div className="ws-card-header">
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="ws-card-icon" style={{ background: ws.color || '#6366f1' }}>
                        {ws.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="ws-card-meta">
                        <span className="ws-card-name">{ws.name}</span>
                        {myRole && (
                          <span className="badge badge-default" style={{ textTransform: 'capitalize', width: 'fit-content' }}>
                            {myRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {ws.description && (
                    <p className="ws-card-desc">{ws.description}</p>
                  )}

                  <div className="ws-card-footer">
                    <div className="avatar-group">
                      {ws.members?.slice(0, 5).map((m, idx) => (
                        <Avatar
                          key={idx}
                          name={m.user?.name || '?'}
                          size="xs"
                          src={m.user?.avatar}
                          style={{ border: '1.5px solid var(--color-bg)' }}
                        />
                      ))}
                      {ws.members?.length > 5 && (
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--color-surface-overlay)',
                          border: '1.5px solid var(--color-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, color: 'var(--color-text-tertiary)', fontWeight: 600,
                          marginLeft: -6,
                        }}>
                          +{ws.members.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="ws-card-time">
                      <Clock size={11} />
                      {formatDistanceToNow(new Date(ws.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              className="ws-card ws-card-new"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: workspaces.length * 0.05 }}
              onClick={() => setShowCreateWS(true)}
            >
              <Plus size={18} style={{ color: 'var(--color-text-tertiary)' }} />
              <span>New workspace</span>
            </motion.div>
          </div>
        )}
      </section>

      {showCreateWS && <CreateWorkspaceModal onClose={() => setShowCreateWS(false)} />}
    </div>
  );
};

export default DashboardPage;
