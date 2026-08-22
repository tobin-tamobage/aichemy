import type { CustomRecipe } from './types';

/**
 * validateRecipe — phase5 plan §1. Cek shape murni string (TIDAK pernah eval).
 * Mengembalikan { ok: true, recipe } atau { ok: false, errors } dengan path
 * human-readable, mis. `sections[1].fields[0].options: at least 1 option required`.
 */

export type ValidateResult = { ok: true; recipe: CustomRecipe } | { ok: false; errors: string[] };

const ID_RE = /^x-[a-z0-9][a-z0-9-]*$/;
const FIELD_KINDS: Record<string, true> = { select: true, textarea: true, chips: true, toggle: true };
const WHEN_OPS: Record<string, true> = {
  equals: true,
  'not-equals': true,
  in: true,
  'not-in': true,
  empty: true,
  'not-empty': true,
  contains: true,
  'not-contains': true,
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/** Cek struktur When + referensi field (bila fieldKeys tersedia). */
function checkWhen(when: unknown, path: string, fieldKeys: Set<string>, errors: string[]): void {
  if (!isObj(when)) {
    errors.push(`${path}: must be an object`);
    return;
  }
  if (!isNonEmptyStr(when.field)) {
    errors.push(`${path}.field: non-empty field key required`);
  } else if (!fieldKeys.has(when.field)) {
    errors.push(`${path}.field: unknown field key '${when.field}'`);
  }
  if (typeof when.op !== 'string' || !WHEN_OPS[when.op]) {
    errors.push(`${path}.op: unknown op '${String(when.op)}'`);
    return;
  }
  const op = when.op;
  if (op === 'equals' || op === 'not-equals' || op === 'contains' || op === 'not-contains') {
    if (typeof when.value !== 'string') errors.push(`${path}.value: string required for op '${op}'`);
  } else if (op === 'in' || op === 'not-in') {
    if (
      !Array.isArray(when.values) ||
      when.values.length < 1 ||
      !when.values.every(v => typeof v === 'string')
    ) {
      errors.push(`${path}.values: non-empty string array required for op '${op}'`);
    }
  }
  // empty/not-empty: tidak ada argumen tambahan
}

/** Cek struktur opsi katalog + keunikan value; mengembalikan nilai value untuk cek default. */
function checkOptions(
  options: unknown,
  path: string,
  errors: string[],
): Set<string> {
  const values = new Set<string>();
  if (!Array.isArray(options) || options.length < 1) {
    errors.push(`${path}: at least 1 option required`);
    return values;
  }
  options.forEach((opt, i) => {
    const p = `${path}[${i}]`;
    if (!isObj(opt)) {
      errors.push(`${p}: must be an object`);
      return;
    }
    if (!isNonEmptyStr(opt.value)) {
      errors.push(`${p}.value: non-empty string required`);
    } else if (values.has(opt.value)) {
      errors.push(`${p}.value: duplicate option value '${opt.value}'`);
    } else {
      values.add(opt.value);
    }
    if (!isNonEmptyStr(opt.label)) errors.push(`${p}.label: non-empty string required`);
    if (opt.promptPhrase !== undefined && typeof opt.promptPhrase !== 'string') {
      errors.push(`${p}.promptPhrase: must be a string`);
    }
    if (opt.image !== undefined && typeof opt.image !== 'string') {
      errors.push(`${p}.image: must be a string`);
    }
    if (opt.hint !== undefined && typeof opt.hint !== 'string') {
      errors.push(`${p}.hint: must be a string`);
    }
  });
  return values;
}

function checkField(
  field: unknown,
  path: string,
  fieldKeys: Set<string>,
  errors: string[],
): void {
  if (!isObj(field)) {
    errors.push(`${path}: must be an object`);
    return;
  }
  const keyValid = isNonEmptyStr(field.key);
  if (!keyValid) {
    errors.push(`${path}.key: non-empty string required`);
  } else if (fieldKeys.has(field.key as string)) {
    errors.push(`${path}.key: duplicate field key '${String(field.key)}'`);
  } else {
    fieldKeys.add(field.key as string);
  }
  if (!isNonEmptyStr(field.label)) errors.push(`${path}.label: non-empty string required`);
  const kind = field.kind;
  if (typeof kind !== 'string' || !FIELD_KINDS[kind]) {
    errors.push(`${path}.kind: must be one of select/textarea/chips/toggle`);
    return;
  }
  if (field.hint !== undefined && typeof field.hint !== 'string') {
    errors.push(`${path}.hint: must be a string`);
  }

  let optionValues: Set<string> | null = null;
  if (kind === 'select' || kind === 'chips') {
    optionValues = checkOptions(field.options, `${path}.options`, errors);
  }
  if (kind === 'chips' && field.max !== undefined) {
    if (typeof field.max !== 'number' || !Number.isInteger(field.max) || field.max < 1) {
      errors.push(`${path}.max: integer >= 1 required`);
    }
  }
  if (kind === 'textarea' && field.placeholder !== undefined && typeof field.placeholder !== 'string') {
    errors.push(`${path}.placeholder: must be a string`);
  }
  if (kind === 'toggle' && !isNonEmptyStr(field.text)) {
    errors.push(`${path}.text: toggle clause (non-empty string) required`);
  }

  // default harus cocok kind & (select/chips) ada di antara option values.
  if (field.default !== undefined) {
    const d = field.default;
    if (kind === 'select') {
      if (typeof d !== 'string') {
        errors.push(`${path}.default: must be an option value (string)`);
      } else if (optionValues && !optionValues.has(d)) {
        errors.push(`${path}.default: '${d}' is not one of the option values`);
      }
    } else if (kind === 'chips') {
      if (!Array.isArray(d) || !d.every(v => typeof v === 'string')) {
        errors.push(`${path}.default: must be an array of option values`);
      } else if (optionValues) {
        for (const v of d) {
          if (!optionValues.has(v)) {
            errors.push(`${path}.default: '${v}' is not one of the option values`);
          }
        }
      }
    } else if (kind === 'toggle') {
      if (typeof d !== 'boolean') errors.push(`${path}.default: must be a boolean`);
    } else {
      if (typeof d !== 'string') errors.push(`${path}.default: must be a string`);
    }
  }
}

function checkTemplate(
  template: unknown,
  fieldKeys: Set<string>,
  errors: string[],
): void {
  if (!Array.isArray(template) || template.length < 1) {
    errors.push(`template: at least 1 prompt block required`);
    return;
  }
  template.forEach((block, i) => {
    const p = `template[${i}]`;
    if (!isObj(block)) {
      errors.push(`${p}: must be an object`);
      return;
    }
    const kind = block.kind;
    if (kind === 'text') {
      if (!isNonEmptyStr(block.text)) errors.push(`${p}.text: non-empty string required`);
    } else if (kind === 'field') {
      if (!isNonEmptyStr(block.field)) {
        errors.push(`${p}.field: non-empty field key required`);
      } else if (!fieldKeys.has(block.field)) {
        errors.push(`${p}.field: unknown field key '${block.field}'`);
      }
      for (const prop of ['prefix', 'suffix', 'separator'] as const) {
        if (block[prop] !== undefined && typeof block[prop] !== 'string') {
          errors.push(`${p}.${prop}: must be a string`);
        }
      }
    } else if (kind !== 'reference') {
      errors.push(`${p}.kind: must be one of text/field/reference`);
    }
    if (block.when !== undefined) checkWhen(block.when, `${p}.when`, fieldKeys, errors);
  });
}

function checkRules(
  rules: unknown,
  sectionIds: Set<string>,
  fieldKeys: Set<string>,
  errors: string[],
): void {
  if (!Array.isArray(rules)) {
    errors.push(`rules: must be an array`);
    return;
  }
  rules.forEach((rule, i) => {
    const p = `rules[${i}]`;
    if (!isObj(rule)) {
      errors.push(`${p}: must be an object`);
      return;
    }
    if (!isNonEmptyStr(rule.id)) errors.push(`${p}.id: non-empty string required`);
    if (!isNonEmptyStr(rule.sectionId)) {
      errors.push(`${p}.sectionId: non-empty section id required`);
    } else if (!sectionIds.has(rule.sectionId)) {
      errors.push(`${p}.sectionId: unknown section id '${rule.sectionId}'`);
    }
    if (rule.level !== 'info' && rule.level !== 'warn') {
      errors.push(`${p}.level: must be 'info' or 'warn'`);
    }
    if (!isNonEmptyStr(rule.text)) errors.push(`${p}.text: non-empty string required`);
    checkWhen(rule.when, `${p}.when`, fieldKeys, errors);
  });
}

/**
 * Validasi JSON recipe custom. `builtinIds` = daftar id builtin (tabrakan ditolak).
 * Murni cek string/shape — tidak ada eval/Function.
 */
export function validateRecipe(json: unknown, builtinIds: string[]): ValidateResult {
  const errors: string[] = [];
  if (!isObj(json)) {
    return { ok: false, errors: ['recipe: must be a plain object'] };
  }

  if (json.recipeVersion !== 1) errors.push(`recipeVersion: must be 1`);

  if (!isNonEmptyStr(json.id)) {
    errors.push(`id: non-empty string required`);
  } else {
    if (!ID_RE.test(json.id)) {
      errors.push(`id: must match ^x-[a-z0-9][a-z0-9-]*$ (got '${json.id}')`);
    }
    if (builtinIds.includes(json.id)) {
      errors.push(`id: '${json.id}' collides with a builtin domain`);
    }
  }

  if (!isNonEmptyStr(json.label)) errors.push(`label: non-empty string required`);
  if (!isNonEmptyStr(json.icon)) errors.push(`icon: non-empty string (emoji) required`);
  if (!isNonEmptyStr(json.tagline)) errors.push(`tagline: non-empty string required`);

  if (json.referencePhoto !== undefined && typeof json.referencePhoto !== 'boolean') {
    errors.push(`referencePhoto: must be a boolean`);
  }
  if (json.referenceLabel !== undefined && typeof json.referenceLabel !== 'string') {
    errors.push(`referenceLabel: must be a string`);
  }
  if (json.referenceClause !== undefined && typeof json.referenceClause !== 'string') {
    errors.push(`referenceClause: must be a string`);
  }

  // --- Sections & fields (kumpulkan id/key untuk cek referensi) ---
  const sectionIds = new Set<string>();
  const fieldKeys = new Set<string>();
  const pendingWhens: Array<{ when: unknown; path: string }> = [];

  if (!Array.isArray(json.sections) || json.sections.length < 1) {
    errors.push(`sections: at least 1 section required`);
  } else {
    json.sections.forEach((section, si) => {
      const sp = `sections[${si}]`;
      if (!isObj(section)) {
        errors.push(`${sp}: must be an object`);
        return;
      }
      if (!isNonEmptyStr(section.id)) {
        errors.push(`${sp}.id: non-empty string required`);
      } else if (sectionIds.has(section.id)) {
        errors.push(`${sp}.id: duplicate section id '${section.id}'`);
      } else {
        sectionIds.add(section.id);
      }
      if (!isNonEmptyStr(section.title)) errors.push(`${sp}.title: non-empty string required`);
      if (!Array.isArray(section.fields) || section.fields.length < 1) {
        errors.push(`${sp}.fields: at least 1 field required`);
        return;
      }
      section.fields.forEach((field, fi) => {
        const fp = `${sp}.fields[${fi}]`;
        checkField(field, fp, fieldKeys, errors);
        if (isObj(field) && field.visibleWhen !== undefined) {
          pendingWhens.push({ when: field.visibleWhen, path: `${fp}.visibleWhen` });
        }
      });
    });
  }

  // --- Cek referensi when (field keys kini lengkap) ---
  for (const { when, path } of pendingWhens) checkWhen(when, path, fieldKeys, errors);

  checkTemplate(json.template, fieldKeys, errors);

  if (json.rules !== undefined) checkRules(json.rules, sectionIds, fieldKeys, errors);

  if (json.presetProtectedKeys !== undefined) {
    if (
      !Array.isArray(json.presetProtectedKeys) ||
      !json.presetProtectedKeys.every(k => typeof k === 'string')
    ) {
      errors.push(`presetProtectedKeys: must be an array of field keys`);
    } else {
      json.presetProtectedKeys.forEach((k, i) => {
        if (!fieldKeys.has(k)) {
          errors.push(`presetProtectedKeys[${i}]: unknown field key '${k}'`);
        }
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, recipe: json as unknown as CustomRecipe };
}
