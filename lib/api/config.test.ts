import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveMode, upstreamBaseUrl, upstreamTimeoutMs, RESOURCES } from './config';

const saved = { ...process.env };
beforeEach(() => { process.env = { ...saved }; });
afterEach(() => { process.env = { ...saved }; });

describe('resolveMode', () => {
  it('defaults to mock when nothing is set', () => {
    delete process.env.API_MODE_DEFAULT;
    expect(resolveMode('catalog')).toBe('mock');
  });

  it('honours API_MODE_DEFAULT', () => {
    process.env.API_MODE_DEFAULT = 'upstream';
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    expect(resolveMode('catalog')).toBe('upstream');
  });

  it('lets a per-resource override beat the default', () => {
    process.env.API_MODE_DEFAULT = 'mock';
    process.env.API_MODE_CATALOG = 'upstream';
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    expect(resolveMode('catalog')).toBe('upstream');
    expect(resolveMode('identity')).toBe('mock');
  });

  it('rejects an unknown mode value loudly', () => {
    process.env.API_MODE_CATALOG = 'somethingelse';
    expect(() => resolveMode('catalog')).toThrow(/API_MODE_CATALOG/);
  });

  it('refuses upstream mode without a base URL', () => {
    process.env.API_MODE_CATALOG = 'upstream';
    delete process.env.UPSTREAM_API_BASE_URL;
    expect(() => resolveMode('catalog')).toThrow(/UPSTREAM_API_BASE_URL/);
  });

  it('refuses commerce upstream while catalog is still mocked', () => {
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com';
    process.env.API_MODE_COMMERCE = 'upstream';
    process.env.API_MODE_CATALOG = 'mock';
    expect(() => resolveMode('commerce')).toThrow(/catalog/i);
  });

  it('exposes every resource name', () => {
    expect(RESOURCES).toEqual(['catalog', 'identity', 'discovery', 'commerce']);
  });

  it('reads timeout with a default', () => {
    delete process.env.UPSTREAM_API_TIMEOUT_MS;
    expect(upstreamTimeoutMs()).toBe(10000);
    process.env.UPSTREAM_API_TIMEOUT_MS = '2500';
    expect(upstreamTimeoutMs()).toBe(2500);
  });

  it('returns the trimmed base URL without a trailing slash', () => {
    process.env.UPSTREAM_API_BASE_URL = 'https://api.example.com/';
    expect(upstreamBaseUrl()).toBe('https://api.example.com');
  });
});
