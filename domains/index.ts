import type { DomainRecipe, DomainState } from './types';
import { cinematicDomain } from './cinematic';
import { idPhotoDomain } from './id-photo';
import { weddingDomain } from './wedding';
import { productDomain } from './product';
import { marketingDomain } from './marketing';
import { portraitDomain } from './portrait';
import { realEstateDomain } from './real-estate';
import { foodDomain } from './food';
import { toDomainRecipe } from './custom/toDomainRecipe';
import {
  loadCustomRecipes,
  saveCustomRecipe,
  deleteCustomRecipe,
} from '../services/browserStorage';

/** Registry domain aktif — StartScreen + domain switcher membaca daftar ini. */
export const DOMAINS: DomainRecipe[] = [
  cinematicDomain,
  idPhotoDomain,
  weddingDomain,
  productDomain,
  marketingDomain,
  portraitDomain,
  realEstateDomain,
  foodDomain,
];

export const getDomain = (id: string): DomainRecipe =>
  DOMAINS.find(d => d.id === id) ??
  listCustomDomains().find(d => d.id === id) ??
  cinematicDomain;

export const DEFAULT_DOMAIN_ID = 'cinematic';

// ---------- custom studios (phase 5) ----------

/**
 * Cache adapter custom. Sumber kebenaran = localStorage via browserStorage;
 * cache di-invalidate HANYA di dalam save/delete wrapper di bawah, sehingga
 * tidak ada akses localStorage di top-level modul (aman untuk bundle Node
 * scripts/generate-asset-checklist.mjs).
 */
let customDomainsCache: DomainRecipe[] | null = null;

export function listCustomDomains(): DomainRecipe[] {
  if (customDomainsCache === null) {
    customDomainsCache = loadCustomRecipes().map(toDomainRecipe);
  }
  return customDomainsCache;
}

/** Semua domain: builtin dulu, lalu custom studios. */
export function getAllDomains(): DomainRecipe[] {
  return [...DOMAINS, ...listCustomDomains()];
}

export { loadCustomRecipes as listCustomRecipes };

export function saveCustomStudio(recipe: Parameters<typeof saveCustomRecipe>[0]): boolean {
  const ok = saveCustomRecipe(recipe);
  if (ok) customDomainsCache = null;
  return ok;
}

export function deleteCustomStudio(id: string): boolean {
  const ok = deleteCustomRecipe(id);
  if (ok) customDomainsCache = null;
  return ok;
}

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
