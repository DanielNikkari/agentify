import React, { useState } from 'react';
import clsx from 'clsx';
import './AgentifyLoader.css';

export type AgentifyLoaderProps = {
  width?: string;
  height?: string;
  type?: 'spinner' | 'bar' | 'pencil';
  color?: string;
};

const AgentifyLoader: React.FC<AgentifyLoaderProps> = ({
  type = 'spinner',
  width = 'w-20',
  height = 'h-4',
  color,
}) => {
  // Random color for pencil if not provided
  const [pencilColor] = useState(() => {
    if (color) return color;
    const colors = [
      'var(--color-agentify-accent-coral)',
      'var(--color-agentify-accent-green)',
      'var(--color-agentify-accent-blue)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  if (type === 'spinner') {
    return <div className={clsx('spinner', width, height, 'scale-75')}></div>;
  } else if (type === 'bar') {
    return <div className={clsx('loader', width, height)}></div>;
  } else if (type === 'pencil') {
    return (
      <div
        className="pencil-loader-container"
        style={{ '--pencil-color': pencilColor } as React.CSSProperties}
      >
        <div className="pencil">
          <div className="pencil__ball-point"></div>
          <div className="pencil__cap"></div>
          <div className="pencil__cap-base"></div>
          <div className="pencil__middle"></div>
          <div className="pencil__eraser"></div>
        </div>
        <div className="pencil-line"></div>
      </div>
    );
  }
  return null;
};

export default AgentifyLoader;
