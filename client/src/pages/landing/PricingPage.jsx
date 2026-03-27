import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Layout, Clock, BarChart3, Users, Crown } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

const PricingPage = () => {
  const plans = [
    { title: 'Free', price: '0', icon: <Layout />, desc: 'For individuals and small teams starting out.', features: ['Up to 3 Workspaces', 'Basic Kanban Boards', 'Standard Analytics', 'Email Support'] },
    { title: 'Pro', price: '12', icon: <Crown />, desc: 'For growing teams with more workflows.', features: ['Unlimited Workspaces', 'Advanced Filters', 'Full History Analytics', 'Priority Support', 'Custom Role Overlays'], popular: true },
    { title: 'Enterprise', price: '49', icon: <Shield />, desc: 'For organizations with security needs.', features: ['Everything in Pro', 'SSO & SAML Auth', 'Audit Logs', 'Dedicated Account Manager', 'Infinite Data Retention'] },
  ];

  return (
    <PublicLayout>
       <section className="landing-section-header">
         <h1 className="landing-section-title">Scale your team <span style={{ color: '#ec4899' }}>affordably.</span></h1>
         <p className="landing-section-subtitle">
            Simple, predictable pricing. Grow with us as your team and organization expand.
         </p>
       </section>

       <div style={{ padding: '0 8% 120px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {plans.map((p, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: p.popular ? '2px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '24px', 
                  padding: '40px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
               }}
            >
              {p.popular && (
                <div style={{ position: 'absolute', top: '12px', right: '-32px', background: '#818cf8', color: 'white', padding: '4px 40px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', transform: 'rotate(45deg)' }}>
                  Most Popular
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  {p.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>{p.title}</h3>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>{p.desc}</p>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'white' }}>${p.price}</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}> / month per user</span>
              </div>

              <button className={`btn btn-lg w-full ${p.popular ? 'btn-primary' : 'btn-secondary'}`}>
                {p.title === 'Free' ? 'Get Started' : 'Start Free Trial'}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {p.features.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#9ca3af' }}>
                    <Check size={14} style={{ color: '#22c55e' }} />
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
       </div>
    </PublicLayout>
  );
};

export default PricingPage;
