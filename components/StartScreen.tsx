/**
 * StartScreen - calm, beginner-friendly entry point for built-in and custom studios.
 */

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Heart,
  Moon,
  Pencil,
  Search,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';
import { getAllDomains, deleteCustomStudio, listCustomRecipes } from '../domains';
import type { CustomRecipe } from '../domains/custom/types';
import {
  loadFavoriteStudios,
  loadRecentStudios,
  rememberStudio,
  toggleFavoriteStudio,
} from '../services/browserStorage';

interface StartScreenProps {
  onSelectRecipe: (domainId: string) => void;
  onEditStudio: (recipe: CustomRecipe) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const RECIPE_IMAGES: Record<string, string> = {
  cinematic: '/images/genres/street-photography.webp',
  'id-photo': '/images/genres/portrait.webp',
  wedding: '/images/genres/wedding-photography.webp',
  product: '/images/genres/product.webp',
  marketing: '/images/genres/editorial.webp',
  portrait: '/images/genres/environmental-portrait.webp',
  'real-estate': '/images/genres/architecture.webp',
  food: '/images/genres/food.webp',
  logo: '/images/genres/conceptual-photography.webp',
  relight: '/images/genres/analog.webp',
};
const DEFAULT_RECIPE_IMAGE = '/images/genres/street-photography.webp';
const FEATURED_IDS = ['cinematic', 'portrait', 'product'];

type LibraryFilter = 'all' | 'recent' | 'favorites';

export function StartScreen({ onSelectRecipe, onEditStudio, theme, onToggleTheme }: StartScreenProps) {
  const [, setCustomsVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [recentIds, setRecentIds] = useState<string[]>(loadRecentStudios);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavoriteStudios);
  const domains = getAllDomains();
  const query = search.trim().toLowerCase();

  const featuredDomains = useMemo(() => FEATURED_IDS
    .map(id => domains.find(domain => domain.id === id))
    .filter((domain): domain is (typeof domains)[number] => Boolean(domain)), [domains]);

  const visibleDomains = domains.filter((domain) => {
    const matchesQuery = `${domain.id} ${domain.label} ${domain.tagline}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'all'
      || (filter === 'recent' && recentIds.includes(domain.id))
      || (filter === 'favorites' && favoriteIds.includes(domain.id));
    return matchesQuery && matchesFilter;
  });

  const openStudio = (id: string | undefined) => {
    if (!id) return;
    setRecentIds(rememberStudio(id));
    onSelectRecipe(id);
  };

  const toggleFavorite = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setFavoriteIds(toggleFavoriteStudio(id));
  };

  return (
    <div className="min-h-screen bg-base font-sans text-ink">
      <header className="border-b border-line bg-base/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div>
            <p className="brand-wordmark text-2xl tracking-tight">Ai<span className="text-accent">chemy</span></p>
            <p className="brand-tagline mt-1 text-[10px]">Brew your perfect prompt</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-dim sm:block">Everything stays on this device</span>
            <button type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} className="ui-icon-button">
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-5 sm:px-8 sm:py-10 lg:gap-12">
        <section aria-labelledby="welcome-title" className="hero-card grid overflow-hidden border border-line bg-surface md:grid-cols-[1.05fr_.95fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />Your image-making workspace</div>
            <h1 id="welcome-title" className="mt-4 max-w-xl font-serif text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">What are you making today?</h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-dim sm:text-base">Start with a point of view. Aichemy helps you shape a clear, expressive image brief—one thoughtful choice at a time.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => openStudio(featuredDomains[0]?.id ?? domains[0]?.id)} className="ui-button ui-button-primary">Start with an example <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              <a href="#studio-library" className="ui-button ui-button-secondary">Browse studios</a>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-line pt-5">
              {[['01', 'Choose a studio'], ['02', 'Shape the look'], ['03', 'Copy your brief']].map(([number, label]) => <div key={number}><p className="text-[10px] font-bold tracking-[0.16em] text-accent">{number}</p><p className="mt-1 text-xs leading-snug text-dim">{label}</p></div>)}
            </div>
          </div>
          <figure className="relative min-h-64 bg-surface2 md:min-h-[390px]">
            <img src={DEFAULT_RECIPE_IMAGE} alt="Street photography example" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
            <figcaption className="absolute inset-x-0 bottom-0 px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">Field note <span className="mx-1 text-accent" aria-hidden="true">/</span> Street photography</figcaption>
          </figure>
        </section>

        {featuredDomains.length > 0 && <section aria-labelledby="featured-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">A thoughtful place to begin</p><h2 id="featured-heading" className="mt-1 font-serif text-2xl tracking-tight sm:text-3xl">Recommended studios</h2></div><span className="hidden text-xs text-dim sm:block">Popular starting points</span></div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredDomains.map(domain => <button key={domain.id} type="button" onClick={() => openStudio(domain.id)} className="group featured-studio-card text-left"><img src={RECIPE_IMAGES[domain.id] ?? DEFAULT_RECIPE_IMAGE} alt="" className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" /><span className="flex items-center justify-between gap-3 p-4"><span><span className="block text-sm font-semibold text-ink group-hover:text-accent">{domain.label}</span><span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-dim">{domain.tagline}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" /></span></button>)}
          </div>
        </section>}

        <section id="studio-library" aria-labelledby="recipes-heading" className="space-y-5">
          <div className="flex flex-col gap-5 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="eyebrow">The library</p><h2 id="recipes-heading" className="mt-1 font-serif text-3xl tracking-tight">Choose your studio</h2><p className="mt-2 max-w-xl text-sm text-dim">Focused recipes keep the choices clear, so you can spend your time on the image—not the interface.</p></div>
            <div className="w-full lg:w-80"><label htmlFor="recipe-search" className="sr-only">Search studios</label><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden="true" /><input id="recipe-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Try portrait, product, food…" className="ui-field pl-10" /></div></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Studio library filters">
              {([['all', 'All studios'], ['recent', 'Recent'], ['favorites', 'Favorites']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`ui-filter-chip ${filter === value ? 'ui-filter-chip-active' : ''}`}>{value === 'recent' && <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}{value === 'favorites' && <Heart className="h-3.5 w-3.5" aria-hidden="true" />}{label}</button>)}
            </div>
            <p className="text-xs text-dim" role="status" aria-live="polite">Showing {visibleDomains.length} of {domains.length} studios</p>
          </div>

          {visibleDomains.length > 0 ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDomains.map(domain => {
              const isCustom = domain.id.startsWith('x-');
              const isFavorite = favoriteIds.includes(domain.id);
              return <article key={domain.id} className="studio-card group relative overflow-hidden border border-line bg-surface">
                <button type="button" onClick={() => openStudio(domain.id)} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface2"><img src={RECIPE_IMAGES[domain.id] ?? DEFAULT_RECIPE_IMAGE} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-70" /><span className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">{isCustom ? 'Personal studio' : 'Aichemy studio'}</span></div>
                  <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-base font-semibold tracking-tight text-ink group-hover:text-accent">{domain.label}</h3>{isCustom && <span className="ui-badge">Custom</span>}</div><p className="mt-2 min-h-10 text-sm leading-relaxed text-dim">{domain.tagline}</p><span className="mt-5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Open studio <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></span></div>
                </button>
                <button type="button" onClick={event => toggleFavorite(event, domain.id)} aria-pressed={isFavorite} aria-label={`${isFavorite ? 'Remove' : 'Add'} ${domain.label} ${isFavorite ? 'from' : 'to'} favorites`} className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center border bg-base/90 backdrop-blur-sm transition-colors ${isFavorite ? 'border-accent text-accent' : 'border-line text-dim hover:border-accent hover:text-accent'}`}><Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" /></button>
                {isCustom && <div className="flex gap-2 border-t border-line px-5 py-3" role="group" aria-label={`Manage ${domain.label} studio`}><button type="button" title={`Edit studio "${domain.label}"`} aria-label={`Edit studio "${domain.label}"`} onClick={() => { const recipe = listCustomRecipes().find(item => item.id === domain.id); if (recipe) onEditStudio(recipe); }} className="ui-card-action"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</button><button type="button" title={`Delete studio "${domain.label}"`} aria-label={`Delete studio "${domain.label}"`} onClick={() => { if (window.confirm(`Delete studio "${domain.label}"?`)) { deleteCustomStudio(domain.id); setCustomsVersion(version => version + 1); } }} className="ui-card-action text-danger hover:border-danger hover:text-danger"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete</button></div>}
              </article>;
            })}
          </div> : <div className="empty-state border border-line bg-surface px-5 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-base text-accent"><Search className="h-5 w-5" aria-hidden="true" /></div><p className="mt-4 font-semibold">{filter === 'favorites' ? 'Your favorites will live here.' : filter === 'recent' ? 'Your recent studios will appear here.' : `No studios match “${search.trim()}”.`}</p><p className="mt-1 text-sm text-dim">{filter === 'all' ? 'Try another name or description.' : 'Open a studio to start building your personal library.'}</p>{filter === 'all' && search && <button type="button" onClick={() => setSearch('')} className="ui-button ui-button-secondary mt-5">Clear search</button>}{filter !== 'all' && <button type="button" onClick={() => setFilter('all')} className="ui-button ui-button-secondary mt-5">Browse all studios</button>}</div>}
        </section>
      </main>
    </div>
  );
}
