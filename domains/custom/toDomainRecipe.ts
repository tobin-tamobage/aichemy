import type {
  DomainField,
  DomainRecipe,
  DomainSection,
  DomainState,
  DomainWarning,
} from '../types';
import type { CatalogOption, CustomField, CustomRecipe, When } from './types';

/**
 * toDomainRecipe — phase5 plan §1 adapter semantics.
 * Mengubah CustomRecipe (data murni dari Studio Builder / import .nbrecipe) menjadi
 * DomainRecipe runtime. Tidak ada klausa tersembunyi: prompt = blok template apa
 * adanya (tidak ada guardrail otomatis — konvensi guardrail hanya milik builtin).
 *
 * Klausa toggle (`field.text`) dikonsumsi buildPrompt di sini, BUKAN oleh renderer —
 * ToggleField yang diteruskan ke UI hanya { kind:'toggle', key, label, hint? }.
 */

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** empty: '', [], false, null/undefined (plan §1 when-evaluation). */
const isEmptyValue = (v: unknown): boolean =>
  v === '' || v === false || v == null || (Array.isArray(v) && v.length === 0);

/** Evaluator `when` tunggal — dipakai blok template, rules, dan visibleWhen. */
function evaluateWhen(when: When, state: DomainState): boolean {
  const v = state[when.field];
  switch (when.op) {
    case 'equals':
      return String(v) === when.value;
    case 'not-equals':
      return String(v) !== when.value;
    case 'in':
      return when.values.includes(String(v));
    case 'not-in':
      return !when.values.includes(String(v));
    case 'empty':
      return isEmptyValue(v);
    case 'not-empty':
      return !isEmptyValue(v);
    case 'contains':
      return Array.isArray(v) && v.includes(when.value);
    case 'not-contains':
      return !(Array.isArray(v) && v.includes(when.value));
  }
}

/** Select/chips: find by value, fallback catalog[0] — konvensi builtin. */
const findOption = (options: CatalogOption[], value: unknown): CatalogOption | undefined =>
  options.find(o => o.value === str(value)) ?? options[0];

/** CustomField → DomainField union (select/textarea/chips/toggle; visibleWhen dikompilasi). */
function toDomainField(field: CustomField): DomainField {
  const base = {
    key: field.key,
    label: field.label,
    ...(field.visibleWhen
      ? { visibleWhen: (state: DomainState) => evaluateWhen(field.visibleWhen as When, state) }
      : {}),
  };
  switch (field.kind) {
    case 'select':
      return { ...base, kind: 'select', options: field.options ?? [] };
    case 'textarea':
      return { ...base, kind: 'textarea', placeholder: field.placeholder ?? '' };
    case 'chips':
      return {
        ...base,
        kind: 'chips',
        options: field.options ?? [],
        ...(field.max !== undefined ? { max: field.max } : {}),
      };
    case 'toggle':
      // Klausa `text` TIDAK diteruskan — hanya untuk buildPrompt adapter.
      return { ...base, kind: 'toggle', ...(field.hint !== undefined ? { hint: field.hint } : {}) };
  }
}

/** Default createEmptyState per kind (plan §1). Array defaults are cloned —
 *  kalau tidak, semua empty state berbagi referensi array milik recipe. */
function fieldDefault(field: CustomField): unknown {
  if (field.default !== undefined) {
    return Array.isArray(field.default) ? [...field.default] : field.default;
  }
  switch (field.kind) {
    case 'select':
      return field.options?.[0]?.value ?? '';
    case 'textarea':
      return '';
    case 'chips':
      return [];
    case 'toggle':
      return false;
  }
}

/** Render satu field block → string, atau null bila blok diskip (kosong/off). */
function renderFieldValue(field: CustomField, separator: string | undefined, state: DomainState): string | null {
  const value = state[field.key];
  switch (field.kind) {
    case 'select': {
      const opt = findOption(field.options ?? [], value);
      return opt ? (opt.promptPhrase ?? opt.label) : null;
    }
    case 'textarea': {
      const text = str(value).trim();
      return text.length > 0 ? text : null;
    }
    case 'chips': {
      const values = Array.isArray(value) ? value : [];
      const phrases = values
        .map(v => (field.options ?? []).find(o => o.value === v))
        .filter((o): o is CatalogOption => Boolean(o))
        .map(o => o.promptPhrase ?? o.label);
      return phrases.length > 0 ? phrases.join(separator ?? ', ') : null;
    }
    case 'toggle':
      return value ? (field.text ?? null) : null;
  }
}

export function toDomainRecipe(recipe: CustomRecipe): DomainRecipe {
  const fieldByKey: Record<string, CustomField> = {};
  for (const section of recipe.sections) {
    for (const field of section.fields) fieldByKey[field.key] = field;
  }

  const sections: DomainSection[] = recipe.sections.map(section => ({
    id: section.id,
    title: section.title,
    fields: section.fields.map(toDomainField),
  }));

  return {
    id: recipe.id,
    label: recipe.label,
    icon: recipe.icon,
    tagline: recipe.tagline,
    referencePhoto: recipe.referencePhoto ?? false,
    referenceLabel: recipe.referenceLabel,
    referenceClause: recipe.referenceClause,
    presetProtectedKeys: recipe.presetProtectedKeys ?? [],
    sections,

    createEmptyState: (): DomainState => {
      const state: DomainState = {};
      for (const key of Object.keys(fieldByKey)) state[key] = fieldDefault(fieldByKey[key]);
      if (recipe.referencePhoto) state.hasReferencePhoto = true;
      return state;
    },

    buildPrompt: (state: DomainState): string => {
      const blocks: string[] = [];
      for (const block of recipe.template) {
        if (block.when && !evaluateWhen(block.when, state)) continue;
        if (block.kind === 'text') {
          blocks.push(block.text);
        } else if (block.kind === 'reference') {
          // Konvensi builtin: hasReferencePhoto !== false.
          if (recipe.referencePhoto && state.hasReferencePhoto !== false && recipe.referenceClause) {
            blocks.push(recipe.referenceClause);
          }
        } else {
          const field = fieldByKey[block.field];
          if (!field) continue;
          const rendered = renderFieldValue(field, block.separator, state);
          if (rendered === null) continue;
          blocks.push(`${block.prefix ?? ''}${rendered}${block.suffix ?? ''}`);
        }
      }
      return blocks.join('\n\n');
    },

    warnings: (state: DomainState): DomainWarning[] =>
      (recipe.rules ?? [])
        .filter(rule => evaluateWhen(rule.when, state))
        .map(rule => ({ sectionId: rule.sectionId, level: rule.level, text: rule.text })),
  };
}
