import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import './KanbanColumn.css';

const KanbanColumn = ({ column, tasks, project, onAddTask, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className={`kanban-column ${isOver ? 'drop-over' : ''}`}>
      {/* Header */}
      <div className="column-header">
        <div className="column-title-dot" style={{ background: column.color || 'var(--color-accent)' }} />
        <span className="column-title-text">{column.title}</span>
        <span className="column-count-badge">{tasks.length}</span>
        <button
          className="btn btn-ghost btn-icon btn-xs"
          onClick={onAddTask}
          title="Add task"
          style={{ flexShrink: 0 }}
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Tasks */}
      <SortableContext
        id={column.id}
        items={tasks.map(t => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-tasks" ref={setNodeRef}>
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}

          {tasks.length === 0 && (
            <div className="column-empty-area" onClick={onAddTask}>
              <span><Plus size={12} />Add a task</span>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Footer add button */}
      <button className="column-add-task" onClick={onAddTask}>
        <Plus size={13} />
        Add task
      </button>
    </div>
  );
};

export default KanbanColumn;
