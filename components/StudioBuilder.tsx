/**
 * StudioBuilder - visual editor for custom studio recipes (.nbrecipe)
 *
 * Full-screen modal (overlay pattern mirroring PresetLibraryModal) that builds
 * a CustomRecipe from pure form state: identity, reference photo, sections +
 * fields, prompt template blocks, smart rules, preset protected keys, and a
 * live default-prompt preview. Save upserts via saveCustomStudio (registry
 * wrapper, cache invalidated there); Export downloads the .nbrecipe JSON.
 *
 * Edit mode: pass initialRecipe to pre-fill; Save overwrites the same id and
 * the id-collision check excludes the recipe being edited.
 *
 * Out of scope (phase5 non-goals): drag-drop (up/down buttons), interactive
 * preview form (preview uses defaults only), visual field kind, code editing.
 */

import React, { useMemo, useState } from 'react';
import {
  X, Plus, Trash2, ArrowUp, ArrowDown, Save, FileDown, AlertCircle, Wand2,
} from 'lucide-react';
import type {
  CatalogOption, CustomField, CustomFieldKind, CustomRecipe, PromptBlock, When,
} from '../domains/custom/types';
import { validateRecipe } from '../domains/custom/validate';
import { toDomainRecipe } from '../domains/custom/toDomainRecipe';
import { DOMAINS, listCustomRecipes, saveCustomStudio } from '../domains';
import { downloadTextFile } from '../services/browserStorage';

// ---------- draft model (editable mirror of CustomRecipe) ----------

type WhenOp = When['op'];

/** Editor form of a When clause: `value` holds the single value, or a
 *  comma-separated list for in/not-in (parsed to string[] at build time). */
interface DraftWhen {
  field: string;
  op: WhenOp;
  value: string;
}

interface DraftOption {
  uid: string;
  value: string;
  label: string;
  promptPhrase: string;
}

interface DraftField {
  uid: string;
  key: string;
  label: string;
  kind: CustomFieldKind;
  options: DraftOption[];
  placeholder: string; // textarea
  maxText: string; // chips, '' = unset
  text: string; // toggle clause
  hint: string; // preserved from import; no editor UI (plan step 3)
  defaultSelect: string; // '' = fall back to first option
  defaultChips: string[];
  defaultToggle: boolean;
}

interface DraftSection {
  uid: string;
  id: string;
  title: string;
  fields: DraftField[];
}

type DraftBlock =
  | { uid: string; kind: 'text'; text: string; when: DraftWhen | null }
  | { uid: string; kind: 'field'; field: string; prefix: string; suffix: string; separator: string; when: DraftWhen | null }
  | { uid: string; kind: 'reference'; when: DraftWhen | null };

interface DraftRule {
  uid: string;
  id: string; // preserved from import; '' → generated r{N} at build
  sectionId: string;
  level: 'info' | 'warn';
  when: DraftWhen;
  text: string;
}

interface Draft {
  label: string;
  tagline: string;
  icon: string;
  id: string;
  referencePhoto: boolean;
  referenceLabel: string;
  referenceClause: string;
  sections: DraftSection[];
  blocks: DraftBlock[];
  rules: DraftRule[];
  protectedKeys: string[];
}

// ---------- helpers ----------

let uidCounter = 0;
const uid = () => `u${++uidCounter}`;

const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');

const autoStudioId = (label: string): string => `x-${slugify(label)}`;

const ID_RE = /^x-[a-z0-9][a-z0-9-]*$/;

const newOption = (): DraftOption => ({ uid: uid(), value: '', label: '', promptPhrase: '' });

const newField = (kind: CustomFieldKind): DraftField => ({
  uid: uid(),
  key: '',
  label: '',
  kind,
  options: kind === 'select' || kind === 'chips' ? [newOption()] : [],
  placeholder: '',
  maxText: '',
  text: '',
  hint: '',
  defaultSelect: '',
  defaultChips: [],
  defaultToggle: false,
});

const newSection = (): DraftSection => ({ uid: uid(), id: '', title: '', fields: [] });

const emptyDraft = (): Draft => ({
  label: '',
  tagline: '',
  icon: '',
  id: 'x-',
  referencePhoto: false,
  referenceLabel: '',
  referenceClause: '',
  sections: [newSection()],
  blocks: [],
  rules: [],
  protectedKeys: [],
});

function whenToDraft(when: When): DraftWhen {
  switch (when.op) {
    case 'in':
    case 'not-in':
      return { field: when.field, op: when.op, value: when.values.join(', ') };
    case 'empty':
    case 'not-empty':
      return { field: when.field, op: when.op, value: '' };
    default:
      return { field: when.field, op: when.op, value: when.value };
  }
}

