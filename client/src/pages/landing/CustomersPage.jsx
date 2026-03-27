import React from 'react';
import { motion } from 'framer-motion';
import { Quote, MessageSquare } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

const CustomersPage = () => {
  const testimonials = [
    { name: 'Sarah Johnson', role: 'Head of Product at Stripe', quote: "FlowBoard has transformed how our team manages sprint cycles. The real-time updates are essential for our global workforce." },
    { name: 'David Lee', role: 'Engineering Manager at Vercel', quote: "The most intuitive Kanban system I've ever used. The role-based access is a lifesaver for our complex permissions needs." },
    { name: 'Michael Chen', role: 'CEO at TechScale', quote: "FlowBoard's analytics give us high-level insights into productivity without sacrificing a simple UI for our engineers." },
    { name: 'Emma Wilson', role: 'Design Lead at Airbnb', quote: "We moved from Trello and Linear to FlowBoard and never looked back. It's the perfect balance of flexibility and speed." },
  ];

  return (
    <PublicLayout>
      <section className="landing-section-header">
        <h1 className="landing-section-title">Built for teams that <span style={{ color: '#ec4899' }}>build.</span></h1>
        <p className="landing-section-subtitle">
          Leading organizations around the globe rely on FlowBoard to manage their most mission-critical projects.
        </p>
      </section>

      <div style={{ padding: '0 8% 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
         {testimonials.map((t, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ delay: i * 0.1 }}
             style={{ 
               background: 'rgba(255,255,255,0.02)', 
               border: '1px solid rgba(255,255,255,0.05)', 
               borderRadius: '24px', 
               padding: '40px',
               position: 'relative',
               overflow: 'hidden'
             }}
           >
             <Quote size={40} style={{ opacity: 0.1, position: 'absolute', top: 20, right: 20, color: i % 2 === 0 ? '#818cf8' : '#ec4899' }} />
             <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#e5e7eb', marginBottom: '32px', position: 'relative', zIndex: 1 }}>"{t.quote}"</p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {t.name[0]}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>{t.name}</h4>
                  <p style={{ fontSize: '13px', color: '#9ca3af' }}>{t.role}</p>
                </div>
             </div>
           </motion.div>
         ))}
      </div>
      
      <div style={{ textAlign: 'center', paddingBottom: '100px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Ready to join them?</h2>
          <button className="btn btn-primary btn-lg">Start your 14-day trial</button>
      </div>
    </PublicLayout>
  );
};

export default CustomersPage;
