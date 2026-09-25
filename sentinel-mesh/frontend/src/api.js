/**
 * SentinelMesh Backend API Client
 * Connects the React dashboard to the FastAPI backend (http://localhost:8000).
 * Provides fallback mock data when the backend is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Health check smoke test
 */
export async function getHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('SentinelMesh backend offline:', err.message);
    return null;
  }
}

/**
 * Fetch all received events (or flagged only)
 */
export async function getEvents(flaggedOnly = false) {
  try {
    const url = `${API_BASE_URL}/events${flaggedOnly ? '?flagged_only=true' : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local mock events:', err.message);
    return null;
  }
}

/**
 * Fetch all correlated incidents
 */
export async function getIncidents() {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents`);
    if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local mock incidents:', err.message);
    return null;
  }
}

/**
 * Fetch a single incident by ID
 */
export async function getIncidentById(incidentId) {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}`);
    if (!res.ok) throw new Error(`Incident not found: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn(`Could not load incident ${incidentId}:`, err.message);
    return null;
  }
}

/**
 * Update incident disposition status: 'new' | 'reviewed' | 'dismissed' | 'escalated'
 */
export async function updateIncidentStatus(incidentId, status) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/incidents/${incidentId}/status?status=${encodeURIComponent(status)}`,
      { method: 'PATCH' }
    );
    if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to update incident status on server:', err.message);
    return null;
  }
}

/**
 * Reset pipeline state in backend
 */
export async function resetBackendPipeline() {
  try {
    const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to reset pipeline: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to reset backend pipeline:', err.message);
    return null;
  }
}
