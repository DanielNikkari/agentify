import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AgentifyLoader from '../components/AgentifyLoader';

/**
 * Handle protecting routes from unauthenticated access.
 *
 * @returns Outlet
 */
export default function ProtectedRoute() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div className="bg-agentify-bg-gray">
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] text-center">
          <AgentifyLoader type="bar" width="w-30" height="h-5" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // renders child routes
}
