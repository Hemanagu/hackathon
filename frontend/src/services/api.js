const BASE_URL = import.meta.env.VITE_API_URL || '';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
}

/**
 * Log a recognized gesture to the backend.
 * Fire-and-forget — the frontend already knows the sign,
 * this is purely for server-side logging / analytics.
 */
export async function recognizeGesture(sign, confidence) {
  const response = await fetch(`${BASE_URL}/api/recognize/gesture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sign, confidence }),
  });
  return handleResponse(response);
}

export async function getHealth() {
  const response = await fetch(`${BASE_URL}/api/health`);
  return handleResponse(response);
}

export async function getSigns() {
  const response = await fetch(`${BASE_URL}/api/signs`);
  return handleResponse(response);
}

export default { recognizeGesture, getHealth, getSigns };
