import type React from 'react';

export interface DomainOption {
  value: string;
  label: string;
  /** Relatif ke public/, mis. 'images/id-photo/backgrounds/red.webp'. Boleh undefined → placeholder tile. */
  image?: string;
  hint?: string;
}

export type DomainState = Record<string, unknown>;

export interface DomainFieldBase {
  key: string;
  label: string;
  /** Field kondisional — mis. pose catalog mengikuti moment. */
  visibleWhen?: (state: DomainState) => boolean;
}

export interface TextareaField extends DomainFieldBase {
  kind: 'textarea'; placeholder: string; rows?: number;
}
export interface SelectField extends DomainFieldBase {
  kind: 'select'; options: DomainOption[]; placeholder?: string;
}
export interface VisualField extends DomainFieldBase {
  kind: 'visual'; options: DomainOption[]; previewRatio?: string; multi?: false;
}
export interface ChipsField extends DomainFieldBase {
  kind: 'chips'; options: DomainOption[]; max?: number; // multi-select
}
export interface ToggleField extends DomainFieldBase {
  kind: 'toggle'; hint?: string;
}

export type DomainField = TextareaField | SelectField | VisualField | ChipsField | ToggleField;

export interface DomainSection {
  id: string;
  title: string;             // '01 · Background'
  icon?: React.ReactNode;
  fields: DomainField[];
}

/** Smart-rule warning yang ditampilkan di bawah section terkait. */
export interface DomainWarning {
  sectionId: string;
  level: 'info' | 'warn';
  text: string;
}

export interface DomainPreset {
  id: string; name: string; timestamp: number;
  /** State parsial domain — merge ke atas state kosong, tidak menimpa field yang dikecualikan domain. */
  data: Record<string, unknown>;
  type?: 'user' | 'bundled';
}

export interface DomainRecipe {
  id: string;                  // 'cinematic' | 'id-photo'
  label: string;
  icon: string;                // emoji
  tagline: string;
  referencePhoto: boolean;
  referenceLabel?: string;     // 'Your selfie' / 'Product photo'
  referenceClause?: string;    // kalimat yang disisipkan ke prompt saat ada referensi
  createEmptyState: () => DomainState;
  /** Field yang TIDAK ditimpa preset (mis. subjectAction, teks bebas). */
  presetProtectedKeys: string[];
  sections: DomainSection[];
  buildPrompt: (state: DomainState) => string;
  /** Smart rules — dihitung dari state, dirender sebagai banner. */
  warnings?: (state: DomainState) => DomainWarning[];
}
