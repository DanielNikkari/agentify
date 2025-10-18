import React, { useMemo } from 'react';

import CardBrainIcon from '../assets/icons/card-brain-icon.svg';
import CardIDCardIcon from '../assets/icons/card-id-card-icon.svg';
import CardKnowledgebaseIcon from '../assets/icons/card-knowledge-base-icon.svg';
import CardToolsIcon from '../assets/icons/card-tools-icon.svg';

import AgentIcon1 from '../assets/agent-icons/agent-icon-1.svg';
import AgentIcon2 from '../assets/agent-icons/agent-icon-2.svg';
import AgentIcon3 from '../assets/agent-icons/agent-icon-3.svg';
import AgentIcon4 from '../assets/agent-icons/agent-icon-4.svg';
import AgentIcon5 from '../assets/agent-icons/agent-icon-5.svg';
import AgentIcon6 from '../assets/agent-icons/agent-icon-6.svg';
import AgentIcon7 from '../assets/agent-icons/agent-icon-7.svg';
import AgentIcon8 from '../assets/agent-icons/agent-icon-8.svg';
import AgentIcon9 from '../assets/agent-icons/agent-icon-9.svg';
import AgentIcon10 from '../assets/agent-icons/agent-icon-10.svg';
import AgentIcon11 from '../assets/agent-icons/agent-icon-11.svg';
import AgentIcon12 from '../assets/agent-icons/agent-icon-12.svg';
import AgentIcon13 from '../assets/agent-icons/agent-icon-13.svg';
import AgentIcon14 from '../assets/agent-icons/agent-icon-14.svg';
import AgentIcon15 from '../assets/agent-icons/agent-icon-15.svg';
import AgentIcon16 from '../assets/agent-icons/agent-icon-16.svg';
import AgentIcon17 from '../assets/agent-icons/agent-icon-17.svg';
import AgentIcon18 from '../assets/agent-icons/agent-icon-18.svg';
import AgentIcon19 from '../assets/agent-icons/agent-icon-19.svg';
import AgentIcon20 from '../assets/agent-icons/agent-icon-20.svg';

export type AgentStatus = 'active' | 'idle' | 'error';
export type AgentAccent = 'coral' | 'green' | 'blue';

export type Agent = {
  id: string;
  name: string;
  model: string; // e.g. "GPT 5", "Gemini 2.5 Flash", "Sonnet 4.5"
  status?: AgentStatus;
  accent?: AgentAccent; // avatar halo color
  avatarSrc?: string; // optional image url
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

const fallbackAvatars = [
  AgentIcon1,
  AgentIcon2,
  AgentIcon3,
  AgentIcon4,
  AgentIcon5,
  AgentIcon6,
  AgentIcon7,
  AgentIcon8,
  AgentIcon9,
  AgentIcon10,
  AgentIcon11,
  AgentIcon12,
  AgentIcon13,
  AgentIcon14,
  AgentIcon15,
  AgentIcon16,
  AgentIcon17,
  AgentIcon18,
  AgentIcon19,
  AgentIcon20,
];

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
  const { name, model, status, accent = 'blue', avatarSrc } = agent;
  const resolvedStatus = (status || 'active') as AgentStatus;
  const statusLabel = `${resolvedStatus.charAt(0).toUpperCase()}${resolvedStatus.slice(1)}`;
  const fallbackAvatar = useMemo(
    () => fallbackAvatars[Math.floor(Math.random() * fallbackAvatars.length)],
    []
  );

  return (
    <div
      className="relative w-[290px] rounded-2xl border border-black/5 bg-[var(--color-agentify-white)] p-6 shadow-md shadow-black/10 transition-shadow hover:shadow-lg hover:cursor-pointer"
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
            src={avatarSrc || fallbackAvatar}
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
          label="knowledge base name"
        />
        <DetailRow
          icon={<img src={CardKnowledgebaseIcon} className="h-5 w-5" />}
          label="tools list"
        />
        <DetailRow icon={<img src={CardToolsIcon} className="h-5 w-5" />} label="agent role" />
      </div>
    </div>
  );
}

// Grid
export default function AgentCards({ agents }: { agents: Agent[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {agents.map((a) => (
        <AgentCard key={a.id} agent={a} />
      ))}
    </div>
  );
}

// Example data for quick drop-in
export const DEMO_AGENTS: Agent[] = [
  {
    id: 'a1',
    name: 'Berte Fahrenwald',
    model: 'Gemini 2.5 Flash',
    status: 'active',
    accent: 'blue',
  },
  {
    id: 'a2',
    name: 'Ivie Murakami',
    model: 'GPT 5',
    status: 'idle',
    accent: 'blue',
  },
  {
    id: 'a3',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a4',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a5',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a6',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a7',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a8',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a9',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a10',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
  {
    id: 'a11',
    name: 'Fidela Lochridge',
    model: 'Sonnet 4.5',
    status: 'error',
    accent: 'blue',
  },
];

/*
Usage:

import AgentCards, { DEMO_AGENTS } from "./AgentCards";

export default function Page() {
  return (
    <main className="min-h-screen bg-[var(--color-agentify-bg-gray)] p-8 font-[var(--font-inter)]">
      <AgentCards agents={DEMO_AGENTS} />
    </main>
  );
}
*/
