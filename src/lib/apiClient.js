import { API_BASE_URL } from "./config.js";
export async function apiFetch(path, { method = "GET", token, body } = {}) {
  const base = import.meta.env.VITE_API_BASE?.replace(/\/+$/,"") || "";
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=> "");
    throw new Error(`API ${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}
