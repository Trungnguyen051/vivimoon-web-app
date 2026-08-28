import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from './session-store';

const user = { id: 'u1', name: 'Mai', phone: '0900000000' };

describe('useSessionStore', () => {
  beforeEach(() => { useSessionStore.setState({ user: null, status: 'unknown' }); });

  it('starts in the unknown state', () => {
    expect(useSessionStore.getState().status).toBe('unknown');
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('setUser with a user authenticates', () => {
    useSessionStore.getState().setUser(user);
    expect(useSessionStore.getState().status).toBe('authenticated');
    expect(useSessionStore.getState().user?.name).toBe('Mai');
  });

  it('setUser with null resolves to anonymous, not unknown', () => {
    useSessionStore.getState().setUser(null);
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('clear returns to anonymous', () => {
    useSessionStore.getState().setUser(user);
    useSessionStore.getState().clear();
    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('does not write to storage', () => {
    useSessionStore.getState().setUser(user);
    expect(window.localStorage.getItem('vivimoon-session')).toBeNull();
    expect(window.sessionStorage.getItem('vivimoon-session')).toBeNull();
  });
});
