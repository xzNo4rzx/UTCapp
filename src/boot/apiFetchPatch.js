import { API_BASE } from "../utils/api";

// Ne réécrit que les endpoints API connus, quand l'appel est RELATIF.
const RELATIVE_API = /^(\/(ping|_cors_debug|me\/init|me\/portfolio(\/reset)?|price\/[^/]+|prices|klines|deltas|top-movers|get-latest-signals))(\?|$)/i;

const _orig = window.fetch.bind(window);
window.fetch = (input, init) => {
  try {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (typeof url === "string" && url.startsWith("/") && RELATIVE_API.test(url)) {
      return _orig(`${API_BASE}${url}`, init);
    }
  } catch {}
  return _orig(input, init);
};
