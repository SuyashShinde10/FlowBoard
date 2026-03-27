const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  color: { type: String, default: '#6C63FF' },
  order: { type: Number, default: 0 },
  taskLimit: { type: Number, default: 0 }, // 0 = unlimited (WIP limit)
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  columns: {
    type: [columnSchema],
    default: [
      { id: 'todo', title: 'To Do', color: '#64748B', order: 0 },
      { id: 'in-progress', title: 'In Progress', color: '#6C63FF', order: 1 },
      { id: 'review', title: 'In Review', color: '#F59E0B', order: 2 },
      { id: 'done', title: 'Done', color: '#10B981', order: 3 },
    ],
  },
  deadline: { type: Date },
  status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
  color: { type: String, default: '#6C63FF' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
