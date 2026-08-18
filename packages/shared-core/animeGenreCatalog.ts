import type { AnimationStyleOption } from './types';

const createStyle = (label: string, file: string, prePrompt = label, postPrompt = `${label} visual language.`): AnimationStyleOption => ({
  label,
  value: label,
  image: `/images/anime-genres/${file}`,
  prePrompt,
  postPrompt,
});

export const ANIME_GENRES: AnimationStyleOption[] = [
  createStyle('3D Anime', '3d_anime.webp'),
  createStyle('90s OVA Anime', '90s_ova_anime.webp'),
  createStyle('CLAMP-like Elegant Anime', 'CLAMP_like_elegant_anime.webp'),
  createStyle('Avant-garde Anime', 'avant-garde_anime.webp'),
  createStyle('Battle Shonen Anime', 'battle_shonen_anime.webp'),
  createStyle('Bishoujo Anime', 'bishoujo_anime.webp'),
  createStyle('Chibi Super-deformed', 'chibi_super-deformed.webp'),
  createStyle('Classic 80s Cel Anime', 'classic_80s_cel_anime.webp'),
  createStyle('Dark Fantasy Anime', 'dark_fantasy_anime.webp'),
  createStyle('Early 2000s Digital Anime', 'early_2000s_digital_anime.webp'),
  createStyle('Gacha Game 3D', 'gacha_game_3d.webp'),
  createStyle('Ghibli-like Fantasy', 'ghibli_like_fantasy.webp'),
  createStyle('Gothic Horror Anime', 'gothic_horror_anime.webp'),
  createStyle('Idol Anime', 'idol_anime.webp'),
  createStyle('Josei Anime', 'josei_anime.webp'),
  createStyle('Key Visual Anime', 'key_visual_anime.webp'),
  createStyle('Kodomo Anime', 'kodomo_anime.webp'),
  createStyle('Modern Glossy Anime', 'modern_glossy_anime.webp'),
  createStyle('Moe Anime', 'moe_anime.webp'),
  createStyle('Otome Game Anime', 'otome_game_anime.webp'),
  createStyle('Sakuga Action Frame', 'sakuga_action_frame.webp'),
  createStyle('Seinen Anime', 'seinen_anime.webp'),
  createStyle('Shoujo Manga Anime', 'shoujo_manga_anime.webp'),
  createStyle('Superflat Anime', 'superflat_anime.webp'),
  createStyle('Visual Novel Anime', 'visual_novel_anime.webp'),
];

export const getAnimeGenreByValue = (value: string): AnimationStyleOption | undefined => (
  ANIME_GENRES.find((style) => style.value === value || style.label === value)
);
