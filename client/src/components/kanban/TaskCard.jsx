import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paperclip, Calendar, MessageCircle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Avatar from '../ui/Avatar';
import './TaskCard.css';

const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#71717a',
};

const TaskCard = ({ task, onClick, isDragging }) => {
  const {
    attributes, listeners, setNodeRef, transform, transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.35 : 1,
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = dueDate && isPast(dueDate) && !task.completedAt && !isToday(dueDate);
  const today = dueDate && isToday(dueDate);
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'task-card-dragging' : ''} ${overdue ? 'task-overdue' : ''}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Priority top bar */}
      <div className="task-priority-bar" style={{ background: priorityColor }} />

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="task-labels">
          {task.labels.slice(0, 3).map((label, i) => (
            <span key={i} className="tag">{label}</span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>+{task.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="task-title">{task.title}</h4>

      {/* Footer */}
      <div className="task-footer">
        <div className="task-meta-left">
          {dueDate && (
            <span className={`task-meta-chip ${overdue ? 'overdue' : today ? 'today' : ''}`}>
              <Calendar size={11} />
              {format(dueDate, 'MMM d')}
            </span>
          )}
          {task.attachments?.length > 0 && (
            <span className="task-meta-chip">
              <Paperclip size={11} />
              {task.attachments.length}
            </span>
          )}
        </div>

        <div className="avatar-group task-assignees">
          {task.assignees?.slice(0, 3).map((a, i) => (
            <Avatar key={i} name={a.name || '?'} size="xs" src={a.avatar} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
