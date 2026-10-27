import "server-only";

/** True for browser requests made by this app's own pages. */
export function isSameOrigin(request: Request): boolean {
  return request.headers.get("sec-fetch-site") === "same-origin";
}
