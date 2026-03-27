import React from 'react';

const Avatar = ({ name = '', src, size = 'md', style = {} }) => {
  const sizeClass = `avatar-${size}`;
  const getInitials = (n) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const colors = [
    'linear-gradient(135deg, #7c6ffb, #22d3ee)',
    'linear-gradient(135deg, #10b981, #3b82f6)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #06b6d4, #6366f1)',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`avatar ${sizeClass}`}
      style={{ background: src ? 'transparent' : colors[colorIndex], ...style }}
      title={name}
    >
      {src ? <img src={src} alt={name} /> : getInitials(name)}
    </div>
  );
};

export default Avatar;
