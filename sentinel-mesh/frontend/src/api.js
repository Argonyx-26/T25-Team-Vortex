/**
 * SentinelMesh API Client
 * Base URL: http://localhost:5000
 * Direct live integration with FastAPI + Socket.IO backend.
 */

import { io } from 'socket.io-client';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Poll GET / for online indicator (returns { status: "ok" })
 */
export async function checkOnlineStatus() {
  const startTime = performance.now();
  const res = await fetch(`${API_BASE_URL}/`, { cache: 'no-store' });
  const latency = Math.round(performance.now() - startTime);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { ...data, latency };
}

/**
 * Fetch raw events
 * Supports GET /events and GET /events?flagged=true
 */
export async function getEvents(flaggedOnly = false) {
  const url = `${API_BASE_URL}/events${flaggedOnly ? '?flagged=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch events: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Fetch fused incidents
 * Returns array of fused incident objects with predicted_next_step, predicted_confidence, narrative
 */
export async function getIncidents() {
  const res = await fetch(`${API_BASE_URL}/incidents`);
  if (!res.ok) throw new Error(`Failed to fetch incidents: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Fetch raw events linked to a specific incident
 * GET /incidents/<id>/why
 */
export async function getIncidentWhy(incidentId) {
  const res = await fetch(`${API_BASE_URL}/incidents/${encodeURIComponent(incidentId)}/why`);
  if (!res.ok) throw new Error(`Failed to fetch incident why: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Fetch notifications
 * Supports GET /notifications?type=alert and GET /notifications?type=normal
 */
export async function getNotifications(type = null) {
  const url = `${API_BASE_URL}/notifications${type ? `?type=${encodeURIComponent(type)}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch notifications: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Mark a notification handled
 * POST /notifications/<id>/acknowledge
 */
export async function acknowledgeNotification(notificationId) {
  const res = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notificationId)}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to acknowledge notification: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Suppress future similar incidents
 * POST /incidents/<id>/dismiss
 */
export async function dismissIncident(incidentId) {
  const res = await fetch(`${API_BASE_URL}/incidents/${encodeURIComponent(incidentId)}/dismiss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to dismiss incident: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Update incident disposition status: 'new' | 'reviewed' | 'dismissed' | 'escalated'
 * PATCH /incidents/<id>/status?status=<status>
 */
export async function updateIncidentStatus(incidentId, status) {
  const res = await fetch(
    `${API_BASE_URL}/incidents/${encodeURIComponent(incidentId)}/status?status=${encodeURIComponent(status)}`,
    { method: 'PATCH' }
  );
  if (!res.ok) throw new Error(`Failed to update incident status: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Reset pipeline state in backend
 * POST /reset
 */
export async function resetBackendPipeline() {
  const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to reset pipeline: HTTP ${res.status}`);
  return await res.json();
}

/**
 * Initialize Socket.IO connection for live event streaming
 */
export function createSocketConnection({ onEvent, onIncident, onNotification, onConnect, onDisconnect }) {
  const socket = io(API_BASE_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
  });

  if (onConnect) socket.on('connect', onConnect);
  if (onDisconnect) socket.on('disconnect', onDisconnect);
  if (onEvent) socket.on('new_event', onEvent);
  if (onIncident) socket.on('new_incident', onIncident);
  if (onNotification) socket.on('new_notification', onNotification);

  return socket;
}
