import { API_BASE_URL } from "./config.js";
import { getAuth } from "firebase/auth";


async function authHeaders() {
  const u = getAuth().currentUser;
  if (!u) return {};
  const tok = await u.getIdToken();
  return { Authorization: `Bearer ${tok}` };
}

export async function apiGet(path) {
  const h = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...h },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API ${res.status} : ${await res.text()}`);
  return res.json();
}

export async function apiPost(path, body) {
  const h = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...h },
    body: JSON.stringify(body || {}),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API ${res.status} : ${await res.text()}`);
  return res.json();
}


