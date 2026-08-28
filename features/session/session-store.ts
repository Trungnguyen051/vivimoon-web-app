'use client';
import { create } from 'zustand';

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
}

/** `unknown` means the session has not been checked yet, so the header can
 *  render a neutral placeholder instead of flashing a signed-out state. */
export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

interface SessionStore {
  user: SessionUser | null;
  status: SessionStatus;
  setUser: (user: SessionUser | null) => void;
  clear: () => void;
}

/**
 * Not persisted. The httpOnly session cookie is the source of truth; this is a
 * render convenience hydrated from GET /api/auth/session.
 */
export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  status: 'unknown',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'anonymous' }),
  clear: () => set({ user: null, status: 'anonymous' }),
}));
