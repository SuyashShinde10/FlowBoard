const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#6C63FF' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  invites: [{
    email: { type: String, lowercase: true },
    role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
    token: String,
    expiresAt: Date,
  }],
}, { timestamps: true });

// Ensure owner is always in members as admin
workspaceSchema.pre('save', function (next) {
  const ownerExists = this.members.some(m => m.user?.toString() === this.owner.toString());
  if (!ownerExists) {
    this.members.unshift({ user: this.owner, role: 'admin' });
  }
  next();
});

module.exports = mongoose.model('Workspace', workspaceSchema);
