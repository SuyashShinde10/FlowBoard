import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PublicLayout.css';

const PublicLayout = ({ children, hideFooter = false }) => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="landing-glow glow-1" />
        <div className="landing-glow glow-2" />
      </div>

      <nav className="landing-nav">
        <div className="landing-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="landing-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="landing-logo-text">FlowBoard</span>
        </div>
        <div className="landing-nav-links">
          <button className="nav-btn" onClick={() => navigate('/features')}>Features</button>
          <button className="nav-btn" onClick={() => navigate('/customers')}>Customers</button>
          <button className="nav-btn" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>
      </nav>

      <main className="landing-main-content">
        {children}
      </main>

      {!hideFooter && (
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
                <button className="footer-btn" onClick={() => navigate('/features')}>Features</button>
                <a href="#">Integrations</a>
                <button className="footer-btn" onClick={() => navigate('/pricing')}>Pricing</button>
                <a href="#">Changelog</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <button className="footer-btn" onClick={() => navigate('/customers')}>Customers</button>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
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
      )}
    </div>
  );
};

export default PublicLayout;
