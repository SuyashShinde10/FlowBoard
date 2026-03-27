import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LayoutTemplate, Zap, Lock, BarChart3 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import './AuthPage.css';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'member']),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register: registerUser, token, isLoading } = useAuthStore();

  const schema = mode === 'login' ? loginSchema : registerSchema;
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  if (token) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
        toast.success('Welcome back!');
      } else {
        await registerUser(data.name, data.email, data.password, data.role);
        toast.success('Account created successfully');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    reset();
  };

  return (
    <div className="landing-page">
      {/* Background glow effects - bounded so they don't expand the page */}
      <div className="landing-background">
        <div className="landing-glow glow-1" />
        <div className="landing-glow glow-2" />
      </div>
      
      {/* Modern Top Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="landing-logo-text">FlowBoard</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/features">Features</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/pricing">Pricing</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="landing-content">
        
        {/* Left Side: Hero Text & Features */}
        <div className="landing-hero">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="landing-title">
              Project management<br />
              <span className="text-gradient">reimagined.</span>
            </h1>
            <p className="landing-subtitle">
              Bring your entire organization together with lightning-fast Kanban boards, real-time collaboration, and enterprise-grade analytics in one unified workspace.
            </p>

            <div className="landing-benefits">
              <div className="benefit-item">
                <LayoutTemplate className="benefit-icon" />
                <span>Drag & drop Kanban</span>
              </div>
              <div className="benefit-item">
                <Zap className="benefit-icon" />
                <span>Real-time WebSockets</span>
              </div>
              <div className="benefit-item">
                <Lock className="benefit-icon" />
                <span>Role-Based Access</span>
              </div>
              <div className="benefit-item">
                <BarChart3 className="benefit-icon" />
                <span>Advanced Analytics</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Floating Glass Auth Card */}
        <div className="landing-auth">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              className="glass-card auth-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            >
              <div className="auth-form-header">
                <h2 className="auth-form-title">
                  {mode === 'login' ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="auth-form-subtitle">
                  {mode === 'login'
                    ? 'Enter your credentials to access your workspace'
                    : 'Start your 14-day free trial. No credit card required.'}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                {mode === 'register' && (
                  <>
                    <div className="input-group">
                      <label className="input-label">Full name</label>
                      <input
                        className={`input ${errors.name ? 'input-error' : ''}`}
                        placeholder="Jane Smith"
                        {...register('name')}
                        autoComplete="name"
                      />
                      {errors.name && <span className="error-text">{errors.name.message}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">I am a...</label>
                      <div className="role-selection-grid">
                        {[
                          { id: 'admin', label: 'Admin', icon: '👑', desc: 'Control organization' },
                          { id: 'manager', label: 'Manager', icon: '🛡️', desc: 'Lead projects' },
                          { id: 'member', label: 'Member', icon: '👤', desc: 'Sync with team' },
                        ].map((r) => (
                          <label key={r.id} className={`role-option ${register('role').value === r.id ? 'active' : ''}`}>
                            <input type="radio" value={r.id} {...register('role')} style={{ display: 'none' }} />
                            <div className="role-option-icon">{r.icon}</div>
                            <div className="role-option-label">{r.label}</div>
                            <div className="role-option-desc">{r.desc}</div>
                          </label>
                        ))}
                      </div>
                      {errors.role && <span className="error-text">{errors.role.message}</span>}
                    </div>
                  </>
                )}

                <div className="input-group">
                  <label className="input-label">Email address</label>
                  <input
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    type="email"
                    placeholder="jane@company.com"
                    {...register('email')}
                    autoComplete="email"
                  />
                  {errors.email && <span className="error-text">{errors.email.message}</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={`input ${errors.password ? 'input-error' : ''}`}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      style={{ paddingRight: 36 }}
                      {...register('password')}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="pwd-toggle"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password.message}</span>}
                </div>

                {mode === 'register' && (
                  <div className="input-group">
                    <label className="input-label">Confirm password</label>
                    <input
                      className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                      type="password"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : mode === 'login' ? 'Sign in via Secure Link' : 'Create Free Account'}
                </button>
              </form>

              <div className="auth-card-footer">
                <p>
                  {mode === 'login' ? "Don't have an account?" : 'Already using FlowBoard?'}
                  <button type="button" className="switch-link" onClick={switchMode}>
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </p>
                {mode === 'register' && (
                  <p className="auth-terms">By joining, you agree to our Terms and Privacy Policy.</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="landing-logo-icon" style={{ width: 24, height: 24 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, color: 'white' }}>FlowBoard</span>
          </div>
          <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <Link to="/features">Features</Link>
                <a href="#">Integrations</a>
                <Link to="/pricing">Pricing</Link>
                <a href="#">Changelog</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <Link to="/customers">Customers</Link>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
              </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FlowBoard Inc. All rights reserved.</p>
          <div className="social-links">
            <a href="#">Twitter</a>
            <a href="#">GitHub</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
