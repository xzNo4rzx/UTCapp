// src/lib/apiClient.js
import { API_BASE_URL } from "./config.js";

export async function apiFetch(path, init = {}) {
  const base = API_BASE_URL;
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const { method = "GET", token, body } = init;

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${url}: ${txt}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
