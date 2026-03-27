import React, { useRef, useState } from 'react';
import { Sun, Moon, Upload, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import useAppStore from '../store/appStore';
import Avatar from '../components/ui/Avatar';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { name });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error('Both fields required');
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    
    setSavingPwd(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password update failed');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fd = new FormData();
    fd.append('avatar', file);
    
    setUploading(true);
    try {
      const { data } = await api.put('/auth/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(data.user);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error('Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      className="settings-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="settings-header">
        <h1 className="settings-title">Workspace Settings</h1>
        <p className="settings-subtitle">Manage your account preferences, profile details, and security configuration.</p>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Profile</h2>
          <p className="settings-section-desc">Update your personal information and avatar.</p>
        </div>

        <div className="profile-avatar-row">
          <Avatar name={user?.name || '?'} size="xl" src={user?.avatar} />
          <div>
            <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handleAvatar} accept="image/*" />
            <button className="avatar-upload-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? <span className="spinner" style={{width:14,height:14}}/> : <Upload size={14} />}
              {uploading ? 'Uploading...' : 'Change avatar'}
            </button>
            <p className="text-xs text-tertiary mt-2">Recommended: 256x256px. Max 2MB.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleProfileSave}>
          <div className="input-group">
            <label className="input-label">Full name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            <p className="error-text" style={{ color: 'var(--color-text-tertiary)' }}>Email address cannot be changed.</p>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="btn btn-primary" style={{ height: 36, padding: '0 24px' }} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Security</h2>
          <p className="settings-section-desc">Update your password to keep your account secure.</p>
        </div>

        <form className="settings-form" onSubmit={handlePasswordSave}>
          <div className="input-group">
            <label className="input-label">Current password</label>
            <input className="input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">New password</label>
            <input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="btn btn-secondary" style={{ height: 36, padding: '0 24px' }} disabled={savingPwd}>
              {savingPwd ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Appearance</h2>
          <p className="settings-section-desc">Customize how FlowBoard looks on your device.</p>
        </div>

        <div className="settings-form">
          <div className="theme-options">
            <div className={`theme-card light ${theme === 'light' ? 'active' : ''}`} onClick={() => theme === 'dark' && toggleTheme()}>
              <div className="theme-preview">
                <div className="theme-preview-header" />
                <div className="theme-preview-body">
                  <div className="theme-preview-sidebar" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                <Sun size={14} /> Light
              </div>
            </div>

            <div className={`theme-card dark ${theme === 'dark' ? 'active' : ''}`} onClick={() => theme === 'light' && toggleTheme()}>
              <div className="theme-preview">
                <div className="theme-preview-header" />
                <div className="theme-preview-body">
                  <div className="theme-preview-sidebar" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                <Moon size={14} /> Dark
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
