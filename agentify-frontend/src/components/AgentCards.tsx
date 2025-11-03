import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import CardBrainIcon from '../assets/icons/card-brain-icon.svg';
import CardIDCardIcon from '../assets/icons/card-id-card-icon.svg';
import CardKnowledgebaseIcon from '../assets/icons/card-knowledge-base-icon.svg';
import CardToolsIcon from '../assets/icons/card-tools-icon.svg';

export type AgentStatus = 'active' | 'idle' | 'error';
export type AgentAccent = 'coral' | 'green' | 'blue';

export type Agent = {
  uuid: string;
  name: string;
  model: string; // e.g. "GPT 5", "Gemini 2.5 Flash", "Sonnet 4.5"
  avatar?: string;
  icon?: string; // Alternative to avatar for backwards compatibility
  role?: string;
  status?: AgentStatus;
  accent?: AgentAccent; // avatar halo color
  knowledge_base?: string;
  tools?: string;
};

const statusColor: Record<AgentStatus, string> = {
  active: 'var(--color-agentify-accent-green)',
  idle: 'var(--color-agentify-dark-gray)',
  error: 'var(--color-agentify-red)',
};

const accentBg: Record<AgentAccent, string> = {
  coral: 'var(--color-agentify-accent-coral)',
  green: 'var(--color-agentify-accent-green)',
  blue: 'var(--color-agentify-accent-blue)',
};

// Small row used inside the card
function DetailRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-[15px] leading-6 text-[var(--color-agentify-dark)]">
      <div
        className="grid h-6 w-6 place-items-center rounded-md"
        style={{ color: 'var(--color-agentify-accent-coral)' }}
      >
        {icon}
      </div>
      <span className="truncate text-[var(--color-agentify-dark)]">{label}</span>
    </div>
  );
}

export function AgentCard({ agent }: { agent: Agent }) {
  const navigate = useNavigate();
  const {
    uuid,
    name,
    role,
    model,
    status,
    accent = 'blue',
    avatar,
    icon,
    knowledge_base,
    tools,
  } = agent;
  const resolvedStatus = (status || 'idle') as AgentStatus;
  const statusLabel = `${resolvedStatus.charAt(0).toUpperCase()}${resolvedStatus.slice(1)}`;

  const getAvatarUrl = (avatarOrIcon?: string | number): string => {
    // If no avatar/icon provided, use a default
    if (!avatarOrIcon) {
      return `/public/agent-icons/agent-icon-1.svg`;
    }

    // Case 1: avatar is a number → load from local default icons
    if (!isNaN(Number(avatarOrIcon))) {
      const index = Number(avatarOrIcon);
      return `/public/agent-icons/agent-icon-${index}.svg`;
    }

    // Case 2: avatar is a real URL (string that's NOT a number)
    return String(avatarOrIcon);
  };

  const agentAvatar = getAvatarUrl(avatar || icon);

  const handleClick = () => {
    navigate(`/chat/${uuid}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-[290px] rounded-2xl border-2 border-black/5 bg-[var(--color-agentify-white)] p-6 hover:border-[var(--color-agentify-accent-coral)] hover:cursor-pointer overflow-hidden"
      role="group"
    >
      {/* status dot + tooltip */}
      <div className="absolute right-3 top-3">
        <span
          aria-label={`status: ${statusLabel}`}
          className="group relative inline-flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white"
          style={{ backgroundColor: statusColor[resolvedStatus] }}
        >
          <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-agentify-dark)] px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {statusLabel}
          </span>
        </span>
      </div>

      {/* avatar + name */}
      <div className="flex flex-col items-center">
        <div
          className="prevent-drag grid h-22 w-22 place-items-center rounded-full shadow-inner"
          style={{ backgroundColor: accentBg[accent] }}
        >
          <img
            src={agentAvatar}
            alt={name}
            className="h-22 w-22 rounded-full object-cover"
            draggable={false}
          />
        </div>

        <h3 className="mt-4 text-center text-xl font-semibold leading-7 text-[var(--color-agentify-dark)]">
          {name}
        </h3>
      </div>

      {/* details */}
      <div className="mt-5 grid gap-4">
        <DetailRow icon={<img src={CardBrainIcon} className="h-5 w-5" />} label={model} />
        <DetailRow
          icon={<img src={CardIDCardIcon} className="h-5 w-5" />}
          label={role ? role : 'No role added'}
        />
        <DetailRow
          icon={<img src={CardKnowledgebaseIcon} className="h-5 w-5" />}
          label={knowledge_base ? knowledge_base : 'No knowledge base added'}
        />
        <DetailRow
          icon={<img src={CardToolsIcon} className="h-5 w-5" />}
          label={tools ? tools : 'No tools set'}
        />
      </div>
    </div>
  );
}

// Grid
export default function AgentCards({ agents }: { agents: Agent[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {agents.map((a) => (
        <AgentCard key={a.uuid} agent={a} />
      ))}
    </div>
  );
}
