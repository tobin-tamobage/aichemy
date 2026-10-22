/**
 * App.tsx - Main Application Component
 *
 * RenderZero Web - Cinematic AI Prompt Builder (frontend-only)
 *
 * Users build structured image prompts and copy or download them for external AI tools.
 * Prompt state is session-only; image generation, APIs, and project files are not supported.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { StartScreen } from './components/StartScreen';
import { StudioBuilder } from './components/StudioBuilder';
import { StudioAccordionSection } from './components/StudioAccordionSection';
import { StudioWorkspaceShell } from './components/StudioWorkspaceShell';
import { DomainFieldRenderer } from './components/DomainFieldRenderer';

import { useTheme } from './hooks';
import { useDomainState } from './hooks/useDomainState';
import {
  getDomain, DEFAULT_DOMAIN_ID, applyPreset,
} from './domains';
import type { DomainRecipe, DomainWarning } from './domains';
import type { CustomRecipe } from './domains/custom/types';

import { downloadTextFile, rememberStudio } from './services/browserStorage';

import type { PresetWithPrompts } from './types';

import {
  AlertCircle, AlertTriangle, Bookmark, Check, CheckCircle2, Copy, Edit2, FileDown, Moon, Sun, X,
} from 'lucide-react';

// ============================================
// HELPER COMPONENTS
// ============================================


/** Accordion state keyed by recipe section id. */
type StudioExpandedSections = Record<string, boolean>;


/** Progressive disclosure: start with the first two decisions, keep the rest one click away. */
const defaultExpandedForDomain = (domain: DomainRecipe): StudioExpandedSections => {
  const expanded: StudioExpandedSections = {};
  domain.sections.forEach((section, index) => { expanded[section.id] = index < 2; });
  return expanded;
};

function getSectionProgress(section: DomainRecipe['sections'][number], state: Record<string, unknown>) {
  const fields = section.fields.filter(field => !field.visibleWhen || field.visibleWhen(state));
  const completed = fields.filter(field => {
    const value = state[field.key];
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value === true;
  }).length;
  return { completed, total: fields.length, done: fields.length > 0 && completed === fields.length };
}

/** Banner smart-rule (domain.warnings) di bawah section terkait. */
const SectionWarningBanner: React.FC<{ warning: DomainWarning }> = ({ warning }) => (
  <div className={`flex items-start gap-2 px-3 py-2.5 border text-xs font-medium ${
    warning.level === 'warn'
      ? 'bg-danger/10 border-danger/30 text-danger'
      : 'bg-accent/10 border-accent/30 text-accent2'
  }`}>
    {warning.level === 'warn'
      ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
    <span className="leading-relaxed">{warning.text}</span>
  </div>
);


async function writeClipboardText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Clipboard permission can be denied even during a user click.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0; pointer-events: none;';
  document.body.appendChild(textarea);

  let copied = false;
  try {
    textarea.select();
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }

  if (!copied) throw new Error('Unable to copy text to clipboard.');
}


// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  // --- Custom Hooks ---
  const [domainId, setDomainId] = useState<string>(DEFAULT_DOMAIN_ID);
  const activeDomain = useMemo(() => getDomain(domainId), [domainId]);
  const domain = useDomainState(activeDomain);
  const { theme, toggle } = useTheme();

  // --- Local UI State ---
  const [showPresetLibrary, setShowPresetLibrary] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [showExportFeedback, setShowExportFeedback] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [expandedSections, setExpandedSections] = useState<StudioExpandedSections>(() => (
    defaultExpandedForDomain(activeDomain)
  ));

  // --- App View State ---
  const [appView, setAppView] = useState<'start' | 'editor'>('start');

  // --- Custom studio editor ---
  const [editingRecipe, setEditingRecipe] = useState<CustomRecipe | null>(null);
  /** Bump forces re-render → pills + StartScreen re-read getAllDomains()
   *  (registry cache already invalidated by saveCustomStudio/deleteCustomStudio). */
  const [customsVersion, setCustomsVersion] = useState(0);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);



  /** Start a fresh prompt for the selected recipe. */
  const handleSelectRecipe = useCallback((recipeId: string) => {
    const nextDomain = getDomain(recipeId);
    rememberStudio(recipeId);
    domain.clearManual();
    setIsEditingPrompt(false);
    domain.reset(nextDomain.createEmptyState());
    setDomainId(nextDomain.id);
    setExpandedSections(defaultExpandedForDomain(nextDomain));
    setAppView('editor');
  }, [domain]);


  // --- Custom studio editor handlers ---

  /** Edit Studio: open the editor pre-filled; Save overwrites the same id. */
  const openBuilderWith = useCallback((recipe: CustomRecipe) => {
    setEditingRecipe(recipe);
  }, []);


  /** Saved edits refresh the cards and close the editor. */
  const handleStudioSaved = useCallback(() => {
    setCustomsVersion(v => v + 1);
    setEditingRecipe(null);
  }, []);



  const finalPrompt = domain.finalPrompt;
  const sectionMetrics = useMemo(
    () => activeDomain.sections.map(section => ({ section, ...getSectionProgress(section, domain.state) })),
    [activeDomain, domain.state],
  );
  const completedSections = sectionMetrics.filter(metric => metric.done).length;
  const promptReady = finalPrompt.trim().length > 0;


  /** Load visual settings — merge preset ke state saat ini (engine). */
  const handleLoadPreset = (preset: PresetWithPrompts) => {
    const nextState = applyPreset(
      activeDomain,
      domain.state,
      (preset.data ?? {}) as unknown as Record<string, unknown>,
    );
    // Perilaku preset existing: teks prompt yang sudah terisi tidak pernah ditimpa.
    for (const key of ['subjectAction', 'environment', 'mood'] as const) {
      const currentValue = domain.state[key];
      if (typeof currentValue === 'string' && currentValue.trim().length > 0) {
        nextState[key] = currentValue;
      }
    }
    domain.reset(nextState);
    setExpandedSections(prev => ({
      ...prev,
      ...defaultExpandedForDomain(activeDomain),
    }));
  };


  /** Copy the constructed prompt text. */
  const handleCopyPrompt = async () => {
    if (!finalPrompt) return;
    try {
      await writeClipboardText(finalPrompt);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };
  /** Export the constructed prompt as a .txt download */
  const handleExportPrompt = () => {
    if (!finalPrompt) return;
    const safeName = activeDomain.label.replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    downloadTextFile(`${safeName}_prompt.txt`, finalPrompt, 'text/plain');
    setShowExportFeedback(true);
    setTimeout(() => setShowExportFeedback(false), 2000);
  };



  // ============================================
  // RENDER
  // ============================================

  return (
    <>


      {/* Edit imported custom studios */}
      {editingRecipe && (
        <StudioBuilder
          initialRecipe={editingRecipe}
          onClose={() => setEditingRecipe(null)}
          onSaved={handleStudioSaved}
        />
      )}

      {appView === 'start' ? (
        <StartScreen
          onSelectRecipe={handleSelectRecipe}
          onEditStudio={openBuilderWith}
          theme={theme}
          onToggleTheme={toggle}
        />
      ) : (
    <div className="min-h-screen lg:h-screen bg-base text-ink font-sans flex flex-col lg:overflow-hidden">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 shrink-0 border-b border-line bg-base/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setAppView('start')} aria-label="Aichemy — choose another recipe" className="shrink-0 text-left">
              <span className="brand-wordmark text-xl text-ink sm:text-2xl">Ai<span className="text-accent">chemy</span></span>
            </button>
            <span aria-hidden="true" className="hidden h-6 w-px bg-line sm:block" />
            <div className="min-w-0">
              <p className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-dim sm:block">Recipe</p>
              <p className="truncate text-sm font-semibold text-ink">{activeDomain.label}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-dim transition-colors hover:text-accent"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowPresetLibrary(true)}
              aria-label="Browse presets for this recipe"
              title="Browse presets for this recipe"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent sm:px-3"
            >
              <Bookmark className="h-4 w-4" /> <span className="hidden sm:inline">Presets</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Build your brief</p>
            <h1 className="mt-1 font-serif text-2xl tracking-tight sm:text-3xl">A few thoughtful choices, then you’re ready.</h1>
          </div>
          <p className="text-xs text-dim"><span className="font-semibold text-accent">{completedSections}</span> of {sectionMetrics.length} sections complete</p>
        </div>
        <nav aria-label="Prompt-building stages" className="grid grid-cols-3 gap-2 pt-4 sm:gap-4">
          {[
            ['01', 'Describe', 'Start with the subject and idea.'],
            ['02', 'Shape', 'Choose the visual language.'],
            ['03', 'Finish', 'Review and copy your brief.'],
          ].map(([number, label, description], index) => {
            const stageDone = index === 0 ? completedSections > 0 : index === 1 ? completedSections > 1 : promptReady;
            return <div key={number} className={`rounded-card border px-3 py-3 sm:px-4 ${stageDone ? 'border-accent/50 bg-accent/5' : 'border-line bg-surface/50'}`}>
              <div className="flex items-center gap-2"><span className={`text-[10px] font-bold tracking-[0.16em] ${stageDone ? 'text-accent' : 'text-dim'}`}>{number}</span>{stageDone && <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />}<span className="text-xs font-semibold text-ink sm:text-sm">{label}</span></div>
              <p className="mt-1 hidden text-[11px] leading-relaxed text-dim sm:block">{description}</p>
            </div>;
          })}
        </nav>
      </div>

      <StudioWorkspaceShell
        leftPane={(
          <div className="space-y-4 pb-12 lg:pb-8">

          {/* Recipe fields from the active domain */}
          {sectionMetrics.map(({ section, completed, total, done }) => {
            const sectionWarnings = domain.warnings.filter(w => w.sectionId === section.id);
            return (
              <StudioAccordionSection
                key={section.id}
                id={section.id}
                icon={section.icon}
                isOpen={expandedSections[section.id] ?? false}
                onToggle={() => toggleSection(section.id)}
                title={section.title}
                step={sectionMetrics.findIndex(metric => metric.section.id === section.id) + 1}
                completed={done}
                summary={`${completed}/${total} choices made`}
              >
                <div className="grid gap-6">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      {domainId === 'cinematic' && field.key === 'subjectAction' ? (
                        <div className="flex flex-col gap-2">
                          <label htmlFor="cinematic-subject-action" className="ui-field-label">Subject & Action</label>
                          <textarea
                            id="cinematic-subject-action"
                            value={typeof domain.state.subjectAction === 'string' ? domain.state.subjectAction : ''}
                            onChange={(e) => domain.updateField('subjectAction', e.target.value)}
                            placeholder="E.g., A woman in a trench coat checking her phone..."
                            spellCheck={true}
                            rows={3}
                            className="ui-field min-h-28 resize-y"
                          />
                        </div>
                      ) : (
                        <DomainFieldRenderer
                          field={field}
                          value={domain.state[field.key]}
                          onChange={(value) => domain.updateField(field.key, value)}
                          state={domain.state}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {sectionWarnings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {sectionWarnings.map((warning, idx) => (
                      <SectionWarningBanner key={`${warning.sectionId}-${idx}`} warning={warning} />
                    ))}
                  </div>
                )}
              </StudioAccordionSection>
            );
          })}

          </div>
        )}
        rightPane={(
          <div className="space-y-6 pb-12 lg:pb-8">


          {/* Prompt Preview */}
          <section
            aria-labelledby="prompt-preview-title"
            className={`prompt-panel rounded-card border border-line p-5 transition-colors sm:p-6 lg:sticky lg:top-4 ${isEditingPrompt ? 'border-accent/60' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent2">Prompt <span aria-hidden="true">/</span> {activeDomain.label}</p>
                  <span className={`ui-badge ${domain.isManualPrompt ? 'border-accent/50 text-accent' : ''}`}>{domain.isManualPrompt ? 'Edited by you' : 'Live draft'}</span>
                </div>
                <h2 id="prompt-preview-title" className="mt-1 font-serif text-2xl tracking-tight text-ink">Your image brief</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetLibrary(true)}
                title="Save current options as a preset"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-base px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent motion-reduce:transition-none"
              >
                <Bookmark className="h-3.5 w-3.5" /> Save preset
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                aria-pressed={isEditingPrompt}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none ${
                  isEditingPrompt
                    ? 'border-accent bg-accent text-white'
                    : 'border-line bg-base text-ink hover:border-accent hover:text-accent'
                }`}
              >
                {isEditingPrompt ? <Check className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                {isEditingPrompt ? 'Done editing' : 'Edit prompt'}
              </button>
              {domain.isManualPrompt && isEditingPrompt && (
                <button
                  type="button"
                  onClick={() => domain.clearManual()}
                  title="Revert to the automatically built prompt"
                  className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:border-danger hover:bg-danger/10 motion-reduce:transition-none"
                >
                  <X className="h-3.5 w-3.5" /> Reset
                </button>
              )}
              <button
                type="button"
                onClick={handleExportPrompt}
                aria-live="polite"
                title="Download prompt as a text file"
                className={`inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none ${
                  showExportFeedback ? 'bg-ok/10 text-ok' : 'bg-base text-ink hover:border-accent hover:text-accent'
                }`}
              >
                {showExportFeedback ? <Check className="h-3.5 w-3.5" /> : <FileDown className="h-3.5 w-3.5" />}
                {showExportFeedback ? 'Exported' : 'Export .txt'}
              </button>
            </div>

            <div className="prompt-copy-surface mt-4 min-h-36 whitespace-pre-wrap break-words text-sm leading-7 text-ink/90">
              {isEditingPrompt ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={finalPrompt}
                    onChange={(e) => domain.setManual(e.target.value)}
                    placeholder="Write your prompt..."
                    spellCheck={true}
                    aria-label="Edit constructed prompt"
                    className="min-h-40 w-full resize-y rounded-md border border-line bg-base px-4 py-3 text-sm leading-7 text-ink placeholder:text-dim focus:border-accent focus:outline-none"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  title="Copy the constructed prompt"
                  aria-label="Copy constructed prompt"
                  className="w-full cursor-copy rounded-md border border-transparent p-2 text-left transition-colors hover:border-line hover:bg-base/60 motion-reduce:transition-none"
                >
                  {finalPrompt || 'Choose a few options on the left and your brief will take shape here.'}
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-xs text-dim">Built locally from your recipe choices. Nothing is sent from here.</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  aria-live="polite"
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 motion-reduce:transition-none"
                >
                  {showCopyFeedback
                    ? <><Check className="h-4 w-4" /> Copied</>
                    : <><Copy className="h-4 w-4" /> Copy prompt</>}
                </button>
              </div>
            </div>
          </section>



          <section className="rounded-card border border-line bg-surface p-5 sm:p-6" aria-labelledby="next-steps-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent2">Next step</p>
                <h3 id="next-steps-title" className="mt-1 font-serif text-xl tracking-tight text-ink">
                  Take it to your image tool
                </h3>
              </div>
              <span className="rounded-md border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-dim">
                Local only
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-dim">
              Aichemy shapes the brief; your chosen image tool creates the picture. Nothing is sent from here.
            </p>
            <ol className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              <li className="text-xs leading-relaxed text-dim"><span className="mr-2 font-semibold text-accent">01</span>Copy the brief</li>
              <li className="text-xs leading-relaxed text-dim"><span className="mr-2 font-semibold text-accent">02</span>Paste into your image model</li>
            </ol>
          </section>
          </div>
        )}
      />

      <aside
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base px-4 pt-3 shadow-lg lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        aria-label="Live prompt actions"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent2">Live prompt</p>
            <p className="truncate text-xs text-dim">{activeDomain.label} · updates as you build</p>
          </div>
          <button
            type="button"
            onClick={handleCopyPrompt}
            aria-live="polite"
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 motion-reduce:transition-none"
          >
            {showCopyFeedback ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy prompt</>}
          </button>
        </div>
      </aside>

      {/* ========== MODALS ========== */}

      <PresetLibraryModal
        isOpen={showPresetLibrary}
        onClose={() => setShowPresetLibrary(false)}
        onApply={handleLoadPreset}
        domainId={domainId}
        currentDomainState={domain.state}
        presetProtectedKeys={activeDomain.presetProtectedKeys}
      />

    </div>
      )}
    </>
  );
}
