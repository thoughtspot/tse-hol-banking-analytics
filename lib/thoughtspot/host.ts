/**
 * Returns the bare host (with port, if any) of a ThoughtSpot URL such as
 * `NEXT_PUBLIC_THOUGHTSPOT_HOST`, tolerating quotes, a missing scheme, paths,
 * and trailing slashes. Returns undefined when the value is unusable.
 * Safe to use in the browser and on the server.
 */
export function thoughtSpotHost(raw: string | undefined): string | undefined {
  const value = (raw ?? "")
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
  if (!value) return undefined;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).host || undefined;
  } catch {
    return undefined;
  }
}
