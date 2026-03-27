import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Scatter
} from 'recharts';
import { Activity, Briefcase, CheckCircle2, AlertCircle, Clock, BarChart3, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import useAppStore from '../store/appStore';
import Skeleton from '../components/ui/Skeleton';
import './AnalyticsPage.css';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="custom-tooltip-label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="custom-tooltip-value" style={{ color: p.color || p.fill }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#ec4899', '#8b5cf6'];
const THEME_COLORS = {
  text: 'var(--color-text-secondary)',
  grid: 'var(--color-border)',
};

const AnalyticsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { activeProject } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', projectId],
    queryFn: () => api.get(`/analytics/project/${projectId}`).then(r => r.data),
    enabled: !!projectId,
  });

  if (isLoading) return (
    <div className="analytics-page" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <Skeleton width="100px" height="20px" style={{ marginBottom: 16 }} />
          <Skeleton width="240px" height="32px" style={{ marginBottom: 8 }} />
          <Skeleton width="200px" height="16px" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <Skeleton width="120px" height="80px" borderRadius={8} />
           <Skeleton width="120px" height="80px" borderRadius={8} />
        </div>
      </div>
      <div className="analytics-grid">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height="300px" borderRadius={12} />
        ))}
      </div>
    </div>
  );
  if (!data) return <div className="empty-state">No data</div>;

  const { summary, completedOverTime, createdOverTime, priorityDistribution, productivityPerMember, overdueTrend } = data;

  const totalTasks = summary?.totalTasks || 0;
  const completedTasks = summary?.completedTasks || 0;
  const completionRate = summary?.completionRate || 0;

  // Transform data for Burndown / Area charts
  // Merge completed and created over time
  const dates = Array.from(new Set([...completedOverTime.map(d => d.date), ...createdOverTime.map(d => d.date)])).sort();
  const completionTrend = dates.map(date => ({
    date,
    completed: completedOverTime.find(d => d.date === date)?.count || 0,
    created: createdOverTime.find(d => d.date === date)?.count || 0
  }));

  const cards = [
    { title: 'Task Completion', desc: 'Over the last 30 days', icon: <Activity size={16} />,
      content: (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={completionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
            <XAxis dataKey="date" stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )
    },
    { title: 'Task Priorities', desc: 'Distribution across levels', icon: <AlertCircle size={16} />,
      content: (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={priorityDistribution}
              cx="50%" cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              innerRadius={45}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              stroke="var(--color-surface-raised)"
              strokeWidth={2}
            >
              {priorityDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: THEME_COLORS.text }} />
          </PieChart>
        </ResponsiveContainer>
      )
    },
    { title: 'Task Flow', desc: 'Created vs Completed per day', icon: <BarChart3 size={16} />,
      content: (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={completionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
            <XAxis dataKey="date" stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: THEME_COLORS.text }} />
            <Bar dataKey="created" barSize={12} fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )
    },
    { title: 'Project Overdue Trend', desc: 'Overdue tasks ending on day', icon: <Clock size={16} />,
      content: (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={overdueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
            <XAxis dataKey="date" stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={THEME_COLORS.text} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="overdue" stroke="#ef4444" fillOpacity={0.2} fill="#ef4444" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )
    }
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/project/${projectId}`)} style={{ marginBottom: 12, paddingLeft: 4 }}>
            <ChevronLeft size={16} /> Back to board
          </button>
          <h1 className="analytics-title">Project Analytics</h1>
          <p className="analytics-subtitle">Insights and progress for {activeProject?.name || 'this project'}</p>
        </div>
        
        {/* KPI Mini-cards */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="stat-item" style={{ background: 'var(--color-surface-raised)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
            <span className="stat-value">{completionRate.toFixed(0)}%</span>
            <span className="stat-label">Completion rate</span>
          </div>
          <div className="stat-item" style={{ background: 'var(--color-surface-raised)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
            <span className="stat-value">{completedTasks} <span style={{fontSize: 14, color: 'var(--color-text-tertiary)', fontWeight: 500}}>of {totalTasks}</span></span>
            <span className="stat-label">Tasks completed</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            className="chart-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="chart-header">
              {c.icon}
              <div>
                <h3 className="chart-title">{c.title}</h3>
                <p className="chart-desc">{c.desc}</p>
              </div>
            </div>
            <div className="chart-container">
              {c.content}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsPage;