function draftFromRecipe(recipe: CustomRecipe): Draft {
  return {
    label: recipe.label,
    tagline: recipe.tagline,
    icon: recipe.icon,
    id: recipe.id,
    referencePhoto: recipe.referencePhoto ?? false,
    referenceLabel: recipe.referenceLabel ?? '',
    referenceClause: recipe.referenceClause ?? '',
    sections: recipe.sections.map(s => ({
      uid: uid(),
      id: s.id,
      title: s.title,
      fields: s.fields.map(f => ({
        uid: uid(),
        key: f.key,
        label: f.label,
        kind: f.kind,
        options: (f.options ?? []).map(o => ({
          uid: uid(),
          value: o.value,
          label: o.label,
          promptPhrase: o.promptPhrase ?? '',
        })),
        placeholder: f.placeholder ?? '',
        maxText: f.max !== undefined ? String(f.max) : '',
        text: f.text ?? '',
        hint: f.hint ?? '',
        defaultSelect: f.kind === 'select' && typeof f.default === 'string' ? f.default : '',
        defaultChips: f.kind === 'chips' && Array.isArray(f.default)
          ? (f.default as unknown[]).filter((v): v is string => typeof v === 'string')
          : [],
        defaultToggle: f.default === true,
      })),
    })),
    blocks: recipe.template.map((b): DraftBlock => {
      if (b.kind === 'text') {
        return { uid: uid(), kind: 'text', text: b.text, when: b.when ? whenToDraft(b.when) : null };
      }
      if (b.kind === 'reference') {
        return { uid: uid(), kind: 'reference', when: b.when ? whenToDraft(b.when) : null };
      }
      return {
        uid: uid(),
        kind: 'field',
        field: b.field,
        prefix: b.prefix ?? '',
        suffix: b.suffix ?? '',
        separator: b.separator ?? '',
        when: b.when ? whenToDraft(b.when) : null,
      };
    }),
    rules: (recipe.rules ?? []).map(r => ({
      uid: uid(),
      id: r.id,
      sectionId: r.sectionId,
      level: r.level,
      when: whenToDraft(r.when),
      text: r.text,
    })),
    protectedKeys: [...(recipe.presetProtectedKeys ?? [])],
  };
}

function compileWhen(w: DraftWhen): When {
  if (w.op === 'empty' || w.op === 'not-empty') return { field: w.field, op: w.op };
  if (w.op === 'in' || w.op === 'not-in') {
    return {
      field: w.field,
      op: w.op,
      values: w.value.split(',').map(s => s.trim()).filter(Boolean),
    };
  }
  return { field: w.field, op: w.op, value: w.value };
}

/** Draft → CustomRecipe JSON. Empty optional strings are omitted so builder
 *  output round-trips to the plan §1 golden shape (prefix/suffix kept verbatim
 *  — leading/trailing spaces are meaningful). */
function buildRecipe(draft: Draft): CustomRecipe {
  const sections = draft.sections.map(s => ({
    id: s.id.trim(),
    title: s.title,
    fields: s.fields.map(f => {
      const field: CustomField = { key: f.key.trim(), label: f.label, kind: f.kind };
      if (f.kind === 'select' || f.kind === 'chips') {
        field.options = f.options.map(o => {
          const opt: CatalogOption = { value: o.value.trim(), label: o.label };
          if (o.promptPhrase.trim()) opt.promptPhrase = o.promptPhrase;
          return opt;
        });
        if (f.kind === 'select' && f.defaultSelect) field.default = f.defaultSelect;
        if (f.kind === 'chips') {
          if (f.maxText.trim() !== '') {
            const n = Number.parseInt(f.maxText, 10);
            if (!Number.isNaN(n)) field.max = n; // validator flags < 1
          }
          if (f.defaultChips.length > 0) field.default = [...f.defaultChips];
        }
      }
      if (f.kind === 'textarea' && f.placeholder.trim()) field.placeholder = f.placeholder;
      if (f.kind === 'toggle') {
        field.text = f.text;
        if (f.defaultToggle) field.default = true;
      }
      if (f.hint.trim()) field.hint = f.hint;
      return field;
    }),
  }));

  const template: PromptBlock[] = draft.blocks.map((b): PromptBlock => {
    const when = b.when ? compileWhen(b.when) : undefined;
    if (b.kind === 'text') {
      return when ? { kind: 'text', text: b.text, when } : { kind: 'text', text: b.text };
    }
    if (b.kind === 'reference') {
      return when ? { kind: 'reference', when } : { kind: 'reference' };
    }
    const block: { kind: 'field'; field: string; prefix?: string; suffix?: string; separator?: string; when?: When } =
      { kind: 'field', field: b.field };
    if (b.prefix !== '') block.prefix = b.prefix;
    if (b.suffix !== '') block.suffix = b.suffix;
    if (b.separator !== '') block.separator = b.separator;
    if (when) block.when = when;
    return block;
  });

  const recipe: CustomRecipe = {
    recipeVersion: 1,
    id: draft.id.trim(),
    label: draft.label,
    icon: draft.icon,
    tagline: draft.tagline,
    sections,
    template,
  };
  if (draft.referencePhoto) {
    recipe.referencePhoto = true;
    if (draft.referenceLabel.trim()) recipe.referenceLabel = draft.referenceLabel;
    if (draft.referenceClause.trim()) recipe.referenceClause = draft.referenceClause;
    // clause empty → omitted → validator reports "required when referencePhoto is true"
  }
  if (draft.rules.length > 0) {
    recipe.rules = draft.rules.map((r, i) => ({
      id: r.id.trim() || `r${i + 1}`,
      sectionId: r.sectionId,
      level: r.level,
      when: compileWhen(r.when),
      text: r.text,
    }));
  }
  const definedKeys = new Set(draft.sections.flatMap(s => s.fields.map(f => f.key.trim())));
  const protectedKeys = draft.protectedKeys.filter(k => definedKeys.has(k));
  if (protectedKeys.length > 0) recipe.presetProtectedKeys = protectedKeys;
  return recipe;
}

