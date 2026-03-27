import React from 'react';

const priorityConfig = {
  low:    { label: 'Low',    className: 'badge priority-low' },
  medium: { label: 'Medium', className: 'badge priority-medium' },
  high:   { label: 'High',   className: 'badge priority-high' },
  urgent: { label: 'Urgent', className: 'badge priority-urgent' },
};

const PriorityBadge = ({ priority }) => {
  const cfg = priorityConfig[priority] || priorityConfig.medium;
  return <span className={cfg.className}>{cfg.label}</span>;
};

export default PriorityBadge;
