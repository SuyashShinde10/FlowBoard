import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAppStore from '../../store/appStore';
import useAuthStore from '../../store/authStore';
import TaskModal from '../kanban/TaskModal';
import { connectSocket, disconnectSocket } from '../../services/socket';
import './AppLayout.css';

const AppLayout = () => {
  const { sidebarCollapsed, taskModalOpen } = useAppStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) connectSocket();
    return () => disconnectSocket();
  }, [token]);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      {taskModalOpen && <TaskModal />}
    </div>
  );
};

export default AppLayout;
