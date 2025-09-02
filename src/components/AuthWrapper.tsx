'use client';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../hooks/useAuth';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
