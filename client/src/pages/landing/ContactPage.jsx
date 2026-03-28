import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

const ContactPage = () => {
  return (
    <PublicLayout>
      <section className="landing-section-header">
        <h1 className="landing-section-title">We'd love to hear from <span style={{ color: '#818cf8' }}>you.</span></h1>
        <p className="landing-section-subtitle">
          Have questions about our enterprise plans? Need help getting started? Our team is standing by to help you scale.
        </p>
      </section>

      <div style={{ padding: '0 8% 100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            { title: 'Support Email', icon: <Mail size={18} />, value: 'support@flowboard.inc', color: '#818cf8' },
            { title: 'Live Chat', icon: <MessageSquare size={18} />, value: 'Available Mon-Fri, 9am-6pm EST', color: '#10b981' },
            { title: 'Enterprise Sales', icon: <Phone size={18} />, value: '+1 (555) 000-FLOW', color: '#6366f1' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}
            >
              <div style={{ color: item.color }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.title}</div>
                <div style={{ fontSize: '16px', color: 'white', fontWeight: 500, marginTop: '4px' }}>{item.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '40px', borderRadius: '24px' }}
        >
          <h3 style={{ marginBottom: '24px', color: 'white' }}>Send us a message</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={e => e.preventDefault()}>
            <input className="input" placeholder="Your Name" style={{ background: 'rgba(0,0,0,0.2)' }} />
            <input className="input" placeholder="Your Email" style={{ background: 'rgba(0,0,0,0.2)' }} />
            <textarea className="input" placeholder="How can we help?" style={{ minHeight: '120px', background: 'rgba(0,0,0,0.2)' }} />
            <button className="btn btn-primary btn-lg w-full" type="button">Send Message</button>
          </form>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
