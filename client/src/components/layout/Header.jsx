import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Settings, LogOut, User, BarChart3, ChevronDown } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useAuthStore from '../../store/authStore';
import Avatar from '../ui/Avatar';
import './Header.css';

const Header = () => {
  const { theme, toggleTheme, activeProject } = useAppStore();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isProjectPage = location.pathname.startsWith('/project/') && !location.pathname.includes('/analytics');
  const isAnalyticsPage = location.pathname.includes('/analytics');
  const projectId = location.pathname.split('/')[2];

  // Breadcrumb segments
  const getBreadcrumbs = () => {
    const segs = [];
    if (location.pathname === '/dashboard') return [{ label: 'Home', active: true }];
    if (location.pathname.includes('/workspace')) return [{ label: 'Home' }, { label: 'Workspace', active: true }];
    if (location.pathname.includes('/analytics')) return [
      { label: 'Home' },
      { label: activeProject?.name || 'Project', href: `/project/${projectId}` },
      { label: 'Analytics', active: true },
    ];
    if (location.pathname.includes('/project')) return [
      { label: 'Home' },
      { label: activeProject?.name || 'Board', active: true },
    ];
    if (location.pathname.includes('/settings')) return [{ label: 'Settings', active: true }];
    return [{ label: 'FlowBoard', active: true }];
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="app-header">
      <nav className="header-breadcrumb">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="breadcrumb-separator">/</span>}
            {crumb.href ? (
              <button
                className="breadcrumb-item btn btn-ghost"
                style={{ height: 24, padding: '0 4px', fontSize: 13 }}
                onClick={() => navigate(crumb.href)}
              >
                {crumb.label}
              </button>
            ) : (
              <span className={`breadcrumb-item ${crumb.active ? 'current' : ''}`}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="header-right">
        {isProjectPage && projectId && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/project/${projectId}/analytics`)}
          >
            <BarChart3 size={13} />
            Analytics
          </button>
        )}

        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* User menu */}
        <div className="dropdown" ref={menuRef}>
          <button className="header-user" onClick={() => setShowUserMenu(s => !s)}>
            <Avatar name={user?.name || '?'} size="sm" src={user?.avatar} />
            <span className="header-user-name">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={12} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu" style={{ width: 200, right: 0 }}>
              <div className="user-dropdown-header">
                <div className="user-dropdown-name">{user?.name}</div>
                <div className="user-dropdown-email">{user?.email}</div>
              </div>
              <button
                className="dropdown-item"
                onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
              >
                <Settings size={14} /> Settings
              </button>
              <div className="dropdown-separator" />
              <button
                className="dropdown-item danger"
                onClick={() => { logout(); setShowUserMenu(false); }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
