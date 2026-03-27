import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Zap, Users, BarChart3, Shield, Globe, Clock, Layers } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

const FeaturesPage = () => {
  const features = [
    { title: 'Interactive Kanban', icon: <Layout />, desc: 'Drag-and-drop tasks across columns with real-time state synchronization.' },
    { title: 'Instant Sync', icon: <Zap />, desc: 'Powered by WebSockets, see team updates as they happen without refreshing.' },
    { title: 'Organization Hierarchy', icon: <Layers />, desc: 'Manage workspaces, projects, and tasks in a structured, intuitive tree.' },
    { title: 'Smart Analytics', icon: <BarChart3 />, desc: 'Visualize task progress, priority distribution, and team velocity.' },
    { title: 'Role-Based Control', icon: <Shield />, desc: 'Define exactly who can create, edit, or delete data with granular roles.' },
    { title: 'Member Management', icon: <Users />, desc: 'Invite team members and manage their access across different projects.' },
    { title: 'Priority Matrix', icon: <Clock />, desc: 'Automated sorting and coloring based on task urgency and due dates.' },
    { title: 'Global Workspaces', icon: <Globe />, desc: 'Seamlessly switch between multiple organization profiles and environments.' },
  ];

  return (
    <PublicLayout>
      <section className="landing-section-header">
        <h1 className="landing-section-title">Everything you need to ship <span style={{ color: '#818cf8' }}>faster.</span></h1>
        <p className="landing-section-subtitle">
          FlowBoard combines a powerful execution engine with a beautiful, intuitive interface built for high-performance teams.
        </p>
      </section>

      <div style={{ padding: '0 8% 100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '20px', 
              padding: '32px',
              transition: 'background 0.3s'
            }}
            className="feature-card"
          >
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#818cf8',
              marginBottom: '24px'
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>{f.title}</h3>
            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </PublicLayout>
  );
};

export default FeaturesPage;
