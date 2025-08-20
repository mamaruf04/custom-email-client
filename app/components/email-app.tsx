'use client';

import { useEmail } from '../contexts/email-context';
import { Login } from './login';

interface EmailAppProps {
  children: React.ReactNode;
}

export function EmailApp({ children }: EmailAppProps) {
  const { isAuthenticated, setCredentials } = useEmail();

  const handleLogin = (credentials: { email: string; password: string }) => {
    setCredentials(credentials);
  };

  const handleLogout = () => {
    setCredentials(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      {children}
      <LogoutButton onLogout={handleLogout} />
    </>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      onClick={onLogout}
      className="fixed top-4 right-4 z-50 rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Logout
    </button>
  );
}
