// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AgentCards, { Agent } from '../components/AgentCards';
import AgentifyLoader from '../components/AgentifyLoader';
import '../components/AgentifyLoader.css';
import emptyBox from '../assets/illustrations/missing.png';
import Navigation from '../components/Navigation';
import TermsAndConditions from '../components/TermsAndConditions';
import { getAgents } from '../api/agents';
import SlideAlert from '../components/SlideAlert';

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const [alert, setAlert] = useState<{
    type: 'error' | 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadAgents = async () => {
      try {
        setLoadingAgents(true);
        const agents = await getAgents();
        setAgents(agents);
      } catch (error) {
        console.error('Failed to load agents:', error);
        setAlert({ type: 'error', message: 'ERROR: Failed to load agents.' });
        return;
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, [user]);

  // Agents state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // terms and conditions state
  const [showTerms, setShowTerms] = useState(false);

  if (loading)
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] text-center">
        <AgentifyLoader type="spinner" width="w-10" height="h-10" />
        <h4 className="text-agentify-dark-gray dots-loader mt-3">Authenticating...</h4>
      </div>
    );

  if (error) return <p className="text-center text-red-500 mt-10">Error: {error.message}</p>;

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-agentify-bg-gray text-center">
        <h1 className="text-2xl font-semibold text-agentify-dark m-2">
          Please sign in to continue.
        </h1>
        <button
          onClick={() => navigate('/login')}
          className="m-6 px-6 py-3 rounded-full bg-agentify-accent-coral text-white font-medium hover:shadow-lg transition border-agentify-dark"
        >
          go to login
        </button>
      </div>
    );

  // Main Home view
  return (
    <div className="flex h-screen bg-agentify-bg-gray overflow-hidden">
      {/* Slide alert */}
      {alert && (
        <SlideAlert
          type={alert.type}
          message={alert.message}
          duration={5000}
          onClose={() => setAlert(null)}
        />
      )}
      {/* Navigation Sidebar */}
      <Navigation onOpenTerms={() => setShowTerms(true)} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Sticky Header Bar with Create Agent Button */}
        <div className="sticky top-0 z-10 bg-agentify-bg-gray">
          <div className="flex justify-end items-center px-10 py-4">
            <div className="group relative">
              <button
                onClick={() => navigate('/agent/create')}
                className="w-8 h-8 hover:scale-110 transition-all flex items-center justify-center hover:cursor-pointer"
                aria-label="Create agent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  className="fill-agentify-dark-gray hover:fill-agentify-accent-coral"
                >
                  <path d="M46.586 9.45c-2.39-2.391-5.766-2.766-9.75-2.766H19.117c-3.937 0-7.312.375-9.703 2.765s-2.742 5.742-2.742 9.657v17.718c0 4.008.352 7.336 2.742 9.727s5.766 2.765 9.774 2.765h17.648c3.984 0 7.36-.375 9.75-2.765s2.742-5.719 2.742-9.727V19.176c0-4.008-.351-7.36-2.742-9.727M28 41.745a1.855 1.855 0 0 1-1.852-1.851V29.84h-10.03c-1.032 0-1.852-.844-1.852-1.828s.82-1.875 1.851-1.875h10.031V16.105c0-1.054.82-1.875 1.852-1.875c1.055 0 1.852.82 1.852 1.875v10.032h10.054c1.032 0 1.852.89 1.852 1.875c0 .984-.82 1.828-1.852 1.828H29.852v10.055A1.84 1.84 0 0 1 28 41.746" />
                </svg>
              </button>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-agentify-dark text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                create agent
              </div>
            </div>
          </div>
        </div>

        {loadingAgents ? (
          <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-6 text-center">
            <AgentifyLoader type="spinner" width="w-10" height="h-10" />
            <h4 className="text-agentify-dark-gray dots-loader mt-3">Loading agents...</h4>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-6 text-center">
            <img
              src={emptyBox}
              alt="Empty box illustration"
              className="w-40 h-40 mb-6 prevent-drag"
            />
            <h2 className="text-2xl font-semibold text-agentify-dark mb-2">
              Oopsie... you have no agents,
            </h2>
            <h2 className="text-2xl font-semibold text-agentify-dark mb-6">
              but we can create one!
            </h2>
            <button
              onClick={() => navigate('/create-agent')}
              className="px-8 py-3 rounded-full bg-agentify-accent-coral text-white font-medium hover:shadow-lg transition hover:bg-agentify-accent-coral-hover"
            >
              create your first agent
            </button>
          </div>
        ) : (
          <div className="bg-[var(--color-agentify-bg-gray)] p-8 font-[var(--font-inter)]">
            <AgentCards agents={agents} />
          </div>
        )}
      </main>

      {/* Modal */}
      <TermsAndConditions isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
