const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // "moved", "assigned", "created", "updated", "commented", etc.
  field: { type: String },                  // which field changed
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  description: { type: String },            // Human-readable: "Moved from To Do to In Progress"
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
