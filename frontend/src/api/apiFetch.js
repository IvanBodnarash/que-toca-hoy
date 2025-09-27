import { reconnectSocket } from "../realtime/socket";

const BASE = "http://localhost:3000";

let token = null;

export function setToken(t) {
  token = t || null;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
  reconnectSocket();
}

export function getToken() {
  if (!token) token = localStorage.getItem("token") || null;
  return token;
}

let onUnauthorized = null;
export function setOnUnauthorized(handler) {
  onUnauthorized = typeof handler === "function" ? handler : null;
}
function triggerUnauthorized(reason) {
  try {
    onUnauthorized && onUnauthorized(reason);
  } catch (_) {}
}

// Refresh Lock
let isRefreshing = false;
let refreshPromise = null;
let waiters = [];
const waitForRefresh = () =>
  new Promise((resolve, reject) =>
    waiters.push((err, tok) => (err ? reject(err) : resolve(tok)))
  );
const notifyWaiters = (err, tok) => {
  waiters.forEach((cb) => cb(err, tok));
  waiters = [];
};

async function refreshToken() {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
    .then(async (r) => {
      if (!r.ok) throw new Error("REFRESH_FAILED");
      const data = await safeReadJson(r);
      const newTok = data?.token || data?.accessToken;
      if (!newTok) throw new Error("NO_TOKEN_FROM_REFRESH");
      setToken(newTok);
      notifyWaiters(null, newTok);
      return newTok;
    })
    .catch((e) => {
      setToken(null);
      notifyWaiters(e, null);
      triggerUnauthorized("refresh_failed");
      throw e;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

// Helpers
async function safeReadJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function buildHeaders(init, tok) {
  const headers = new Headers(init?.headers || {});
  if (
    init?.body != null &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (tok) headers.set("Authorization", `Bearer ${tok}`);
  return headers;
}

async function doFetch(path, init = {}, allowRetry = true) {
  const t = getToken();
  const hadAuth = !!t;
  const headers = buildHeaders(init, t);
  const req = {
    ...init,
    headers,
    credentials: "include",
    body:
      init.body instanceof FormData
        ? init.body
        : init.body != null && typeof init.body !== "string"
        ? JSON.stringify(init.body)
        : init.body,
  };

  let res;
  try {
    res = await fetch(BASE + path, req);
  } catch (error) {
    throw new Error("Failed to fetch");
  }

  if (res.status !== 401 && res.status !== 403) return res;

  if (!allowRetry || !hadAuth) return res;

  try {
    if (!isRefreshing) await refreshToken();
    else await waitForRefresh();
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  const newTok = getToken();
  const retryHeaders = buildHeaders(init, newTok);
  const retryReq = {
    ...init,
    headers: retryHeaders,
    credentials: "include",
    body:
      init.body instanceof FormData
        ? init.body
        : init.body != null && typeof init.body !== "string"
        ? JSON.stringify(init.body)
        : init.body,
  };

  const retryRes = await fetch(BASE + path, retryReq);

  if ((retryRes.status === 401 || retryRes.status === 403) && hadAuth) {
    triggerUnauthorized("retry_unauthorized");
  }
  return retryRes;
}

async function readError(res) {
  const data = await safeReadJson(res);
  const msg = data.error || data.message || res.statusText || "Request failed";
  const err = new Error(msg);
  err.status = res.status;
  throw err;
}

export async function apiGet(path) {
  const res = await doFetch(path, { method: "GET" });
  if (!res.ok) return readError(res);
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiPost(path, body) {
  const res = await doFetch(path, { method: "POST", body });
  if (!res.ok) return readError(res);
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiPut(path, body) {
  const res = await doFetch(path, { method: "PUT", body });
  if (!res.ok) return readError(res);
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiPatch(path, body) {
  const res = await doFetch(path, { method: "PATCH", body });
  if (!res.ok) return readError(res);
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiDelete(path) {
  const res = await doFetch(path, { method: "DELETE" });
  if (res.status === 204) return { ok: true };
  if (!res.ok) return readError(res);
  const text = await res.text();
  if (!text) return { ok: true };
  try {
    return JSON.parse(text);
  } catch {
    return { ok: true, data: text };
  }
}
