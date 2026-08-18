import type { AnimationStyleOption } from './types';

const createStyle = (label: string, file: string, prePrompt = label, postPrompt = `${label} inspired anime show style.`): AnimationStyleOption => ({
  label,
  value: label,
  image: `/images/anime-show-styles/${file}`,
  prePrompt,
  postPrompt,
});

export const ANIME_SHOW_STYLES: AnimationStyleOption[] = [
  createStyle('Attack on Giants', 'attack-on-giants.webp'),
  createStyle('Beyond the Journey', 'beyond-the-journey.webp'),
  createStyle('Charmcaptor', 'charmcaptor.webp'),
  createStyle('Cowboy Spaceman', 'cowboy-spaceman.webp'),
  createStyle('Dan Da Boom', 'dan-da-boom.webp'),
  createStyle('Edgerunners', 'edgerunners.webp'),
  createStyle('Forest Princess', 'forest-princess.webp'),
  createStyle('Ghost in the System', 'ghost-in-the-system.webp'),
  createStyle('Ghost Watch', 'ghost-watch.webp'),
  createStyle('Greyblade', 'greyblade.webp'),
  createStyle('Jujitsu Curse Domain', 'jujitsu-curse-domain.webp'),
  createStyle('Lunar Sailor', 'lunar-sailor.webp'),
  createStyle('Modern Mobile Suit', 'modern-mobile-suit.webp'),
  createStyle('Neon Revelation', 'neon-revelation.webp'),
  createStyle('Ninja Bandana', 'ninja-bandana.webp'),
  createStyle('Parasitic', 'parasitic.webp'),
  createStyle('Poke Collector', 'poke-collector.webp'),
  createStyle('Proxy Error', 'proxy-error.webp'),
  createStyle('Purple Evergarden', 'purple-evergarden.webp'),
  createStyle('Retro Mobile Suit', 'retro-mobile-suit.webp'),
  createStyle('Solo Level Ascension', 'solo-level-ascension.webp'),
  createStyle('Spiral Horror', 'spiral-horror.webp'),
  createStyle('Street Breaker', 'street-breaker.webp'),
  createStyle('Tokyo Demon Gloom', 'tokyo-demon-gloom.webp'),
  createStyle('Van Helsing Limited', 'van-helsing-limited.webp'),
  createStyle('Your Title', 'your-title.webp'),
];

export const getAnimeShowStyleByValue = (value: string): AnimationStyleOption | undefined => (
  ANIME_SHOW_STYLES.find((style) => style.value === value || style.label === value)
);
