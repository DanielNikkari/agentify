import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import AgentifyLoader from '../components/AgentifyLoader';

export default function Home() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="p-8">
      <AgentifyLoader width="w-10" height="h-10" />
      {user ? (
        <div>
          <h1 className="text-2xl font-semibold">
            Hello there, {user.displayName || user.email || 'Agent'} 👋
          </h1>
          <p className="text-gray-600 mt-2">UID: {user.uid}</p>
          {user.photoURL && (
            <img src={user.photoURL} alt="User avatar" className="mt-4 w-16 h-16 rounded-full" />
          )}
        </div>
      ) : (
        <h1>Please sign in to continue.</h1>
      )}
    </div>
  );
}
