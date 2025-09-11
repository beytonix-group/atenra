"use client";

type Activity = {
  action: string;          // e.g., 'page_visit', 'api_call', 'user_update', 'role_change'
  info?: string;           // free-form detail
  path?: string;           // for page visits or API endpoints
  method?: string;         // for API calls (GET, POST, etc.)
  statusCode?: number;     // for API responses
  ts?: number;             // client timestamp (ms)
  userId?: number;         // will be added by the provider
};

const QUEUE: Activity[] = [];
let flushing = false;
let flushTimer: number | null = null;

function sendBeaconJson(url: string, payload: unknown): boolean {
  try {
    const data = JSON.stringify(payload);
    const blob = new Blob([data], { type: "application/json" });
    if ("sendBeacon" in navigator) {
      return navigator.sendBeacon(url, blob);
    }
  } catch {}
  return false;
}

async function flushNow() {
  if (flushing || QUEUE.length === 0) return;
  flushing = true;

  // Snapshot the queue to avoid locking
  const batch = QUEUE.splice(0, Math.min(QUEUE.length, 100)); // Max 100 events per batch
  
  const ok =
    sendBeaconJson("/api/activity/track", { events: batch }) ||
    (await fetch("/api/activity/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // keepalive lets the request continue during unload
      keepalive: true,
      body: JSON.stringify({ events: batch }),
    }).then(() => true).catch(() => false));

  // If failed, put back to queue (best-effort, but cap queue size)
  if (!ok && QUEUE.length < 500) {
    QUEUE.unshift(...batch);
  }

  flushing = false;
}

function scheduleFlush(ms = 2000) {
  if (flushTimer != null) return;
  flushTimer = (setTimeout(() => {
    flushTimer = null;
    // Try in idle time first to be extra gentle
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => flushNow(), { timeout: 1000 });
    } else {
      flushNow();
    }
  }, ms) as unknown) as number;
}

/** Public API: log any activity */
export function logActivity(evt: Activity) {
  // Stamp time once on client to avoid server clock skew
  evt.ts = evt.ts ?? Date.now();
  QUEUE.push(evt);

  // Small buffer to batch bursts
  scheduleFlush(1000);
}

/** Convenience: page view logger */
export function logPageView(path: string, userId?: number) {
  logActivity({ 
    action: "page_visit", 
    path,
    userId 
  });
}

/** Convenience: API call logger */
export function logApiCall(
  path: string, 
  method: string, 
  statusCode?: number, 
  info?: string,
  userId?: number
) {
  logActivity({ 
    action: "api_call",
    path,
    method,
    statusCode,
    info,
    userId
  });
}

/** Wire up lifecycle triggers once */
let wired = false;
export function wireActivityAutoFlush() {
  if (wired) return;
  wired = true;

  // Flush when the page is hidden or about to unload
  const onHide = () => flushNow();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") onHide();
  });
  window.addEventListener("pagehide", onHide);
  window.addEventListener("beforeunload", onHide);

  // Periodic safety flush (very lightweight)
  setInterval(() => {
    if (QUEUE.length > 0) {
      flushNow();
    }
  }, 15000);
}

// Enhanced fetch wrapper for automatic API tracking
export function trackingFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  userId?: number
): Promise<Response> {
  const url = typeof input === 'string' ? input : 
               input instanceof URL ? input.toString() : 
               input.url;
  
  const method = init?.method || 'GET';
  const startTime = performance.now();
  
  return fetch(input, init).then(
    response => {
      const duration = Math.round(performance.now() - startTime);
      logApiCall(
        url,
        method,
        response.status,
        `${duration}ms`,
        userId
      );
      return response;
    },
    error => {
      const duration = Math.round(performance.now() - startTime);
      logApiCall(
        url,
        method,
        0,
        `Error: ${error.message} (${duration}ms)`,
        userId
      );
      throw error;
    }
  );
}