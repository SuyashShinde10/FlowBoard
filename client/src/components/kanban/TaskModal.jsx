import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  X, Send, Paperclip, Trash2, Clock, Calendar, MessageSquare, Activity
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import useAppStore from '../../store/appStore';
import useAuthStore from '../../store/authStore';
import { getSocket } from '../../services/socket';
import api from '../../services/api';
import Avatar from '../ui/Avatar';
import './TaskModal.css';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const PRIORITY_COLORS = {
  urgent: { bg: 'var(--priority-urgent-bg)', color: 'var(--priority-urgent)' },
  high:   { bg: 'var(--priority-high-bg)',   color: 'var(--priority-high)' },
  medium: { bg: 'var(--priority-medium-bg)', color: 'var(--priority-medium)' },
  low:    { bg: 'var(--priority-low-bg)',    color: 'var(--priority-low)' },
};

const TaskModal = () => {
  const { taskModalData, closeTaskModal } = useAppStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('comments');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const fileRef = useRef();
  const commentRef = useRef();

  const { data: taskDetail, isLoading } = useQuery({
    queryKey: ['task', taskModalData?._id],
    queryFn: () => api.get(`/tasks/${taskModalData._id}`).then(r => r.data),
    enabled: !!taskModalData?._id,
  });

  useEffect(() => {
    if (taskDetail?.comments) setComments(taskDetail.comments);
  }, [taskDetail?.comments]);

  useEffect(() => {
    if (!taskDetail?.project) return;
    const socket = getSocket();
    socket.on('comment:new', ({ taskId, comment: nc }) => {
      if (taskId === taskModalData?._id && nc.author?._id !== user._id) {
        setComments(prev => [...prev, nc]);
      }
    });
    return () => socket.off('comment:new');
  }, [taskDetail?.project, taskModalData?._id, user._id]);

  const task = taskDetail || taskModalData;

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/tasks/${taskModalData._id}`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', task?.project?.toString()]);
      queryClient.invalidateQueries(['task', taskModalData._id]);
    },
    onError: () => toast.error('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${taskModalData._id}`),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); toast.success('Task deleted'); closeTaskModal(); },
  });

  const commentMutation = useMutation({
    mutationFn: (content) => api.post(`/tasks/${taskModalData._id}/comments`, { content }).then(r => r.data),
    onSuccess: (nc) => { setComments(prev => [...prev, nc]); setComment(''); },
    onError: () => toast.error('Failed to post comment'),
  });

  const uploadMutation = useMutation({
    mutationFn: (fd) => api.post(`/tasks/${taskModalData._id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries(['task', taskModalData._id]); toast.success('Uploaded'); },
    onError: () => toast.error('Upload failed'),
  });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    uploadMutation.mutate(fd);
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    commentMutation.mutate(comment.trim());
  };

  const pStyle = task?.priority ? PRIORITY_COLORS[task.priority] : PRIORITY_COLORS.low;

  return (
    <motion.div
      className="task-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) closeTaskModal(); }}
    >
      <motion.div
        className="task-modal"
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ type: 'spring', stiffness: 500, damping: 36, mass: 0.7 }}
      >
        {/* Header */}
        <div className="task-modal-head">
          <div className="task-modal-title-wrap">
            <h2
              className="task-modal-title"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const t = e.currentTarget.textContent.trim();
                if (t && t !== task?.title) updateMutation.mutate({ title: t });
              }}
            >
              {task?.title}
            </h2>
            <div className="task-modal-meta">
              <span
                className="badge"
                style={{ background: pStyle.bg, color: pStyle.color, borderColor: 'transparent', textTransform: 'capitalize' }}
              >
                {task?.priority || 'low'}
              </span>
              {task?.labels?.map((l, i) => <span key={i} className="tag">{l}</span>)}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={closeTaskModal} style={{ flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="task-modal-body">
          {/* Left: Main */}
          <div className="task-modal-main">
            {/* Description */}
            <div>
              <div className="task-modal-desc-label">Description</div>
              <textarea
                className="input"
                rows={4}
                defaultValue={task?.description}
                placeholder="Add a description to give more context..."
                onBlur={(e) => { if (e.target.value !== task?.description) updateMutation.mutate({ description: e.target.value }); }}
              />
            </div>

            {/* Tabs */}
            <div>
              <div className="task-modal-tabs">
                <button
                  className={`task-modal-tab ${tab === 'comments' ? 'active' : ''}`}
                  onClick={() => setTab('comments')}
                >
                  <MessageSquare size={13} />
                  Comments
                  <span className="tab-count">{comments.length}</span>
                </button>
                <button
                  className={`task-modal-tab ${tab === 'activity' ? 'active' : ''}`}
                  onClick={() => setTab('activity')}
                >
                  <Activity size={13} />
                  Activity
                </button>
                <button
                  className={`task-modal-tab ${tab === 'attachments' ? 'active' : ''}`}
                  onClick={() => setTab('attachments')}
                >
                  <Paperclip size={13} />
                  Files
                  <span className="tab-count">{task?.attachments?.length || 0}</span>
                </button>
              </div>

              {/* Comments */}
              {tab === 'comments' && (
                <div className="comments-area">
                  <div className="comment-list">
                    {comments.map((c) => (
                      <div key={c._id} className="comment-item">
                        <Avatar name={c.author?.name || '?'} size="sm" src={c.author?.avatar} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div className="comment-bubble">
                          <div className="comment-bubble-inner">
                            <div className="comment-author">
                              {c.author?.name}
                              <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                            </div>
                            <p className="comment-text">{c.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && <p className="empty-comments">No comments yet. Start the conversation.</p>}
                  </div>

                  <div className="comment-compose">
                    <Avatar name={user?.name || '?'} size="sm" src={user?.avatar} style={{ flexShrink: 0 }} />
                    <textarea
                      ref={commentRef}
                      className="comment-compose-input"
                      value={comment}
                      rows={1}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                    />
                    <button
                      className="btn btn-primary btn-icon btn-sm"
                      onClick={handleComment}
                      disabled={!comment.trim() || commentMutation.isPending}
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Activity */}
              {tab === 'activity' && (
                <div className="activity-list">
                  {taskDetail?.activityLog?.length > 0 ? taskDetail.activityLog.map((log) => (
                    <div key={log._id} className="activity-item">
                      <Avatar name={log.user?.name || '?'} size="xs" src={log.user?.avatar} />
                      <div>
                        <span className="activity-text">{log.description}</span>
                        <span className="activity-time"> — {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  )) : <p className="empty-comments">No activity logged yet.</p>}
                </div>
              )}

              {/* Attachments */}
              {tab === 'attachments' && (
                <div className="attachments-area">
                  <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile} />
                  <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()} disabled={uploadMutation.isPending}>
                    <Paperclip size={13} />
                    {uploadMutation.isPending ? 'Uploading...' : 'Attach file'}
                  </button>
                  {task?.attachments?.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-row">
                      <Paperclip size={13} />
                      <span className="attachment-name">{att.originalName || att.url}</span>
                    </a>
                  ))}
                  {(!task?.attachments || task.attachments.length === 0) && (
                    <p className="empty-comments">No files attached yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="task-modal-sidebar">
            <div className="sidebar-field">
              <div className="sidebar-field-label">Priority</div>
              <select
                className="input"
                style={{ height: 30, padding: '0 8px', fontSize: 12 }}
                value={task?.priority || 'medium'}
                onChange={e => updateMutation.mutate({ priority: e.target.value })}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>

            <div className="sidebar-field">
              <div className="sidebar-field-label">Due date</div>
              <input
                className="input"
                type="date"
                style={{ height: 30, padding: '0 8px', fontSize: 12 }}
                defaultValue={task?.dueDate ? task.dueDate.substring(0, 10) : ''}
                onChange={e => updateMutation.mutate({ dueDate: e.target.value || null })}
              />
            </div>

            <div className="sidebar-field">
              <div className="sidebar-field-label">Labels</div>
              <input
                className="input"
                style={{ height: 30, padding: '0 8px', fontSize: 12 }}
                defaultValue={task?.labels?.join(', ')}
                placeholder="bug, feature, ui"
                onBlur={e => updateMutation.mutate({ labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })}
              />
            </div>

            <div className="sidebar-field">
              <div className="sidebar-field-label">Est. hours</div>
              <input
                className="input"
                type="number"
                min={0}
                step={0.5}
                style={{ height: 30, padding: '0 8px', fontSize: 12 }}
                defaultValue={task?.estimatedHours || ''}
                onBlur={e => updateMutation.mutate({ estimatedHours: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="sidebar-field">
              <div className="sidebar-field-label">Assignees</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {task?.assignees?.length > 0 ? task.assignees.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Avatar name={a.name} size="xs" src={a.avatar} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{a.name?.split(' ')[0]}</span>
                  </div>
                )) : <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Unassigned</span>}
              </div>
            </div>

            {task?.createdAt && (
              <div className="task-modal-created">
                <Clock size={11} />
                Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </div>
            )}

            <div className="task-delete-btn">
              <button
                className="btn btn-danger btn-sm w-full"
                onClick={() => { if (window.confirm('Delete this task?')) deleteMutation.mutate(); }}
              >
                <Trash2 size={13} /> Delete task
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskModal;
