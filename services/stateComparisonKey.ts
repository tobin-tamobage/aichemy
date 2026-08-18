const DATA_URL_PATTERN = /^data:(?:image|video|audio)\//i;
const DATA_URL_SAMPLE_LENGTH = 96;

type ComparableValue =
  | null
  | string
  | number
  | boolean
  | ComparableValue[]
  | { [key: string]: ComparableValue };

function summarizeDataUrl(value: string): ComparableValue {
  const commaIndex = value.indexOf(',');
  const mediaType = commaIndex > 0
    ? value.slice(5, commaIndex)
    : 'unknown';

  return {
    __renderZeroDataUrl: true,
    mediaType,
    length: value.length,
    head: value.slice(0, DATA_URL_SAMPLE_LENGTH),
    tail: value.slice(-DATA_URL_SAMPLE_LENGTH),
  };
}

function toComparableValue(value: unknown, seen: WeakSet<object>): ComparableValue {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') {
    return DATA_URL_PATTERN.test(value) ? summarizeDataUrl(value) : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.map((item) => toComparableValue(item, seen));
  }

  if (typeof value !== 'object') return String(value);

  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      __renderZeroFile: true,
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified,
    };
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return {
      __renderZeroBlob: true,
      size: value.size,
      type: value.type,
    };
  }

  const comparable: { [key: string]: ComparableValue } = {};
  Object.entries(value as Record<string, unknown>).forEach(([key, entryValue]) => {
    comparable[key] = toComparableValue(entryValue, seen);
  });

  return comparable;
}

export function createStateComparisonKey(value: unknown): string {
  return JSON.stringify(toComparableValue(value, new WeakSet()));
}