// ---------- when-op metadata ----------

const OPS_BASE: WhenOp[] = ['equals', 'not-equals', 'empty', 'not-empty'];
const OPS_SELECT: WhenOp[] = [...OPS_BASE, 'in', 'not-in'];
const OPS_CHIPS: WhenOp[] = [...OPS_BASE, 'contains', 'not-contains'];

/** Ops valid for the chosen field's kind (plan Task 3 Step 2). */
function opsForKind(kind: CustomFieldKind | undefined): WhenOp[] {
  if (kind === 'select') return OPS_SELECT;
  if (kind === 'chips') return OPS_CHIPS;
  return OPS_BASE;
}

const OP_LABELS: Record<WhenOp, string> = {
  equals: 'equals',
  'not-equals': 'not equals',
  in: 'in',
  'not-in': 'not in',
  empty: 'is empty',
  'not-empty': 'is not empty',
  contains: 'contains',
  'not-contains': 'does not contain',
};

// ---------- shared styling ----------

const inputCls =
  'w-full bg-base border border-line rounded-md px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-accent/50 placeholder:text-dim';
const inputSmCls =
  'bg-base border border-line rounded-md px-2 py-1 text-xs text-ink focus:outline-none focus:border-accent/50 placeholder:text-dim';
const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-dim mb-1';
const badgeCls =
  'px-2 py-1 border border-line rounded-sm text-[9px] font-bold uppercase tracking-widest text-accent2 whitespace-nowrap';
const addBtnCls =
  'inline-flex items-center gap-1 px-2.5 py-1 border border-dashed border-line rounded-md text-[10px] font-bold uppercase tracking-wider text-dim hover:text-accent hover:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const iconBtnCls =
  'p-1.5 rounded-sm text-dim hover:text-ink hover:bg-surface2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed';
const dangerIconBtnCls =
  'p-1.5 rounded-sm text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors';

/** Section heading inside the builder. */
const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs font-bold text-dim uppercase tracking-wider mb-3">{children}</h3>
);

