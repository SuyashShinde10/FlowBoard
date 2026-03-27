import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Theme
  theme: localStorage.getItem('pmp_theme') || 'dark',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('pmp_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },

  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Active workspace
  activeWorkspace: null,
  setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),

  // Active project
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),

  // Task modal
  taskModalOpen: false,
  taskModalData: null,
  openTaskModal: (task = null) => set({ taskModalOpen: true, taskModalData: task }),
  closeTaskModal: () => set({ taskModalOpen: false, taskModalData: null }),

  // Global search
  searchOpen: false,
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
}));

export default useAppStore;
