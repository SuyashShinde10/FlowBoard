import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Settings, ChevronRight, Plus, LogOut,
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Avatar from '../ui/Avatar';
import CreateWorkspaceModal from '../workspace/CreateWorkspaceModal';
import CreateProjectModal from '../workspace/CreateProjectModal';
import './Sidebar.css';

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar, setActiveWorkspace } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [expandedWS, setExpandedWS] = useState(null);
  const [showCreateWS, setShowCreateWS] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [createProjectWS, setCreateProjectWS] = useState(null);

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then(r => r.data),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', expandedWS],
    queryFn: () => api.get(`/projects/workspace/${expandedWS}`).then(r => r.data),
    enabled: !!expandedWS,
  });

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const myRole = (ws) =>
    ws.members?.find(m => m.user?._id === user?._id)?.role || '';

  return (
    <>
      <motion.aside
        className="sidebar"
        animate={{ width: sidebarCollapsed ? 52 : 232 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
      >
        <div className="sidebar-logo">
          {sidebarCollapsed ? (
            <button className="sidebar-logo-btn" onClick={toggleSidebar} title="Expand sidebar">
              <div className="logo-mark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </button>
          ) : (
            <>
              <div className="logo-mark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    className="logo-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    FlowBoard
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                className="btn btn-ghost btn-icon btn-xs sidebar-toggle"
                onClick={toggleSidebar}
                title="Collapse sidebar"
              >
                <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={14} />
                </motion.div>
              </button>
            </>
          )}
        </div>

        {/* Top nav */}
        <div className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Dashboard"
          >
            <LayoutDashboard size={15} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span className="nav-item-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Home
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        </div>

        {/* Workspaces */}
        <div className="sidebar-section">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="sidebar-section-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="sidebar-section-label">Workspaces</span>
                <button
                  className="btn btn-ghost btn-icon btn-xs"
                  onClick={() => setShowCreateWS(true)}
                  title="New workspace"
                >
                  <Plus size={13} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {workspaces.map(ws => (
            <div key={ws._id}>
              <button
                className={`workspace-item ${expandedWS === ws._id ? 'active' : ''}`}
                onClick={() => {
                  setActiveWorkspace(ws);
                  if (!sidebarCollapsed) {
                    setExpandedWS(prev => prev === ws._id ? null : ws._id);
                  }
                  navigate(`/workspace/${ws._id}`);
                }}
                title={ws.name}
              >
                <div className="ws-icon" style={{ background: ws.color || '#6366f1' }}>
                  {getInitials(ws.name)}
                </div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span className="ws-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {ws.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!sidebarCollapsed && (
                  <ChevronRight
                    size={12}
                    className={`ws-chevron ${expandedWS === ws._id ? 'open' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedWS(prev => prev === ws._id ? null : ws._id);
                    }}
                  />
                )}
              </button>

              {/* Projects */}
              <AnimatePresence>
                {expandedWS === ws._id && !sidebarCollapsed && (
                  <motion.div
                    className="projects-list"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    {projects.map(proj => (
                      <NavLink
                        key={proj._id}
                        to={`/project/${proj._id}`}
                        className={({ isActive }) => `project-item ${isActive ? 'active' : ''}`}
                      >
                        <div className="project-dot" style={{ background: proj.color || '#6366f1' }} />
                        <span className="project-name">{proj.name}</span>
                      </NavLink>
                    ))}
                    <button
                      className="project-item project-add"
                      onClick={() => { setCreateProjectWS(ws); setShowCreateProject(true); }}
                    >
                      <Plus size={11} style={{ flexShrink: 0 }} />
                      <span>Add project</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {workspaces.length === 0 && !sidebarCollapsed && (
            <div className="ws-empty">
              <p>No workspaces yet.</p>
              <button className="btn btn-secondary btn-sm w-full" onClick={() => setShowCreateWS(true)}>
                <Plus size={12} /> New workspace
              </button>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title="Settings"
          >
            <Settings size={15} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span className="nav-item-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>

          <div className="user-row" title={`${user?.name} · ${user?.email}`}>
            <Avatar name={user?.name || '?'} size="sm" src={user?.avatar} />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div className="user-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="user-name">{user?.name}</div>
                  <div className="user-email">{user?.email}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="nav-item sidebar-collapse-btn"
            onClick={toggleSidebar}
            style={{ marginTop: 4, borderTop: '1px solid var(--color-border)', borderRadius: 0, padding: '12px 8px' }}
          >
            <motion.div animate={{ rotate: sidebarCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={15} />
            </motion.div>
            {!sidebarCollapsed && (
              <span className="nav-item-label" style={{ fontWeight: 600 }}>Collapse sidebar</span>
            )}
          </button>
        </div>
      </motion.aside>

      {showCreateWS && <CreateWorkspaceModal onClose={() => setShowCreateWS(false)} />}
      {showCreateProject && (
        <CreateProjectModal workspace={createProjectWS} onClose={() => setShowCreateProject(false)} />
      )}
    </>
  );
};

export default Sidebar;