/** Token-styled checkbox row (mirrors ToggleFieldControl's checkbox visual). */
const CheckRow: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled }) => (
  <label
    className={`flex items-center gap-2 select-none px-1 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group'}`}
    onClick={disabled ? undefined : () => onChange(!checked)}
  >
    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
      checked ? 'bg-accent border-accent' : 'border-line bg-surface group-hover:border-dim'
    }`}>
      {checked && (
        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6l3 3 5-5" />
        </svg>
      )}
    </div>
    <span className={`text-xs font-medium tracking-wide ${checked ? 'text-ink' : 'text-dim group-hover:text-ink'}`}>
      {label}
    </span>
  </label>
);

// ---------- when editor (shared by template blocks and smart rules) ----------

interface WhenEditorProps {
  /** All currently defined fields (key may be ''/duplicate while typing). */
  fields: DraftField[];
  value: DraftWhen | null;
  onChange: (next: DraftWhen | null) => void;
  /** Rules require a when — hides the empty state and the clear button. */
  required?: boolean;
}

const WhenEditor: React.FC<WhenEditorProps> = ({ fields, value, onChange, required }) => {
  if (!value) {
    if (required) return null;
    return (
      <button
        type="button"
        onClick={() => onChange({ field: fields[0]?.key ?? '', op: 'equals', value: '' })}
        disabled={fields.length === 0}
        title={fields.length === 0 ? 'Define a field first' : 'Add a visibility/activation condition'}
        className="text-[10px] font-bold uppercase tracking-wider text-dim hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Add condition
      </button>
    );
  }

  const field = fields.find(f => f.key === value.field && f.key !== '');
  const ops = opsForKind(field?.kind);
  const needsValue = value.op !== 'empty' && value.op !== 'not-empty';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-widest text-dim">When</span>
      <select
        value={value.field}
        onChange={e => {
          const nextField = fields.find(f => f.key === e.target.value && f.key !== '');
          const nextOps = opsForKind(nextField?.kind);
          onChange({
            field: e.target.value,
            op: nextOps.includes(value.op) ? value.op : 'equals',
            value: value.value,
          });
        }}
        className={inputSmCls}
        aria-label="Condition field"
      >
        {fields.map(f => (
          <option key={f.uid} value={f.key}>{f.label || f.key || '(unnamed field)'}</option>
        ))}
        {!field && value.field && <option value={value.field}>{value.field} (missing)</option>}
      </select>
      <select
        value={value.op}
        onChange={e => onChange({ ...value, op: e.target.value as WhenOp })}
        className={inputSmCls}
        aria-label="Condition operator"
      >
        {(ops.includes(value.op) ? ops : [...ops, value.op]).map(op => (
          <option key={op} value={op}>{OP_LABELS[op]}</option>
        ))}
      </select>
      {needsValue && (
        <input
          type="text"
          value={value.value}
          onChange={e => onChange({ ...value, value: e.target.value })}
          placeholder={value.op === 'in' || value.op === 'not-in' ? 'value1, value2, …' : 'value'}
          className={`${inputSmCls} w-44 font-mono`}
          aria-label="Condition value"
        />
      )}
      {!required && (
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Clear condition"
          aria-label="Clear condition"
          className={dangerIconBtnCls}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// ---------- main component ----------

export interface StudioBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful save — parent bumps the registry version and closes. */
  onSaved: () => void;
  /** Edit mode: pre-fill from this recipe; Save overwrites the same id. */
  initialRecipe?: CustomRecipe | null;
}

export const StudioBuilder: React.FC<StudioBuilderProps> = (props) => {
  if (!props.isOpen) return null;
  // key remounts the form when switching between create/edit targets → fresh state per open.
  return <BuilderForm key={props.initialRecipe?.id ?? 'new'} {...props} />;
};

const BuilderForm: React.FC<StudioBuilderProps> = ({ onClose, onSaved, initialRecipe }) => {
  const [draft, setDraft] = useState<Draft>(() =>
    initialRecipe ? draftFromRecipe(initialRecipe) : emptyDraft(),
  );
  const isEdit = Boolean(initialRecipe);

  /** Builtin ids + other custom ids (own id excluded in edit mode). */
  const collisionIds = useMemo(
    () => [
      ...DOMAINS.map(d => d.id),
      ...listCustomRecipes().filter(r => r.id !== initialRecipe?.id).map(r => r.id),
    ],
    [initialRecipe],
  );

  const allFields = useMemo(() => draft.sections.flatMap(s => s.fields), [draft.sections]);

  /** Build → validate → (ok) adapt → default prompt. Single source for the
   *  preview pane, the error list, and the Save/Export disabled state. */
  const built = useMemo(() => {
    const recipe = buildRecipe(draft);
    const result = validateRecipe(recipe, collisionIds);
    if (!result.ok) {
      return { ok: false as const, recipe, errors: result.errors, prompt: '' };
    }
    const domain = toDomainRecipe(result.recipe);
    return {
      ok: true as const,
      recipe: result.recipe,
      errors: [] as string[],
      prompt: domain.buildPrompt(domain.createEmptyState()),
    };
  }, [draft, collisionIds]);

  const idFormatOk = ID_RE.test(draft.id);

  // --- identity handlers (id auto-derives from label until manually edited) ---

  const setLabel = (label: string) => setDraft(d => {
    const wasAuto = d.id === autoStudioId(d.label) || d.id === '' || d.id === 'x-';
    return { ...d, label, id: wasAuto ? autoStudioId(label) : d.id };
  });

  // --- section / field updaters ---

  const updateSection = (sectionUid: string, patch: Partial<Omit<DraftSection, 'uid' | 'fields'>>) =>
    setDraft(d => ({
      ...d,
      sections: d.sections.map(s => (s.uid === sectionUid ? { ...s, ...patch } : s)),
    }));

  const setSectionTitle = (section: DraftSection, title: string) => {
    const wasAuto = section.id === slugify(section.title) || section.id === '';
    updateSection(section.uid, { title, id: wasAuto ? slugify(title) : section.id });
  };

  const addSection = () => setDraft(d => ({ ...d, sections: [...d.sections, newSection()] }));

  const removeSection = (sectionUid: string) =>
    setDraft(d => ({ ...d, sections: d.sections.filter(s => s.uid !== sectionUid) }));

  const updateField = (sectionUid: string, fieldUid: string, patch: Partial<Omit<DraftField, 'uid'>>) =>
    setDraft(d => ({
      ...d,
      sections: d.sections.map(s =>
        s.uid === sectionUid
          ? { ...s, fields: s.fields.map(f => (f.uid === fieldUid ? { ...f, ...patch } : f)) }
          : s,
      ),
    }));

  const setFieldLabel = (sectionUid: string, field: DraftField, label: string) => {
    const wasAuto = field.key === slugify(field.label) || field.key === '';
    updateField(sectionUid, field.uid, { label, key: wasAuto ? slugify(label) : field.key });
  };

  const addFieldTo = (sectionUid: string, kind: CustomFieldKind) =>
    setDraft(d => ({
      ...d,
      sections: d.sections.map(s =>
        s.uid === sectionUid ? { ...s, fields: [...s.fields, newField(kind)] } : s,
      ),
    }));

  const removeField = (sectionUid: string, fieldUid: string) =>
    setDraft(d => ({
      ...d,
      sections: d.sections.map(s =>
        s.uid === sectionUid ? { ...s, fields: s.fields.filter(f => f.uid !== fieldUid) } : s,
      ),
    }));

  const updateOption = (sectionUid: string, fieldUid: string, optionUid: string, patch: Partial<Omit<DraftOption, 'uid'>>) =>
    setDraft(d => ({
      ...d,
      sections: d.sections.map(s =>
        s.uid === sectionUid
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.uid === fieldUid
                  ? { ...f, options: f.options.map(o => (o.uid === optionUid ? { ...o, ...patch } : o)) }
                  : f,
              ),
            }
          : s,
      ),
    }));

  const setOptionLabel = (sectionUid: string, fieldUid: string, opt: DraftOption, label: string) => {
    const wasAuto = opt.value === slugify(opt.label) || opt.value === '';
    updateOption(sectionUid, fieldUid, opt.uid, { label, value: wasAuto ? slugify(label) : opt.value });
  };

  const addOptionTo = (sectionUid: string, fieldUid: string) =>
    setDraft(d => ({
      ...d,
      sections: d.sections.map(s =>
        s.uid === sectionUid
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.uid === fieldUid ? { ...f, options: [...f.options, newOption()] } : f,
              ),
            }
          : s,
      ),
    }));

  const removeOption = (sectionUid: string, fieldUid: string, optionUid: string) =>
    setDraft(d => ({
      ...d,
      sections: d.sections.map(s =>
        s.uid === sectionUid
          ? {
              ...s,
              fields: s.fields.map(f =>
                f.uid === fieldUid ? { ...f, options: f.options.filter(o => o.uid !== optionUid) } : f,
              ),
            }
          : s,
      ),
    }));

  // --- template block updaters ---

  const updateBlock = (blockUid: string, updater: (b: DraftBlock) => DraftBlock) =>
    setDraft(d => ({ ...d, blocks: d.blocks.map(b => (b.uid === blockUid ? updater(b) : b)) }));

  const addBlock = (kind: DraftBlock['kind']) =>
    setDraft(d => {
      const firstKey = d.sections.flatMap(s => s.fields)[0]?.key ?? '';
      const block: DraftBlock =
        kind === 'text'
          ? { uid: uid(), kind: 'text', text: '', when: null }
          : kind === 'reference'
            ? { uid: uid(), kind: 'reference', when: null }
            : { uid: uid(), kind: 'field', field: firstKey, prefix: '', suffix: '', separator: '', when: null };
      return { ...d, blocks: [...d.blocks, block] };
    });

  const removeBlock = (blockUid: string) =>
    setDraft(d => ({ ...d, blocks: d.blocks.filter(b => b.uid !== blockUid) }));

  const moveBlock = (index: number, dir: -1 | 1) =>
    setDraft(d => {
      const j = index + dir;
      if (j < 0 || j >= d.blocks.length) return d;
      const blocks = [...d.blocks];
      [blocks[index], blocks[j]] = [blocks[j], blocks[index]];
      return { ...d, blocks };
    });

  // --- rule updaters ---

  const updateRule = (ruleUid: string, patch: Partial<Omit<DraftRule, 'uid'>>) =>
    setDraft(d => ({ ...d, rules: d.rules.map(r => (r.uid === ruleUid ? { ...r, ...patch } : r)) }));

  const addRule = () =>
    setDraft(d => {
      const firstSection = d.sections[0]?.id ?? '';
      const firstKey = d.sections.flatMap(s => s.fields)[0]?.key ?? '';
      return {
        ...d,
        rules: [
          ...d.rules,
          { uid: uid(), id: '', sectionId: firstSection, level: 'warn', when: { field: firstKey, op: 'equals', value: '' }, text: '' },
        ],
      };
    });

  const removeRule = (ruleUid: string) =>
    setDraft(d => ({ ...d, rules: d.rules.filter(r => r.uid !== ruleUid) }));

  // --- protected keys ---

  const toggleProtectedKey = (key: string, checked: boolean) =>
    setDraft(d => ({
      ...d,
      protectedKeys: checked
        ? [...d.protectedKeys, key]
        : d.protectedKeys.filter(k => k !== key),
    }));

  // --- footer actions ---

  const handleSave = () => {
    if (!built.ok) return;
    if (saveCustomStudio(built.recipe)) {
      onSaved();
    } else {
      window.alert('Failed to save studio (browser storage unavailable).');
    }
  };

  const handleExport = () => {
    if (!built.ok) return;
    downloadTextFile(`${draft.id.trim()}.nbrecipe`, JSON.stringify(built.recipe, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-base border border-line rounded-card shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2 text-accent2 min-w-0">
            <Wand2 className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-lg font-black tracking-widest uppercase">
              {isEdit ? 'Edit Studio' : 'Studio Builder'}
            </h2>
            {draft.label.trim() && (
              <span className="px-2 py-0.5 border border-line rounded-full text-[9px] font-bold uppercase tracking-wider text-dim truncate">
                {draft.icon} {draft.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            title="Close studio builder"
            aria-label="Close studio builder"
            className="p-2 hover:bg-surface2 rounded-full transition-colors text-dim hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* 1. Identity */}
          <div>
            <SectionHeading>Identity</SectionHeading>
            <div className="grid sm:grid-cols-[1fr_6rem] gap-3">
              <div>
                <label className={labelCls} htmlFor="sb-label">Studio label</label>
                <input
                  id="sb-label"
                  type="text"
                  value={draft.label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. Pet Portraits"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="sb-icon">Icon (emoji)</label>
                <input
                  id="sb-icon"
                  type="text"
                  value={draft.icon}
                  onChange={e => setDraft(d => ({ ...d, icon: e.target.value }))}
                  placeholder="🐾"
                  className={`${inputCls} text-center`}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className={labelCls} htmlFor="sb-tagline">Tagline</label>
                <input
                  id="sb-tagline"
                  type="text"
                  value={draft.tagline}
                  onChange={e => setDraft(d => ({ ...d, tagline: e.target.value }))}
                  placeholder="One-line description shown on the recipe card"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="sb-id">Studio id</label>
                <input
                  id="sb-id"
                  type="text"
                  value={draft.id}
                  onChange={e => setDraft(d => ({ ...d, id: e.target.value }))}
                  className={`${inputCls} font-mono text-xs ${idFormatOk ? '' : 'border-danger'}`}
                  aria-invalid={!idFormatOk}
                />
                {!idFormatOk && (
                  <p className="text-[10px] text-danger mt-1">
                    Must be x- + lowercase slug, e.g. x-pet-portraits.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Reference photo */}
          <div>
            <SectionHeading>Reference Photo</SectionHeading>
            <CheckRow
              checked={draft.referencePhoto}
              onChange={v => setDraft(d => ({ ...d, referencePhoto: v }))}
              label="This studio uses a reference photo"
            />
            {draft.referencePhoto && (
              <div className="grid gap-3 mt-3">
                <div>
                  <label className={labelCls} htmlFor="sb-reflabel">Reference label</label>
                  <input
                    id="sb-reflabel"
                    type="text"
                    value={draft.referenceLabel}
                    onChange={e => setDraft(d => ({ ...d, referenceLabel: e.target.value }))}
                    placeholder="e.g. Pet photo"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="sb-refclause">Reference clause (required)</label>
                  <textarea
                    id="sb-refclause"
                    value={draft.referenceClause}
                    onChange={e => setDraft(d => ({ ...d, referenceClause: e.target.value }))}
                    placeholder="Sentence appended to the prompt when a reference photo is set"
                    rows={2}
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Sections & fields */}
          <div>
            <SectionHeading>Sections &amp; Fields</SectionHeading>
            <div className="space-y-3">
              {draft.sections.map((section) => (
                <div key={section.uid} className="bg-surface/40 p-4 rounded-lg border border-line/50 space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className={labelCls}>Section title</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={e => setSectionTitle(section, e.target.value)}
                        placeholder="e.g. Subject"
                        className={inputCls}
                        aria-label="Section title"
                      />
                    </div>
                    <div className="w-40">
                      <label className={labelCls}>Section id</label>
                      <input
                        type="text"
                        value={section.id}
                        onChange={e => updateSection(section.uid, { id: e.target.value })}
                        className={`${inputCls} font-mono text-xs`}
                        aria-label="Section id"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(section.uid)}
                      title="Remove section"
                      aria-label="Remove section"
                      className={dangerIconBtnCls}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {section.fields.map((field) => (
                    <div key={field.uid} className="border border-line/60 rounded-md p-3 space-y-2 bg-base/40">
                      <div className="flex items-end gap-2">
                        <span className={badgeCls}>{field.kind}</span>
                        <div className="flex-1">
                          <label className={labelCls}>Field label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={e => setFieldLabel(section.uid, field, e.target.value)}
                            placeholder="e.g. Species"
                            className={inputCls}
                            aria-label="Field label"
                          />
                        </div>
                        <div className="w-36">
                          <label className={labelCls}>Key</label>
                          <input
                            type="text"
                            value={field.key}
                            onChange={e => updateField(section.uid, field.uid, { key: e.target.value })}
                            className={`${inputCls} font-mono text-xs`}
                            aria-label="Field key"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeField(section.uid, field.uid)}
                          title="Remove field"
                          aria-label="Remove field"
                          className={dangerIconBtnCls}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* options editor (select/chips) */}
                      {(field.kind === 'select' || field.kind === 'chips') && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-dim">Options</div>
                          {field.options.map((opt) => (
                            <div key={opt.uid} className="border border-line/40 rounded-md p-2 space-y-1.5 bg-base/60">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={e => setOptionLabel(section.uid, field.uid, opt, e.target.value)}
                                  placeholder="Label"
                                  className={`${inputSmCls} flex-1`}
                                  aria-label="Option label"
                                />
                                <input
                                  type="text"
                                  value={opt.value}
                                  onChange={e => updateOption(section.uid, field.uid, opt.uid, { value: e.target.value })}
                                  placeholder="value"
                                  className={`${inputSmCls} w-36 font-mono`}
                                  aria-label="Option value"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(section.uid, field.uid, opt.uid)}
                                  title="Remove option"
                                  aria-label="Remove option"
                                  className={dangerIconBtnCls}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <textarea
                                value={opt.promptPhrase}
                                onChange={e => updateOption(section.uid, field.uid, opt.uid, { promptPhrase: e.target.value })}
                                placeholder="Prompt phrase (optional — used in the prompt instead of the label)"
                                rows={1}
                                className={`${inputCls} text-xs font-mono`}
                                aria-label="Option prompt phrase"
                              />
                            </div>
                          ))}
                          <button type="button" onClick={() => addOptionTo(section.uid, field.uid)} className={addBtnCls}>
                            <Plus className="w-3 h-3" /> Add option
                          </button>
                        </div>
                      )}

                      {/* per-kind extras */}
                      {field.kind === 'textarea' && (
                        <div>
                          <label className={labelCls}>Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={e => updateField(section.uid, field.uid, { placeholder: e.target.value })}
                            placeholder="e.g. a tiny admiral's uniform with gold epaulettes"
                            className={inputCls}
                          />
                        </div>
                      )}
                      {field.kind === 'toggle' && (
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex-1 min-w-48">
                            <label className={labelCls}>Clause when on (required)</label>
                            <input
                              type="text"
                              value={field.text}
                              onChange={e => updateField(section.uid, field.uid, { text: e.target.value })}
                              placeholder="e.g. wearing a small ornate golden crown"
                              className={inputCls}
                            />
                          </div>
                          <CheckRow
                            checked={field.defaultToggle}
                            onChange={v => updateField(section.uid, field.uid, { defaultToggle: v })}
                            label="On by default"
                          />
                        </div>
                      )}
                      {field.kind === 'chips' && (
                        <div className="w-36">
                          <label className={labelCls}>Max selections</label>
                          <input
                            type="number"
                            min={1}
                            value={field.maxText}
                            onChange={e => updateField(section.uid, field.uid, { maxText: e.target.value })}
                            placeholder="No limit"
                            className={inputCls}
                          />
                        </div>
                      )}

                      {/* default picker (select/chips, from currently defined options) */}
                      {field.kind === 'select' && field.options.length > 0 && (
                        <div className="w-56">
                          <label className={labelCls}>Default</label>
                          <select
                            value={field.defaultSelect}
                            onChange={e => updateField(section.uid, field.uid, { defaultSelect: e.target.value })}
                            className={inputCls}
                            aria-label="Default option"
                          >
                            <option value="">First option</option>
                            {field.options.map(o => (
                              <option key={o.uid} value={o.value}>{o.label || o.value || '(unnamed)'}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {field.kind === 'chips' && field.options.length > 0 && (
                        <div>
                          <div className={labelCls}>Default selected</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {field.options.map(o => (
                              <CheckRow
                                key={o.uid}
                                checked={field.defaultChips.includes(o.value)}
                                onChange={v =>
                                  updateField(section.uid, field.uid, {
                                    defaultChips: v
                                      ? [...field.defaultChips, o.value]
                                      : field.defaultChips.filter(x => x !== o.value),
                                  })
                                }
                                label={o.label || o.value || '(unnamed)'}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <select
                    value=""
                    onChange={e => {
                      const kind = e.target.value as CustomFieldKind | '';
                      if (kind) addFieldTo(section.uid, kind);
                    }}
                    className={`${inputSmCls} w-auto`}
                    aria-label="Add field — pick a kind"
                  >
                    <option value="">+ Add field…</option>
                    <option value="select">Select</option>
                    <option value="textarea">Textarea</option>
                    <option value="chips">Chips</option>
                    <option value="toggle">Toggle</option>
                  </select>
                </div>
              ))}
            </div>
            <button type="button" onClick={addSection} className={`${addBtnCls} mt-3`}>
              <Plus className="w-3 h-3" /> Add section
            </button>
          </div>

          {/* 4. Prompt template */}
          <div>
            <SectionHeading>Prompt Template</SectionHeading>
            <div className="space-y-2">
              {draft.blocks.map((block, bi) => (
                <div key={block.uid} className="border border-line/60 rounded-md p-3 space-y-2 bg-surface/40">
                  <div className="flex items-center gap-1">
                    <span className={badgeCls}>{block.kind}</span>
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => moveBlock(bi, -1)}
                      disabled={bi === 0}
                      title="Move block up"
                      aria-label="Move block up"
                      className={iconBtnCls}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(bi, 1)}
                      disabled={bi === draft.blocks.length - 1}
                      title="Move block down"
                      aria-label="Move block down"
                      className={iconBtnCls}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.uid)}
                      title="Delete block"
                      aria-label="Delete block"
                      className={dangerIconBtnCls}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {block.kind === 'text' && (
                    <textarea
                      value={block.text}
                      onChange={e => updateBlock(block.uid, b => (b.kind === 'text' ? { ...b, text: e.target.value } : b))}
                      placeholder="Literal paragraph added to the prompt"
                      rows={2}
                      className={inputCls}
                      aria-label="Text block content"
                    />
                  )}
                  {block.kind === 'field' && (
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Field</label>
                        <select
                          value={block.field}
                          onChange={e => updateBlock(block.uid, b => (b.kind === 'field' ? { ...b, field: e.target.value } : b))}
                          className={inputCls}
                          aria-label="Block field"
                        >
                          {allFields.map(f => (
                            <option key={f.uid} value={f.key}>{f.label || f.key || '(unnamed field)'}</option>
                          ))}
                          {!allFields.some(f => f.key === block.field && f.key !== '') && block.field && (
                            <option value={block.field}>{block.field} (missing)</option>
                          )}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelCls}>Prefix</label>
                          <input
                            type="text"
                            value={block.prefix}
                            onChange={e => updateBlock(block.uid, b => (b.kind === 'field' ? { ...b, prefix: e.target.value } : b))}
                            placeholder="A portrait of "
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Suffix</label>
                          <input
                            type="text"
                            value={block.suffix}
                            onChange={e => updateBlock(block.uid, b => (b.kind === 'field' ? { ...b, suffix: e.target.value } : b))}
                            placeholder="."
                            className={inputCls}
                          />
                        </div>
                      </div>
                      {allFields.find(f => f.key === block.field)?.kind === 'chips' && (
                        <div className="sm:col-span-2 w-56">
                          <label className={labelCls}>Separator (chips join)</label>
                          <input
                            type="text"
                            value={block.separator}
                            onChange={e => updateBlock(block.uid, b => (b.kind === 'field' ? { ...b, separator: e.target.value } : b))}
                            placeholder=", "
                            className={`${inputCls} font-mono text-xs`}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {block.kind === 'reference' && (
                    <p className="text-[10px] text-dim leading-relaxed">
                      Renders the reference clause when the studio uses a reference photo and one is set.
                    </p>
                  )}

                  <WhenEditor
                    fields={allFields}
                    value={block.when}
                    onChange={w => updateBlock(block.uid, b => ({ ...b, when: w }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => addBlock('field')}
                disabled={allFields.length === 0}
                title={allFields.length === 0 ? 'Define a field first' : 'Add a field block'}
                className={addBtnCls}
              >
                <Plus className="w-3 h-3" /> Field
              </button>
              <button type="button" onClick={() => addBlock('text')} className={addBtnCls}>
                <Plus className="w-3 h-3" /> Text
              </button>
              <button type="button" onClick={() => addBlock('reference')} className={addBtnCls}>
                <Plus className="w-3 h-3" /> Reference
              </button>
            </div>
          </div>

          {/* 5. Smart rules */}
          <div>
            <SectionHeading>Smart Rules</SectionHeading>
            <div className="space-y-2">
              {draft.rules.map((rule) => (
                <div key={rule.uid} className="border border-line/60 rounded-md p-3 space-y-2 bg-surface/40">
                  <div className="flex items-end gap-2">
                    <div className="w-48">
                      <label className={labelCls}>Section</label>
                      <select
                        value={rule.sectionId}
                        onChange={e => updateRule(rule.uid, { sectionId: e.target.value })}
                        className={inputCls}
                        aria-label="Rule section"
                      >
                        {draft.sections.map(s => (
                          <option key={s.uid} value={s.id}>{s.title || s.id || '(untitled section)'}</option>
                        ))}
                        {!draft.sections.some(s => s.id === rule.sectionId) && rule.sectionId && (
                          <option value={rule.sectionId}>{rule.sectionId} (missing)</option>
                        )}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className={labelCls}>Level</label>
                      <select
                        value={rule.level}
                        onChange={e => updateRule(rule.uid, { level: e.target.value as 'info' | 'warn' })}
                        className={inputCls}
                        aria-label="Rule level"
                      >
                        <option value="info">Info</option>
                        <option value="warn">Warn</option>
                      </select>
                    </div>
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => removeRule(rule.uid)}
                      title="Delete rule"
                      aria-label="Delete rule"
                      className={dangerIconBtnCls}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <WhenEditor
                    required
                    fields={allFields}
                    value={rule.when}
                    onChange={w => { if (w) updateRule(rule.uid, { when: w }); }}
                  />
                  <div>
                    <label className={labelCls}>Warning text</label>
                    <input
                      type="text"
                      value={rule.text}
                      onChange={e => updateRule(rule.uid, { text: e.target.value })}
                      placeholder="Shown under the section when the condition holds"
                      className={inputCls}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRule}
              disabled={draft.sections.length === 0 || allFields.length === 0}
              title={draft.sections.length === 0 || allFields.length === 0 ? 'Define a section and a field first' : 'Add a smart rule'}
              className={`${addBtnCls} mt-3`}
            >
              <Plus className="w-3 h-3" /> Add rule
            </button>
          </div>

          {/* 6. Preset protected keys */}
          <div>
            <SectionHeading>Preset Protected Keys</SectionHeading>
            {allFields.length === 0 ? (
              <p className="text-xs text-dim">Define fields first — protected keys keep their values when a preset loads.</p>
            ) : (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {allFields.map(f => (
                  <CheckRow
                    key={f.uid}
                    checked={f.key !== '' && draft.protectedKeys.includes(f.key)}
                    onChange={v => toggleProtectedKey(f.key, v)}
                    disabled={f.key === ''}
                    label={<span className="font-mono">{f.key || '(no key)'}</span>}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 7. Live preview (defaults only — no interactive mini-form) */}
          <div>
            <SectionHeading>Live Preview</SectionHeading>
            {!built.ok && (
              <div className="mb-3 bg-danger/10 border border-danger/30 rounded-md p-3 space-y-1">
                {built.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-danger">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="font-mono leading-relaxed">{err}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="prompt-panel rounded-card border border-line p-6 relative">
              <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-base border border-line rounded-full text-accent2 text-[10px] font-black uppercase tracking-widest">
                Default Prompt
              </div>
              <div className="mt-4 font-mono text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {built.ok
                  ? (built.prompt || '(empty prompt)')
                  : 'Fix the validation errors above to preview the prompt.'}
              </div>
            </div>
          </div>
        </div>

        {/* 8. Footer */}
        <div className="p-4 border-t border-line bg-surface/50 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-[10px] font-bold uppercase tracking-wider ${built.ok ? 'text-ok' : 'text-danger'}`}>
            {built.ok
              ? 'Recipe valid — ready to save.'
              : `${built.errors.length} validation error${built.errors.length === 1 ? '' : 's'} — listed above the preview.`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-dim hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={!built.ok}
              title={built.ok ? 'Download the .nbrecipe file' : 'Fix validation errors to export'}
              className="px-4 py-2 border border-line rounded-full text-xs font-bold uppercase tracking-wider text-dim hover:text-accent hover:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export .nbrecipe
            </button>
            <button
              onClick={handleSave}
              disabled={!built.ok}
              title={built.ok ? 'Save this studio' : 'Fix validation errors to save'}
              className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase text-xs px-4 py-2 rounded-full flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
