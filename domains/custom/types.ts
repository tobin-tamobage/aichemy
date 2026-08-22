import type { DomainOption } from '../types';

/**
 * Custom recipe schema — phase5 plan §1 (`.nbrecipe`, recipeVersion: 1).
 * Studio Builder (Task 3) menghasilkan shape ini; `toDomainRecipe` mengadaptasinya
 * ke DomainRecipe runtime. Murni data — TIDAK ada fungsi/eval di dalam recipe.
 *
 * Catatan: plan menyebut "CatalogOption is the existing shape" — tidak ada tipe
 * bernama CatalogOption di kode existing; shape dimaksud = DomainOption + promptPhrase
 * opsional (konvensi katalog builtin). Didefinisikan di sini.
 */
export interface CatalogOption extends DomainOption {
  /** Frasa prompt untuk opsi ini; fallback ke label bila tidak ada (konvensi builtin). */
  promptPhrase?: string;
}

export interface CustomRecipe {
  recipeVersion: 1;
  id: string; // 'x-' + slug, unik vs builtin
  label: string;
  icon: string; // emoji
  tagline: string;
  referencePhoto?: boolean; // default false
  referenceLabel?: string;
  referenceClause?: string; // disisipkan saat reference photo aktif
  sections: CustomSection[];
  template: PromptBlock[]; // blok prompt terurut
  rules?: CustomRule[]; // smart warnings
  presetProtectedKeys?: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  fields: CustomField[];
}

export type CustomFieldKind = 'select' | 'textarea' | 'chips' | 'toggle';

export interface CustomField {
  key: string; // unik dalam recipe
  label: string;
  kind: CustomFieldKind;
  options?: CatalogOption[]; // select/chips: wajib, >=1
  placeholder?: string; // textarea
  max?: number; // chips (>=1)
  text?: string; // toggle: klausa saat true — pengganti deklaratif if-block builtin
  hint?: string; // toggle/select hint
  default?: unknown; // select: option value; chips: value[]; toggle: boolean; textarea: string
  visibleWhen?: When; // dikompilasi ke DomainField.visibleWhen
}

export type PromptBlock =
  | { kind: 'text'; text: string; when?: When }
  | { kind: 'field'; field: string; prefix?: string; suffix?: string; separator?: string; when?: When }
  | { kind: 'reference'; when?: When }; // merender referenceClause; digate hasReferencePhoto

export interface CustomRule {
  id: string;
  sectionId: string;
  level: 'info' | 'warn';
  when: When;
  text: string;
}

export type When =
  | { field: string; op: 'equals' | 'not-equals'; value: string }
  | { field: string; op: 'in' | 'not-in'; values: string[] }
  | { field: string; op: 'empty' | 'not-empty' }
  | { field: string; op: 'contains' | 'not-contains'; value: string }; // keanggotaan array chips
