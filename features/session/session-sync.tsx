'use client';
import { useEffect } from 'react';
import { apiRequest } from '@/lib/api/client';
import { useSessionStore, type SessionUser } from './session-store';

/**
 * Hydrates the session store once per mount from the httpOnly cookie, which
 * JavaScript cannot read directly. Renders nothing.
 */
export function SessionSync() {
  const setUser = useSessionStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;
    apiRequest<{ user: SessionUser | null }>('/api/auth/session').then((result) => {
      if (cancelled) return;
      setUser(result.ok ? result.data.user : null);
    });
    return () => { cancelled = true; };
  }, [setUser]);

  return null;
}
