'use client';
import { useEffect } from 'react';
import { create } from 'zustand';
import { apiRequest } from '@/lib/api/client';
import { defaultRxSchema, type DefaultRx } from '@/lib/api/schemas/rx';
import type { User } from '@/lib/api/schemas/auth';
import { useSessionStore } from './session-store';

/** A guest's Default Rx lives on the device (CONTEXT.md "Default Rx"). */
export const GUEST_RX_KEY = 'vivimoon-default-rx';
/** Set by "Xoá tất cả" so the collection doesn't put a cleared Default Rx straight back this session. */
const CLEARED_KEY = 'vivimoon-default-rx-cleared';

/** Shared so the sidebar, the mobile sheet and the buy box see one guest value. */
export const useGuestRxStore = create<{ rx: DefaultRx | null; loaded: boolean }>(() => ({ rx: null, loaded: false }));

function readGuestRx(): DefaultRx | null {
  try {
    // Device storage is untrusted: anything but a valid Default Rx reads as none.
    const parsed = defaultRxSchema.safeParse(JSON.parse(localStorage.getItem(GUEST_RX_KEY) ?? 'null'));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * The shopper's Default Rx — a member's from the account, a guest's from the device — and
 * how to save a new one. `ready` is false until the session and the device have been read,
 * so nothing acts on a "none" that is really "not loaded yet".
 */
export function useDefaultRx() {
  const status = useSessionStore((s) => s.status);
  const memberRx = useSessionStore((s) => s.user?.defaultRx);
  const setUser = useSessionStore((s) => s.setUser);
  const guest = useGuestRxStore();

  useEffect(() => {
    if (!useGuestRxStore.getState().loaded) useGuestRxStore.setState({ rx: readGuestRx(), loaded: true });
  }, []);

  const ready = status === 'authenticated' || (status === 'anonymous' && guest.loaded);
  const defaultRx = !ready ? null : status === 'authenticated' ? (memberRx ?? null) : guest.rx;

  async function save(rx: DefaultRx): Promise<boolean> {
    if (status === 'authenticated') {
      const result = await apiRequest<User>('/api/account', { method: 'PATCH', body: { defaultRx: rx } });
      if (result.ok) setUser(result.data);
      return result.ok;
    }
    try {
      localStorage.setItem(GUEST_RX_KEY, JSON.stringify(rx));
    } catch {
      // Storage blocked (private mode): the choice still holds for this page.
    }
    useGuestRxStore.setState({ rx, loaded: true });
    return true;
  }

  return { defaultRx, ready, save };
}

export function rxFilterCleared(): boolean {
  try {
    return sessionStorage.getItem(CLEARED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setRxFilterCleared(cleared: boolean) {
  try {
    if (cleared) sessionStorage.setItem(CLEARED_KEY, '1');
    else sessionStorage.removeItem(CLEARED_KEY);
  } catch {
    // Storage blocked: the saved Default Rx may come back on the next visit, which is harmless.
  }
}
