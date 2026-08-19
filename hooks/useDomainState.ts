import { useCallback, useMemo, useState } from 'react';
import type { DomainRecipe, DomainState } from '../domains/types';

export function useDomainState(domain: DomainRecipe) {
  const [state, setState] = useState<DomainState>(() => domain.createEmptyState());
  const [isManualPrompt, setIsManualPrompt] = useState(false);
  const [manualPrompt, setManualPrompt] = useState('');

  const updateField = useCallback((key: string, value: unknown) => {
    setState(prev => ({ ...prev, [key]: value }));
    setIsManualPrompt(false);
  }, []);

  const reset = useCallback((next?: DomainState) => {
    setState(next ?? domain.createEmptyState());
    setIsManualPrompt(false);
    setManualPrompt('');
  }, [domain]);

  const autoPrompt = useMemo(() => domain.buildPrompt(state), [domain, state]);
  const finalPrompt = isManualPrompt ? manualPrompt : autoPrompt;
  const warnings = useMemo(() => domain.warnings?.(state) ?? [], [domain, state]);

  const setManual = useCallback((text: string) => {
    setManualPrompt(text);
    setIsManualPrompt(true);
  }, []);

  const clearManual = useCallback(() => {
    setIsManualPrompt(false);
  }, []);

  return { state, updateField, reset, finalPrompt, isManualPrompt, setManual, clearManual, warnings };
}
