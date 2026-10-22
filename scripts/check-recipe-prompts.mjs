#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const cache = join(root, 'node_modules', '.cache');
const bundle = join(cache, 'aichemy-prompt-check.mjs');
mkdirSync(cache, { recursive: true });
execFileSync(join(root, 'node_modules', '.bin', 'esbuild'), [
  join(root, 'domains', 'index.ts'),
  '--bundle',
  '--platform=node',
  '--format=esm',
  `--outfile=${bundle}`,
  '--log-level=warning',
], { stdio: 'inherit' });

const { DOMAINS } = await import(pathToFileURL(bundle).href);
const domain = id => {
  const recipe = DOMAINS.find(item => item.id === id);
  assert.ok(recipe, `missing recipe: ${id}`);
  return recipe;
};

for (const recipe of DOMAINS) {
  const prompt = recipe.buildPrompt(recipe.createEmptyState());
  assert.ok(prompt.trim(), `${recipe.id} builds an empty prompt`);
}
assert.equal(DOMAINS.length, 10);

const marketing = domain('marketing');
const emptyHeadline = marketing.createEmptyState();
emptyHeadline.textStrategy = 'render-exact';
emptyHeadline.headlineText = '';
const emptyPrompt = marketing.buildPrompt(emptyHeadline);
assert.ok(emptyPrompt.includes('Leave the headline area at the top blank'));
assert.ok(!emptyPrompt.includes('[HEADLINE]'));

const relight = domain('relight');
const gradeOnly = relight.createEmptyState();
gradeOnly.mode = 'grade-only';
assert.ok(!relight.buildPrompt(gradeOnly).includes('\n\nLighting:'));
gradeOnly.backgroundMode = 'replace';
gradeOnly.removeBackgroundPeople = true;
const replacePrompt = relight.buildPrompt(gradeOnly);
assert.ok(replacePrompt.includes('Replace the background with'));
assert.ok(!replacePrompt.includes('Remove other people'));
const removePeople = relight.sections.flatMap(section => section.fields).find(field => field.key === 'removeBackgroundPeople');
assert.equal(removePeople.visibleWhen(gradeOnly), false);

const portrait = domain('portrait');
const avatar = portrait.createEmptyState();
avatar.portraitType = 'stylized-avatar';
const avatarPrompt = portrait.buildPrompt(avatar);
assert.ok(avatarPrompt.includes('stylized digital avatar'));
assert.ok(!avatarPrompt.includes('Photorealistic portrait photography'));

const logo = domain('logo');
const wordmark = logo.createEmptyState();
wordmark.logoType = 'wordmark';
wordmark.brandBrief = '"Northline" outdoor gear';
const wordmarkPrompt = logo.buildPrompt(wordmark);
assert.ok(wordmarkPrompt.includes('spelled exactly as written'));
assert.ok(wordmarkPrompt.includes('"Northline" outdoor gear'));

console.log(`Checked ${DOMAINS.length} default recipe prompts and marketing, relight, portrait, and logo branches.`);
