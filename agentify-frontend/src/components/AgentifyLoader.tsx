import React, { useMemo, useRef, useEffect } from 'react';
import clsx from 'clsx';

export type AgentifyLoaderProps = {
  width: string;
  height: string;
};

const AgentifyLoader: React.FC<AgentifyLoaderProps> = ({ width, height }) => {
  return <div className={clsx(width, height)}></div>;
};

export default AgentifyLoader;
