import type { DomainRecipe, DomainState } from './types';
import { cinematicDomain } from './cinematic';
import { idPhotoDomain } from './id-photo';
import { weddingDomain } from './wedding';
import { productDomain } from './product';
import { marketingDomain } from './marketing';

/** Registry domain aktif — StartScreen + domain switcher membaca daftar ini. */
export const DOMAINS: DomainRecipe[] = [cinematicDomain, idPhotoDomain, weddingDomain, productDomain, marketingDomain];

export const getDomain = (id: string): DomainRecipe =>
  DOMAINS.find(d => d.id === id) ?? cinematicDomain;

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
