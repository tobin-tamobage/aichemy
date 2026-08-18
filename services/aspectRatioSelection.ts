export function resolveAspectRatioSelection(
  currentAspectRatio: string,
  supportedAspectRatios: readonly string[],
  defaultAspectRatio?: string,
): string {
  if (supportedAspectRatios.length === 0) {
    return currentAspectRatio;
  }

  if (currentAspectRatio && supportedAspectRatios.includes(currentAspectRatio)) {
    return currentAspectRatio;
  }

  if (defaultAspectRatio && supportedAspectRatios.includes(defaultAspectRatio)) {
    return defaultAspectRatio;
  }

  return supportedAspectRatios[0];
}
