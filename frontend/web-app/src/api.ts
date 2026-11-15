const configuredApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();

export const API_BASE = configuredApiBase.replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: { Accept: 'application/json' },
  });
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`.trim();
    if (contentType.includes('application/json')) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (payload?.error) detail = payload.error;
    }
    throw new Error(`${path}: ${detail}`);
  }

  if (!contentType.includes('application/json')) {
    const deploymentHint = API_BASE
      ? `Check that ${API_BASE} is the Python backend origin.`
      : 'Set VITE_API_BASE_URL to the deployed Python backend origin.';
    throw new Error(`${path} returned ${contentType || 'an unknown content type'} instead of JSON. ${deploymentHint}`);
  }

  return response.json() as Promise<T>;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown backend error';
}
