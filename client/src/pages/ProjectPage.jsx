import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, defaultDropAnimation,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Plus, Settings2, Users, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAppStore from '../store/appStore';
import { joinProject, leaveProject, getSocket } from '../services/socket';
import KanbanColumn from '../components/kanban/KanbanColumn';
import TaskCard from '../components/kanban/TaskCard';
import AddColumnModal from '../components/kanban/AddColumnModal';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import './ProjectPage.css';

const ProjectPage = () => {
  const { projectId } = useParams();
  const { openTaskModal, setActiveProject } = useAppStore();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(null); // columnId
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data),
  });

  useEffect(() => {
    if (project) setActiveProject(project);
  }, [project, setActiveProject]);

  const { data: remoteTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.get(`/tasks/project/${projectId}`).then(r => r.data),
  });

  useEffect(() => {
    if (remoteTasks) {
      setTasks(remoteTasks);
    }
  }, [remoteTasks]);

  // Real-time socket events
  useEffect(() => {
    if (!projectId) return;
    joinProject(projectId);
    const socket = getSocket();

    socket.on('task:created', (task) => {
      setTasks(prev => [...prev.filter(t => t._id !== task._id), task]);
    });
    socket.on('task:updated', (task) => {
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    });
    socket.on('task:deleted', ({ taskId }) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    });
    socket.on('tasks:reordered', (updates) => {
      setTasks(prev => prev.map(t => {
        const u = updates.find(update => update._id === t._id);
        return u ? { ...t, columnId: u.columnId, order: u.order } : t;
      }));
    });

    return () => {
      leaveProject(projectId);
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('tasks:reordered');
    };
  }, [projectId]);

  const reorderMutation = useMutation({
    mutationFn: (updates) => api.put('/tasks/reorder', { updates }),
    onError: () => { setTasks(remoteTasks); toast.error('Failed to save order'); },
  });

  const { mutate: removeMember, isPending: removing } = useMutation({
    mutationFn: (userId) => api.delete(`/projects/${projectId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      toast.success('Member removed from project');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove')
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getColumnTasks = (columnId) =>
    tasks.filter(t => t.columnId === columnId && t.title.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.order - b.order);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t._id === active.id) || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const columns = project?.columns || [];
    const overColumn = columns.find(c => c.id === overId);
    const overTask = tasks.find(t => t._id === overId);

    const targetColumnId = overColumn ? overColumn.id : overTask?.columnId;
    if (!targetColumnId) return;

    const columnTasks = getColumnTasks(targetColumnId);

    let newOrder;
    if (overColumn) {
      newOrder = columnTasks.length;
    } else {
      const overIdx = columnTasks.findIndex(t => t._id === overId);
      newOrder = overIdx >= 0 ? overIdx : columnTasks.length;
    }

    setTasks(prev => {
      return prev.map(t => {
        if (t._id === activeId) return { ...t, columnId: targetColumnId, order: newOrder };
        if (t.columnId === targetColumnId && t._id !== activeId) {
          return { ...t, order: t.order >= newOrder ? t.order + 1 : t.order };
        }
        return t;
      });
    });

    const updates = [];
    updates.push({ _id: activeId, columnId: targetColumnId, order: newOrder });
    getColumnTasks(targetColumnId).forEach((t, idx) => {
      if (t._id !== activeId) updates.push({ _id: t._id, columnId: targetColumnId, order: idx >= newOrder ? idx + 1 : idx });
    });

    reorderMutation.mutate(updates);
  };

  if (projectLoading) return (
    <div className="project-page" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <Skeleton width="40px" height="40px" borderRadius={8} />
        <div>
          <Skeleton width="240px" height="24px" style={{ marginBottom: 8 }} />
          <Skeleton width="180px" height="14px" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24, paddingBottom: 20 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ width: 280, flexShrink: 0 }}>
             <Skeleton width="100%" height="40px" style={{ marginBottom: 12 }} />
             <Skeleton width="100%" height="100px" style={{ marginBottom: 12 }} />
             <Skeleton width="100%" height="140px" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!project) return <div className="empty-state"><p>Project not found</p></div>;

  return (
    <div className="project-page">
      {/* Project Header */}
      <div className="project-header">
        <div className="project-title-group">
          <div className="project-name-row">
            <div className="project-color-dot" style={{ background: project.color || 'var(--color-accent)' }} />
            <h1 className="project-name">{project.name}</h1>
          </div>
          {project.description && <p className="project-desc">{project.description}</p>}
        </div>
        
        <div className="project-actions">
          <div className="ws-search-bar" style={{ height: 32, width: 220 }}>
            <Search size={14} className="ws-search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="avatar-group">
            {project.members?.slice(0, 5).map((m, i) => (
              <div key={i} data-tooltip={m.name} style={{ position: 'relative' }}>
                <Avatar name={m.name || '?'} size="sm" src={m.avatar} style={{ border: '2px solid var(--color-bg)' }} />
                {project.createdBy?._id !== m._id && ( // Can't remove owner
                  <button 
                    className="avatar-remove-btn" 
                    onClick={() => {
                        if (window.confirm(`Remove ${m.name} from project?`)) removeMember(m._id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddColumn(true)}>
            <Plus size={14} /> Column
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {project.columns?.sort((a,b) => a.order - b.order).map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={getColumnTasks(col.id)}
              project={project}
              onAddTask={() => setShowCreateTask(col.id)}
              onTaskClick={(task) => openTaskModal(task)}
            />
          ))}

          <button 
            className="btn btn-ghost" 
            style={{ minWidth: 280, height: 40, border: '1px dashed var(--color-border-strong)', justifyContent: 'flex-start', color: 'var(--color-text-tertiary)' }}
            onClick={() => setShowAddColumn(true)}
          >
            <Plus size={14} /> Add column
          </button>
        </div>

        <DragOverlay dropAnimation={defaultDropAnimation}>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {showCreateTask && (
        <CreateTaskModal
          projectId={projectId}
          workspaceId={project.workspace}
          columnId={showCreateTask}
          project={project}
          onClose={() => setShowCreateTask(null)}
        />
      )}
      {showAddColumn && (
        <AddColumnModal projectId={projectId} onClose={() => setShowAddColumn(false)} />
      )}
    </div>
  );
};

export default ProjectPage;
