import type { StudioDescriptor, StudioState } from "../shared/product";
// Three authored art directions. Only matching choices are changed; unknown catalog values stay intact.
const directions = [
  {
    light: /window|golden|natural|warm/i,
    backdrop: /wood|linen|garden|outdoor|warm|marble/i,
    framing: /lifestyle|eye-level|medium|centered/i,
  },
  {
    light: /softbox|diffus|even|butterfly|soft/i,
    backdrop: /white|seamless|studio|clean|pastel/i,
    framing: /hero|headshot|centered|symmetric/i,
  },
  {
    light: /rim|dramatic|split|hard|neon/i,
    backdrop: /dark|black|concrete|gradient/i,
    framing: /macro|close|low-angle|thirds/i,
  },
];
export function remixState(
  studio: StudioDescriptor,
  current: StudioState,
  directionIndex: number,
): StudioState {
  const direction = directions[directionIndex % directions.length];
  const next = { ...current };
  for (const field of studio.sections.flatMap((s) => s.fields)) {
    if (
      !field.visible ||
      !field.options ||
      studio.protectedKeys.includes(field.key)
    )
      continue;
    const matcher = /light/i.test(field.key)
      ? direction.light
      : /background|surface|palette/.test(field.key)
        ? direction.backdrop
        : /shotType|composition|portraitType/.test(field.key)
          ? direction.framing
          : null;
    if (!matcher) continue;
    const option = field.options.find((o) => matcher.test(o.value));
    if (option)
      next[field.key] =
        field.multi || field.kind === "chips" ? [option.value] : option.value;
  }
  return next;
}
