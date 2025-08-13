import { API_BASE } from "../utils/api";

// Réécritures autoritaires :
// - Absolues pointant vers TON domaine (front) => redirigées vers API_BASE
// - Alias legacy /api/candles => /klines (mêmes query params)
(function patchFetch(){
  const orig = window.fetch.bind(window);
  const FRONT_ORIGIN = window.location.origin;

  function rewrite(url) {
    try {
      const u = new URL(url, window.location.href);

      // Ne touche pas aux autres domaines (firebase, googleapis, etc.)
      // Sauf si c’est le front lui-même (u.origin === FRONT_ORIGIN)
      if (u.origin === FRONT_ORIGIN) {
        // 1) /api/candles -> /klines (API_BASE)
        if (u.pathname === "/api/candles") {
          const target = new URL(API_BASE.replace(/\/+$/,"") + "/klines");
          // On recopie les params attendus par /klines
          for (const [k,v] of u.searchParams.entries()) {
            target.searchParams.set(k, v);
          }
          return target.toString();
        }

        // 2) toute autre route /api/... -> la même route sur API_BASE
        if (u.pathname.startsWith("/api/")) {
          const path = u.pathname.replace(/^\/api/, "");
          const target = new URL(API_BASE.replace(/\/+$/,"") + path);
          for (const [k,v] of u.searchParams.entries()) {
            target.searchParams.set(k, v);
          }
          return target.toString();
        }

        // 3) routes API connues appelées en relatif (ex: /prices, /me/init, etc.)
        const REL = /^(\/(ping|_cors_debug|me\/init|me\/portfolio(\/reset)?|price\/[^/]+|prices|klines|deltas|top-movers|get-latest-signals))(\?|$)/i;
        if (REL.test(u.pathname)) {
          const target = new URL(API_BASE.replace(/\/+$/,"") + u.pathname);
          for (const [k,v] of u.searchParams.entries()) target.searchParams.set(k,v);
          return target.toString();
        }
      }

      // Si l’URL est déjà sur l’API_BASE, on laisse passer.
      if (u.href.startsWith(API_BASE)) return u.toString();

      // Sinon, pas de réécriture
      return url;
    } catch {
      return url;
    }
  }

  window.fetch = (input, init) => {
    try {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      const next = rewrite(url);
      return orig(next, init);
    } catch {
      return orig(input, init);
    }
  };
})();
