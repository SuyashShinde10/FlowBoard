import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, borderRadius = 8, style, className = '' }) => {
  return (
    <div 
      className={`skeleton-loader ${className}`} 
      style={{ width, height, borderRadius, ...style }} 
    />
  );
};

export default Skeleton;
