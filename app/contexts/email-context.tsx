'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface EmailCredentials {
  email: string;
  password: string;
}

interface EmailContextType {
  credentials: EmailCredentials | null;
  setCredentials: (credentials: EmailCredentials | null) => void;
  isAuthenticated: boolean;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<EmailCredentials | null>(() => {
    // Check if credentials are stored in localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('email-credentials');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Invalid stored data, ignore
        }
      }
    }
    return null;
  });

  const handleSetCredentials = (newCredentials: EmailCredentials | null) => {
    setCredentials(newCredentials);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      if (newCredentials) {
        localStorage.setItem('email-credentials', JSON.stringify(newCredentials));
      } else {
        localStorage.removeItem('email-credentials');
      }
    }
  };

  return (
    <EmailContext.Provider
      value={{
        credentials,
        setCredentials: handleSetCredentials,
        isAuthenticated: !!credentials,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
}
