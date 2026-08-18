export function createAbortError(): DOMException {
  return new DOMException('Generation cancelled', 'AbortError');
}

export async function waitForAbortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  if (!signal) {
    await new Promise(resolve => globalThis.setTimeout(resolve, ms));
    return;
  }

  if (signal.aborted) {
    throw createAbortError();
  }

  await new Promise<void>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      globalThis.clearTimeout(timer);
      cleanup();
      reject(createAbortError());
    };

    const cleanup = () => signal.removeEventListener('abort', onAbort);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
