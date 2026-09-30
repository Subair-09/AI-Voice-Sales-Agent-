/**
 * Safely fetches JSON from an API endpoint.
 * Handles server restarts, network drops, and non-JSON responses gracefully
 * without throwing unhandled exceptions or logging fatal console errors.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return (await res.json()) as T;
  } catch {
    // Network interruption, offline, or transient server reload
    return null;
  }
}
