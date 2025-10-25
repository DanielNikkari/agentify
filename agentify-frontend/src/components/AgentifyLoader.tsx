import React, { useMemo, useRef, useEffect } from 'react';
import clsx from 'clsx';
import './AgentifyLoader.css';

export type AgentifyLoaderProps = {
  width: string;
  height: string;
  type?: 'spinner' | 'bar';
};

const AgentifyLoader: React.FC<AgentifyLoaderProps> = ({
  type = 'spinner',
  width = 'w-20',
  height = 'h-4',
}) => {
  if (type === 'spinner') {
    return <div className={clsx('spinner', width, height, 'scale-75')}></div>;
  } else if (type === 'bar') {
    return <div className={clsx('loader', width, height)}></div>;
  }
};

export default AgentifyLoader;
