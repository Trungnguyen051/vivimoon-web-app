/**
 * Per-resource mock/upstream resolution.
 *
 * Resources migrate to Vivimoon's real API one at a time. Mixed mode is only
 * safe within dependency boundaries: `commerce` references catalog products and
 * identity users, so it must not go upstream while either is still mocked —
 * fixture IDs will not match real ones and references dangle.
 */
export const RESOURCES = ['catalog', 'identity', 'discovery', 'commerce'] as const;
export type ResourceName = (typeof RESOURCES)[number];

export type ApiMode = 'mock' | 'upstream';

/** Resources that must already be upstream before the key may go upstream. */
const DEPENDS_ON: Partial<Record<ResourceName, ResourceName[]>> = {
  discovery: ['catalog'],
  commerce: ['catalog', 'identity'],
};

function readMode(envKey: string): ApiMode | undefined {
  const raw = process.env[envKey];
  if (raw === undefined || raw === '') return undefined;
  if (raw !== 'mock' && raw !== 'upstream') {
    throw new Error(`${envKey} must be "mock" or "upstream", received "${raw}"`);
  }
  return raw;
}

/** Resolve without dependency checking, to avoid infinite recursion. */
function rawMode(resource: ResourceName): ApiMode {
  return (
    readMode(`API_MODE_${resource.toUpperCase()}`) ??
    readMode('API_MODE_DEFAULT') ??
    'mock'
  );
}

export function resolveMode(resource: ResourceName): ApiMode {
  const mode = rawMode(resource);
  if (mode === 'mock') return 'mock';

  if (!process.env.UPSTREAM_API_BASE_URL) {
    throw new Error(
      `${resource} is set to upstream but UPSTREAM_API_BASE_URL is not set`,
    );
  }

  for (const dep of DEPENDS_ON[resource] ?? []) {
    if (rawMode(dep) !== 'upstream') {
      throw new Error(
        `${resource} cannot go upstream while ${dep} is still mocked — ` +
          `fixture IDs will not match real ones. Migrate ${dep} first.`,
      );
    }
  }
  return 'upstream';
}

export function upstreamBaseUrl(): string {
  const raw = process.env.UPSTREAM_API_BASE_URL;
  if (!raw) throw new Error('UPSTREAM_API_BASE_URL is not set');
  return raw.trim().replace(/\/+$/, '');
}

export function upstreamTimeoutMs(): number {
  const raw = process.env.UPSTREAM_API_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000;
}

/** True when any resource is live. Gates dev-only affordances. */
export function isAnyUpstream(): boolean {
  return RESOURCES.some((r) => rawMode(r) === 'upstream');
}
