/**
 * Lets embeds wait for the Visual Embed SDK's `init()` call, which happens in
 * <ThoughtSpotInit> after hydration. Browser-only: the promise never resolves
 * during server rendering, and it is only awaited from effects.
 */
let markReady: () => void = () => {};

const ready = new Promise<void>((resolve) => {
  markReady = resolve;
});

export function markThoughtSpotInitialized(): void {
  markReady();
}

export function whenThoughtSpotInitialized(): Promise<void> {
  return ready;
}
