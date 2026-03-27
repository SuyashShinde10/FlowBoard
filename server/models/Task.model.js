const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  url: String,
  publicId: String,
  size: Number,
  mimetype: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  columnId: { type: String, required: true, default: 'todo' },
  order: { type: Number, default: 0 },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  labels: [{ type: String }],
  dueDate: { type: Date },
  completedAt: { type: Date },
  attachments: [attachmentSchema],
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-set completedAt when moved to done column
taskSchema.pre('save', function (next) {
  if (this.isModified('columnId')) {
    if (this.columnId === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.columnId !== 'done') {
      this.completedAt = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
