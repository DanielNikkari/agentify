import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

/**
 * Handle protecting routes from unauthenticated access.
 *
 * @returns Outlet
 */
export default function ProtectedRoute() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading…</div>; // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // renders child routes
}
