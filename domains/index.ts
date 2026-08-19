import type { DomainRecipe, DomainState } from './types';

// populated in Tasks 3-5
export const DOMAINS: DomainRecipe[] = [];

export const getDomain = (id: string): DomainRecipe => {
  const domain = DOMAINS.find(d => d.id === id);
  if (!domain) {
    throw new Error(`[recipes] Unknown domain "${id}". Registered: ${DOMAINS.map(d => d.id).join(', ') || '(none)'}`);
  }
  return domain;
};

export const DEFAULT_DOMAIN_ID = 'cinematic';

/** Merge preset ke state kosong, hormati presetProtectedKeys. */
export function applyPreset(domain: DomainRecipe, current: DomainState, data: Record<string, unknown>): DomainState {
  const next = { ...current };
  for (const [k, v] of Object.entries(data)) {
    if (domain.presetProtectedKeys.includes(k)) continue;
    next[k] = v;
  }
  return next;
}

export type { DomainRecipe, DomainState, DomainField, DomainSection, DomainOption, DomainWarning, DomainPreset } from './types';
