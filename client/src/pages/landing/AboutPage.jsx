import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, Eye } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

const AboutPage = () => {
  return (
    <PublicLayout>
      <section className="landing-section-header">
        <h1 className="landing-section-title">Built for high-performance <span style={{ color: '#818cf8' }}>teams.</span></h1>
        <p className="landing-section-subtitle">
          FlowBoard is a mission-driven platform dedicated to simplifying project complexity and empowering collaborative execution.
        </p>
      </section>

      <div style={{ padding: '0 8% 100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px' }}
        >
          <Target color="#818cf8" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Our Mission</h3>
          <p style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.7 }}>
            To provide every team with the enterprise-grade tools they need to visualize their goals and execute with precision. We believe project management should be intuitive, not a chore.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px' }}
        >
          <Heart color="#ef4444" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Our Values</h3>
          <p style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.7 }}>
            We prioritize speed, security, and simplicity. Every feature we build is tested against the real-world needs of developers, managers, and stakeholders.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px' }}
        >
          <Eye color="#10b981" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Our Vision</h3>
          <p style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.7 }}>
            A world where geographical distance is no barrier to high-velocity collaboration. FlowBoard is the digital home for your team's greatest ambitions.
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
