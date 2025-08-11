# SPEC EXTRACT – UTC APP

## Backgrounds déclarés
```
public/backgrounds/homebackground.png
public/backgrounds/iatraderbackground.png
public/backgrounds/menubackground.png
```

## Mentions Top Movers / Gainers / Losers
```
src/context/IATraderContext.jsx:22:  stopLoss: 0.05,         // SL 5%
src/context/IATraderContext.jsx:201:    const sl = round2(price * (1 - DEFAULT_RULES.stopLoss));
src/utils/fetchPrices.js:97:  // tri et découpage pour top movers sur 5 min
src/components/TopMovers.jsx:1:// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/components/TopMovers.jsx
src/components/TopMovers.jsx:45:const TopMovers = () => {
src/components/TopMovers.jsx:72:  // --- Calcul gainers/losers 5 min ---
src/components/TopMovers.jsx:73:  const { topGainers, topLosers } = useMemo(() => {
src/components/TopMovers.jsx:81:      topGainers: rows.slice(0, 5),
src/components/TopMovers.jsx:82:      topLosers: rows.slice(-5).reverse(),
src/components/TopMovers.jsx:165:      {/* ==== [BLOC: GAINERS] ============================================== */}
src/components/TopMovers.jsx:180:            <tbody>{renderRows(topGainers)}</tbody>
src/components/TopMovers.jsx:185:      {/* ==== [BLOC: LOSERS] =============================================== */}
src/components/TopMovers.jsx:200:            <tbody>{renderRows(topLosers)}</tbody>
src/components/TopMovers.jsx:230:export default TopMovers;
src/components/SellModal.jsx:218:// - Composant SellModal complet et autonome, conforme aux props utilisées dans Trading / Profile / TopMovers / CryptoList.
```

## Titres/Headers relevés (pages & composants)
```
src/pages/Trading.old.jsx:104:      <h1 style={{ color: "#fff", marginBottom: "1rem", fontFamily: "sans-serif" }}>
src/pages/Trading.old.jsx:106:      </h1>
src/pages/Trading.old.jsx:156:      <h2 style={{ color: "#fff", fontFamily: "sans-serif" }}>📈 Top 5 hausses (5 min)</h2>
src/pages/Trading.old.jsx:222:      <h2 style={{ color: "#fff", fontFamily: "sans-serif" }}>📉 Top 5 baisses (5 min)</h2>
src/pages/Trading.old.jsx:288:      <h2 style={{ color: "#fff", fontFamily: "sans-serif" }}>🧾 Autres cryptos</h2>
src/pages/Trading.old.jsx:398:            <h2>Vendre {sellSymbol}</h2>
src/pages/TradingTiles.jsx:51:        <h2 style={{ margin: 0 }}>Marché (UTC)</h2>
src/pages/TradingTiles.jsx:138:      title={label}
src/pages/Profile.jsx:116:        <h2 style={{ margin: 0 }}>
src/pages/Profile.jsx:118:        </h2>
src/pages/Profile.jsx:211:                      <td style={td} title={p.id}>{p.id}</td>
src/pages/Profile.jsx:272:                      <td style={td} title={h.id}>{h.id}</td>
src/pages/Admin.jsx:92:        <h1>🛠️ Tableau de bord Admin</h1>
src/pages/Admin.jsx:136:        <h2>📨 Envoyer un message admin</h2>
src/pages/Analysis.jsx:137:      <h1>📊 Analyse {symbol}/USD — {period}</h1>
src/pages/IATrader.jsx:76:        <h1>🤖 IA Trader</h1>
src/pages/IATrader.jsx:113:          <h2 style={{ color: "#aaa" }}>
src/pages/IATrader.jsx:115:          </h2>
src/pages/Signals.jsx:98:        <h1>🚨 Signaux IA</h1>
src/pages/Login.jsx:59:        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>🔐 Connexion</h2>
src/pages/Register.jsx:59:        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>📝 Demande d'inscription</h2>
src/pages/Trading.jsx:94:        <h2>Trading</h2>
src/pages/Home.jsx:30:    title, name, start, cash,
src/pages/Home.jsx:46:        <h2>{title}</h2>
src/pages/Home.jsx:81:          title: "💼 Portefeuille virtuel",
src/pages/Home.jsx:91:          title: "🤖 IA Trader",
src/components/Navbar.jsx:66:        <h1
src/components/Navbar.jsx:71:            animation: "slideTitle 2s ease-in-out infinite alternate",
src/components/Navbar.jsx:75:        </h1>
src/components/Navbar.jsx:189:        @keyframes slideTitle {
src/components/SellModalIA.jsx:34:        <h2>💣 Vente IA : {symbol}</h2>
```

## Commentaires, TODO, NOTES (spécifs cachées dans le code)
```
src/context/AuthContext.jsx:1:// FICHIER: ~/Documents/utc-app-full/src/context/AuthContext.jsx
src/context/AuthContext.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/context/AuthContext.jsx:12:// ==== [BLOC: CONTEXTE] ======================================================
src/context/AuthContext.jsx:15:// ==== [BLOC: HOOK] ==========================================================
src/context/AuthContext.jsx:18:// ==== [BLOC: PROVIDER] ======================================================
src/context/AuthContext.jsx:53:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/context/AuthContext.jsx:54:// - Import explicite Firebase Auth V9 et usage via `auth` centralisé.
src/context/AuthContext.jsx:55:// - Remplace toute référence à getAuth() inline par l’instance `auth` partagée.
src/context/AuthContext.jsx:56:// - Ajout useEffect import manquant si nécessaire.
src/context/UserContext.jsx.bak.1754825987:17:      // Init côté API (création du doc si inexistant)
src/context/UserContext.jsx.bak.1754825987:19:      // Récupération du portefeuille
src/context/PortfolioContext.jsx:1:// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/context/PortfolioContext.jsx
src/context/PortfolioContext.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/context/PortfolioContext.jsx:9:// ==== [BLOC: CONTEXTE] ======================================================
src/context/PortfolioContext.jsx:12:// ==== [BLOC: CONSTANTES GLOBALES] ===========================================
src/context/PortfolioContext.jsx:15:// Liste de suivi par défaut (peut être étendue par la suite)
src/context/PortfolioContext.jsx:19:  "FIL", "APT", "ARB", "OP", "NEAR", "SUI", "INJ", "TWT", "RUNE",
src/context/PortfolioContext.jsx:24:// ==== [BLOC: HELPERS - BACKEND BINANCE PROXY] ===============================
src/context/PortfolioContext.jsx:25:// Le backend expose: /price/{symbol} et /prices?symbols=BTC,ETH
src/context/PortfolioContext.jsx:46:// ==== [BLOC: HELPERS - UTILS] ===============================================
src/context/PortfolioContext.jsx:53:// ==== [BLOC: PROVIDER] ======================================================
src/context/PortfolioContext.jsx:57:  // ---- États persistés (localStorage + Firestore) ---------------------------
src/context/PortfolioContext.jsx:103:  // ---- États non persistés --------------------------------------------------
src/context/PortfolioContext.jsx:107:  // snapshot de référence pour variations 5 minutes
src/context/PortfolioContext.jsx:113:  // ---- Persistences locales -------------------------------------------------
src/context/PortfolioContext.jsx:119:  // ---- Firestore sync (best-effort) ----------------------------------------
src/context/PortfolioContext.jsx:125:        const data = await loadPortfolio(user.uid);
src/context/PortfolioContext.jsx:134:        // silencieux
src/context/PortfolioContext.jsx:145:        await savePortfolio(user.uid, {
src/context/PortfolioContext.jsx:154:        // silencieux
src/context/PortfolioContext.jsx:160:  // ==== [BLOC: POSITIONS MAP] ===============================================
src/context/PortfolioContext.jsx:171:  // ==== [BLOC: METRIQUES & P&L] =============================================
src/context/PortfolioContext.jsx:235:  // ==== [BLOC: VARIATIONS 5 MINUTES] ========================================
src/context/PortfolioContext.jsx:249:  // ==== [BLOC: MISE À JOUR DES PRIX] ========================================
src/context/PortfolioContext.jsx:273:  // ==== [BLOC: ACHAT / VENTE] ===============================================
src/context/PortfolioContext.jsx:359:  // ==== [BLOC: RESET PORTFOLIO] =============================================
src/context/PortfolioContext.jsx:365:  // ==== [BLOC: CONTEXTE - VALUE] ============================================
src/context/PortfolioContext.jsx:368:      // ÉTATS
src/context/PortfolioContext.jsx:378:      // METRIQUES
src/context/PortfolioContext.jsx:389:      // ACTIONS
src/context/PortfolioContext.jsx:421:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/context/PortfolioContext.jsx:422:// - Suppression des appels directs à https://api.binance.com (CORS).
src/context/PortfolioContext.jsx:423:// - Remplacement par un proxy via ton backend: apiGetPrice / apiGetPrices.
src/context/PortfolioContext.jsx:424:// - Maintien de toute la logique existante (états, P&L, snapshots, Firestore).
src/context/PortfolioContext.jsx:425:// - Fonctions buy/sell et updatePrices routées via fetchBackendPrice(s).
src/context/PortfolioContext.jsx:426:// - Annotations de blocs pour modifications ciblées.
src/context/AdminContext.jsx:1:// FICHIER: ~/Documents/utc-app-full/src/context/AdminContext.jsx
src/context/AdminContext.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/context/AdminContext.jsx:8:// ==== [BLOC: CONTEXTE] ======================================================
src/context/AdminContext.jsx:11:// ==== [BLOC: HOOK] ==========================================================
src/context/AdminContext.jsx:14:// ==== [BLOC: PROVIDER] ======================================================
src/context/AdminContext.jsx:23:        // ==== [BLOC: STRAT FALBACK] =========================================
src/context/AdminContext.jsx:24:        // 1) essaie 'users' où approved == false
src/context/AdminContext.jsx:25:        // 2) sinon 'pendingUsers' (juste compter les docs)
src/context/AdminContext.jsx:28:        // Tentative 1: users non approuvés
src/context/AdminContext.jsx:34:          // ignore
src/context/AdminContext.jsx:37:        // Tentative 2: fallback collection "pendingUsers"
src/context/AdminContext.jsx:43:            // ignore
src/context/AdminContext.jsx:70:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/context/AdminContext.jsx:71:// - Import/usage corrects de Firestore via 'db' exporté.
src/context/AdminContext.jsx:72:// - Fournit pendingUsers avec double fallback (users.approved=false puis pendingUsers).
src/context/AdminContext.jsx:73:// - Annotations de blocs incluses.
src/context/UserContext.jsx:17:      // Init côté API (création du doc si inexistant)
src/context/UserContext.jsx:19:      // Récupération du portefeuille
src/context/IATraderContext.jsx:1:// FICHIER: ~/Documents/utc-app-full/src/context/IATraderContext.jsx
src/context/IATraderContext.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/context/IATraderContext.jsx:15:// ==== [BLOC: CONTEXTE] ======================================================
src/context/IATraderContext.jsx:18:// ==== [BLOC: CONSTANTES] ====================================================
src/context/IATraderContext.jsx:26:    equilibre: 12,
src/context/IATraderContext.jsx:31:// ==== [BLOC: HELPERS] =======================================================
src/context/IATraderContext.jsx:36:// ==== [BLOC: BACKEND PRICES HELPERS] =======================================
src/context/IATraderContext.jsx:50:    // accepte clés "BTC" ou "BTCUSDT"
src/context/IATraderContext.jsx:57:// ==== [BLOC: PROVIDER] ======================================================
src/context/IATraderContext.jsx:61:  // ---- [BLOC: STATES] ------------------------------------------------------
src/context/IATraderContext.jsx:69:  const [riskMode, setRiskMode] = useState("equilibre"); // 'conservateur'|'equilibre'|'aggressif'
src/context/IATraderContext.jsx:74:  // ---- [BLOC: MEMOS] -------------------------------------------------------
src/context/IATraderContext.jsx:85:  // ---- [BLOC: LOG] ---------------------------------------------------------
src/context/IATraderContext.jsx:90:  // ==== [BLOC: PERSISTENCE FIRESTORE] =======================================
src/context/IATraderContext.jsx:96:        const data = await loadIATrader(user.uid);
src/context/IATraderContext.jsx:102:          setRiskMode(data.riskMode || "equilibre");
src/context/IATraderContext.jsx:103:          pushLog("Données IA Trader chargées depuis Firestore.");
src/context/IATraderContext.jsx:117:        await saveIATrader(user.uid, {
src/context/IATraderContext.jsx:127:        // silencieux
src/context/IATraderContext.jsx:133:  // ==== [BLOC: PRIX COURANTS] ===============================================
src/context/IATraderContext.jsx:141:  // ==== [BLOC: BUY/SELL] ====================================================
src/context/IATraderContext.jsx:231:  // ==== [BLOC: CHECK POSITIONS - TP/SL] =====================================
src/context/IATraderContext.jsx:257:  // ==== [BLOC: AUTO-TRADE SUR SIGNAUX] ======================================
src/context/IATraderContext.jsx:259:    () => DEFAULT_RULES.minScore[riskMode] ?? DEFAULT_RULES.minScore.equilibre,
src/context/IATraderContext.jsx:293:      // silencieux
src/context/IATraderContext.jsx:297:  // ==== [BLOC: TICK LOOP] ===================================================
src/context/IATraderContext.jsx:309:        // silencieux
src/context/IATraderContext.jsx:323:  // ==== [BLOC: ACTIONS PUBLIQUES] ===========================================
src/context/IATraderContext.jsx:347:  // ==== [BLOC: CONTEXTE VALUE] ==============================================
src/context/IATraderContext.jsx:350:      // état
src/context/IATraderContext.jsx:363:      // actions
src/context/IATraderContext.jsx:391:// ==== [BLOC: EXPORT HOOK] ===================================================
src/context/IATraderContext.jsx:394:// ==== [BLOC: EXPORTS] =======================================================
src/context/IATraderContext.jsx:397:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/context/IATraderContext.jsx:398:// - Restauration d’un IATraderContext complet (provider + exports nommé & default).
src/context/IATraderContext.jsx:399:// - Routage 100% via backend (utils/api), plus d’appels directs Binance (CORS).
src/context/IATraderContext.jsx:400:// - Acceptation des clés de prix 'BTC' et 'BTCUSDT' dans la map de retour.
src/context/IATraderContext.jsx:401:// - Tick loop IA : update prix -> check TP/SL -> signaux, avec persistance Firestore.
src/context/IATraderContext.jsx:402:// - Annotations de blocs ajoutées pour repérage visuel.
src/utils/fetchHistoricalPrices.js:1:// src/utils/fetchHistoricalPrices.js
src/utils/fetchHistoricalPrices.js:8:/**
src/utils/firestorePortfolio.js:4:export const loadPortfolio = async (uid) => {
src/utils/firestorePortfolio.js:5:  const ref = doc(db, "portfolios", uid);
src/utils/firestorePortfolio.js:10:export const savePortfolio = async (uid, data) => {
src/utils/firestorePortfolio.js:11:  const ref = doc(db, "portfolios", uid);
src/utils/fetchPrices.js:1:// src/utils/fetchPrices.js
src/utils/fetchPrices.js:8:// 📁 Mini-historique stocké dans localStorage pour le 5 min
src/utils/fetchPrices.js:20:// 📈 Calcul simple de % de variation
src/utils/fetchPrices.js:32:  // Appel CoinGecko pour récupérer les variations 24h et 7j
src/utils/fetchPrices.js:55:    // ─── Enregistrer l’historique pour calculer le 5 min
src/utils/fetchPrices.js:59:    // purger les données de plus de 7 jours
src/utils/fetchPrices.js:64:    // fonction pour retrouver le prix le plus proche de targetTime (<=)
src/utils/fetchPrices.js:67:      // tous les enregistrements antérieurs à target
src/utils/fetchPrices.js:70:      // choisir celui avec le timestamp le plus proche de target
src/utils/fetchPrices.js:82:    // ─── Variations récupérées directement
src/utils/fetchPrices.js:97:  // tri et découpage pour top movers sur 5 min
src/utils/firestoreIATrader.js:4:export const loadIATrader = async (uid) => {
src/utils/firestoreIATrader.js:6:    const ref = doc(db, "iatraders", uid);
src/utils/firestoreIATrader.js:15:export const saveIATrader = async (uid, data) => {
src/utils/firestoreIATrader.js:17:    const ref = doc(db, "iatraders", uid);
src/utils/firestoreSignals.js:1:// src/utils/firestoreSignals.js
src/utils/firestoreSignals.js:5:// 🔁 Export obligatoire : fetchLatestSignals
src/utils/portfolio.js:1:// src/utils/portfolio.js
src/utils/portfolio.js:3:// État du portefeuille simulé (à adapter ou charger dynamiquement si besoin)
src/utils/portfolio.js:7:    // … ajoute ici tes autres positions
src/utils/portfolio.js:10:/**
src/utils/portfolio.js:11: * Retourne un résumé texte du portefeuille, identique à ta version Python.
src/utils/portfolio.js:15:    const lines = ["💼 Portefeuille simulé"];
src/utils/api.js:2:// FICHIER: ~/Documents/utc-app-full/src/utils/api.js
src/utils/api.js:4:// ==== [CONFIG] ==============================================================
src/utils/api.js:7:// ==== [HELPERS] =============================================================
src/utils/api.js:16:    throw new Error(`Réponse non-JSON depuis ${res.url}: ${text.slice(0, 180)}`);
src/utils/api.js:21:// ==== [CLIENT — PRIX & KLINES] ==============================================
src/utils/api.js:38:// ==== [CLIENT — SIGNAUX & LOGS] =============================================
src/utils/api.js:49:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/utils/api.js:50:// - Ajout apiGetTraderLog() -> /trader-log
src/utils/api.js:51:// - Remplacement /get-latest-signals par /get-latest-signals via apiLatestSignals()
src/utils/api.js:52:// - Tout passe par VITE_API_BASE (https://utc-api.onrender.com)
src/utils/iaSignals.js:1:// src/utils/iaSignals.js
src/utils/iaSignals.js:3:/**
src/utils/iaSignals.js:4: * Génère des signaux "buy" et "sell" à partir de séries chronologiques.
src/utils/iaSignals.js:5: * - BUY : creux local (inférieur à ses voisins) → 🟢
src/utils/iaSignals.js:30:          `Détection d’un ${type === "BUY" ? "creux" : "pic"} local via variation de prix.`,
src/utils/iaSignals.js:33:          `📈 Prix suivant : ${next}`,
src/styles/trading.css:1:/* FICHIER: src/styles/trading.css */
src/styles/trading.css:24:.tr-note{
src/styles/IATrader.css:1:/* src/styles/IATrader.css */
src/components/PrivateRoute.jsx:1:// FICHIER: ~/Documents/utc-app-full/src/components/PrivateRoute.jsx
src/components/PrivateRoute.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/components/PrivateRoute.jsx:8:// ==== [BLOC: COMPOSANT] =====================================================
src/components/PrivateRoute.jsx:17:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/components/PrivateRoute.jsx:18:// - Utilise le contexte Auth corrigé; plus d’appel direct à getAuth().
src/components/TopMovers.jsx:1:// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/components/TopMovers.jsx
src/components/TopMovers.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/components/TopMovers.jsx:8:// ==== [BLOC: HELPERS] =======================================================
src/components/TopMovers.jsx:18:// ==== [BLOC: MODALE ACHAT] ==================================================
src/components/TopMovers.jsx:44:// ==== [BLOC: COMPOSANT PRINCIPAL] ===========================================
src/components/TopMovers.jsx:54:  // --- États modales ---
src/components/TopMovers.jsx:63:  // Adaptation des positions pour la SellModal (attend "quantity")
src/components/TopMovers.jsx:72:  // --- Calcul gainers/losers 5 min ---
src/components/TopMovers.jsx:86:  // --- Actions ---
src/components/TopMovers.jsx:109:  // --- Helpers UI ---
src/components/TopMovers.jsx:165:      {/* ==== [BLOC: GAINERS] ============================================== */}
src/components/TopMovers.jsx:185:      {/* ==== [BLOC: LOSERS] =============================================== */}
src/components/TopMovers.jsx:205:      {/* ==== [BLOC: MODALES] ============================================== */}
src/components/TopMovers.jsx:232:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/components/TopMovers.jsx:233:// - Refonte complète pour cohérence 100% Binance et PortfolioContext.
src/components/TopMovers.jsx:234:// - Affiche Top 5 hausses / baisses sur 5 min (priceChange5m) avec prix courants.
src/components/TopMovers.jsx:235:// - Boutons ACHAT (montant USD) / VENTE (SellModal) activés immédiat via positionsMap.
src/components/TopMovers.jsx:236:// - Liens TradingView, indicateur ● si position ouverte, tables scrollables.
src/components/TopMovers.jsx:237:// - Annotations de blocs ajoutées pour modifications ciblées.
src/components/SellModal.jsx:1:// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/components/SellModal.jsx
src/components/SellModal.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/components/SellModal.jsx:6:// ==== [BLOC: HELPERS] =======================================================
src/components/SellModal.jsx:14:// ==== [BLOC: COMPOSANT] =====================================================
src/components/SellModal.jsx:15:/**
src/components/SellModal.jsx:75:        {/* Titre */}
src/components/SellModal.jsx:93:        {/* Détails position */}
src/components/SellModal.jsx:137:        {/* Contrôles de vente */}
src/components/SellModal.jsx:174:              Produit de vente estimé:&nbsp;
src/components/SellModal.jsx:186:        {/* Actions */}
src/components/SellModal.jsx:217:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/components/SellModal.jsx:218:// - Composant SellModal complet et autonome, conforme aux props utilisées dans Trading / Profile / TopMovers / CryptoList.
src/components/SellModal.jsx:219:// - Slider 0..100%, bouton MAX, calculs d’estimation (proceeds & PnL) affichés en direct.
src/components/SellModal.jsx:220:// - Tolérant aux positions sans "quantity" (fallback sur "qty") et aux valeurs manquantes.
src/components/SellModal.jsx:221:// - Styles inline sobres, fond modal semi-transparent, boutons cohérents.
src/components/SellModal.jsx:222:// - Annotations de blocs pour modifications ciblées.
src/components/Navbar.jsx:1:// FICHIER: ~/Documents/utc-app-full/src/components/Navbar.jsx
src/components/Navbar.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/components/Navbar.jsx:9:// ==== [BLOC: COMPOSANT] =====================================================
src/components/Navbar.jsx:38:      {/* ==== [BLOC: BARRE SUPÉRIEURE] ===================================== */}
src/components/Navbar.jsx:78:      {/* ==== [BLOC: PANNEAU LATÉRAL] ====================================== */}
src/components/Navbar.jsx:98:        {/* Overlay */}
src/components/Navbar.jsx:112:        {/* Contenu */}
src/components/Navbar.jsx:129:                🚨 Signaux
src/components/Navbar.jsx:187:      {/* ==== [BLOC: CSS INLINE] =========================================== */}
src/components/Navbar.jsx:200:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/components/Navbar.jsx:201:// - Ajout de useRef à l'import React (corrige "useRef is not defined").
src/components/Navbar.jsx:202:// - Suppression de useContext importé mais non utilisé.
src/components/Navbar.jsx:203:// - Blocs d’annotations maintenus pour une édition ciblée.
src/components/CryptoList.jsx:1:// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/components/CryptoList.jsx
src/components/CryptoList.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/components/CryptoList.jsx:8:// ==== [BLOC: HELPERS] =======================================================
src/components/CryptoList.jsx:18:// ==== [BLOC: MODALE ACHAT] ==================================================
src/components/CryptoList.jsx:44:// ==== [BLOC: COMPOSANT PRINCIPAL] ===========================================
src/components/CryptoList.jsx:55:  // --- États modales ---
src/components/CryptoList.jsx:64:  // Adaptation des positions pour la SellModal (attend "quantity")
src/components/CryptoList.jsx:73:  // --- Helpers UI ---
src/components/CryptoList.jsx:96:  // Tri simple par symbole
src/components/CryptoList.jsx:107:  // Styles
src/components/CryptoList.jsx:179:      {/* ==== [BLOC: MODALES] ============================================== */}
src/components/CryptoList.jsx:206:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/components/CryptoList.jsx:207:// - Bascule 100% Binance (affichage des prix depuis currentPrices).
src/components/CryptoList.jsx:208:// - ACHAT en USD (modale dédiée) + VENTE (SellModal) actives immédiatement via positionsMap.
src/components/CryptoList.jsx:209:// - Affichage watchlist unifiée avec variations 5 min (snapshot interne du contexte).
src/components/CryptoList.jsx:210:// - Tables scrollables, liens TradingView, indicateur ● si position ouverte.
src/components/CryptoList.jsx:211:// - Annotations de blocs pour modifications ciblées.
src/hooks/useUserStorage.js:5:  const uid = user?.uid;
src/hooks/useUserStorage.js:7:  // 💥 Si pas de user (encore), évite l'erreur
src/hooks/useUserStorage.js:8:  if (!uid) return [fallback, () => {}];
src/hooks/useUserStorage.js:10:  const fullKey = `${key}-${uid}`;
src/main.jsx:1:// src/main.jsx
src/App.jsx:1:// src/App.jsx
src/pages/Trading.old.jsx:1:// src/pages/Trading.jsx
src/pages/Trading.old.jsx:21:  // Ouvre la fenêtre de vente avec slider %
src/pages/Trading.old.jsx:29:  // Confirme la vente
src/pages/Trading.old.jsx:38:  // Fetch + fusion + déduplication
src/pages/Trading.old.jsx:63:  // Tri custom
src/pages/Trading.old.jsx:74:  // Styles & helpers
src/pages/Trading.old.jsx:88:  // Portefeuille
src/pages/Trading.old.jsx:95:  // Achat rapide
src/pages/Trading.old.jsx:108:      {/* Récap */}
src/pages/Trading.old.jsx:110:        <strong>Portefeuille :</strong>&nbsp;
src/pages/Trading.old.jsx:117:      {/* Actions */}
src/pages/Trading.old.jsx:134:          onClick={() => { reset(); alert("Portefeuille réinitialisé à 10 000 $"); }}
src/pages/Trading.old.jsx:148:      {/* Last update */}
src/pages/Trading.old.jsx:155:      {/* Top5 hausses */}
src/pages/Trading.old.jsx:221:      {/* Top5 baisses */}
src/pages/Trading.old.jsx:287:      {/* Autres cryptos */}
src/pages/TradingTiles.jsx:4:// Liste cohérente avec les appels existants (41 tickers)
src/pages/TradingTiles.jsx:7:  "UNI","LINK","XLM","ATOM","ETC","FIL","APT","ARB","OP","NEAR","SUI","INJ","TWT",
src/pages/TradingTiles.jsx:38:    // eslint-disable-next-line react-hooks/exhaustive-deps
src/pages/TradingTiles.jsx:91:  // placeholders variations (seront branchées quand l’API renverra les deltas serveur)
src/pages/Profile.jsx:1:// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/pages/Profile.jsx
src/pages/Profile.jsx:3:// ==== [BLOC: IMPORTS] =======================================================
src/pages/Profile.jsx:8:// ==== [BLOC: HELPERS] =======================================================
src/pages/Profile.jsx:23:// ==== [BLOC: COMPOSANT] =====================================================
src/pages/Profile.jsx:31:  // ---- Début du PT (persisté localement) -----------------------------------
src/pages/Profile.jsx:40:  // ---- Sell modal state -----------------------------------------------------
src/pages/Profile.jsx:45:  // Adaptation des positions pour la SellModal (attend "quantity")
src/pages/Profile.jsx:51:  // ---- Bouton Update Prices Now --------------------------------------------
src/pages/Profile.jsx:56:  // ---- RESET PT (remet cash à 10k, garde l'historique) ---------------------
src/pages/Profile.jsx:64:  // ---- Ouvrir / Confirmer vente -------------------------------------------
src/pages/Profile.jsx:75:  // ---- Table style ----------------------------------------------------------
src/pages/Profile.jsx:81:  // ---- Dérivés pour affichage ----------------------------------------------
src/pages/Profile.jsx:110:        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
src/pages/Profile.jsx:114:      {/* ==== [BLOC: Titre + Début du PT + Reset] ========================== */}
src/pages/Profile.jsx:130:      {/* ==== [BLOC: ENCARt BILAN] ========================================= */}
src/pages/Profile.jsx:142:        {/* Ordre EXACT demandé */}
src/pages/Profile.jsx:183:      {/* ==== [BLOC: POSITIONS EN COURS] =================================== */}
src/pages/Profile.jsx:238:      {/* ==== [BLOC: HISTORIQUE] =========================================== */}
src/pages/Profile.jsx:295:      {/* ==== [BLOC: MODALE VENTE] ========================================= */}
src/pages/Profile.jsx:313:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/pages/Profile.jsx:314:// - Ajout du "Début du PT" (persisté localStorage) + bouton "RESET PT TO 10000$" juste à côté.
src/pages/Profile.jsx:315:// - Encart "Bilan" avec ordre exact demandé + bouton "UPDATE PRICES NOW" à côté du titre.
src/pages/Profile.jsx:316:// - Tableau "Positions en cours" complet: Crypto, Date/heure d’achat, ID, Montant investi, Prix d’achat, Prix actuel (coloré), Résultat % et $, Bouton vente.
src/pages/Profile.jsx:317:// - Historique scrollable (colonnes: ID, date/heure, crypto, type, investissement $, prix d’achat, prix de vente, résultat % et $).
src/pages/Profile.jsx:318:// - Boutons "VENTE" actifs via SellModal, avec slider % et bouton MAX (gérés par SellModal).
src/pages/Profile.jsx:319:// - Tables avec overflow horizontal pour éviter les coupes + formats robustes (USD, %, prix).
src/pages/Profile.jsx:320:// - Aucun appel CryptoCompare: affichage basé sur currentPrices (alimentés par Binance via PortfolioContext).
src/pages/Admin.jsx:94:        {/* Utilisateurs */}
src/pages/Admin.jsx:129:      {/* Message Admin */}
src/pages/Analysis.jsx:93:        label: "Signaux achat",
src/pages/Analysis.jsx:102:        label: "Signaux vente",
src/pages/Analysis.jsx:139:      {/* Sélection crypto et période */}
src/pages/Analysis.jsx:162:      {/* Graphique */}
src/pages/Analysis.jsx:173:      {/* Légende */}
src/pages/Analysis.jsx:189:      {/* Commentaire IA */}
src/pages/IATrader.jsx:14:  // ████████████████████████████████
src/pages/IATrader.jsx:15:  // 🧠 Logique d'état local
src/pages/IATrader.jsx:65:      {/* ███ Bloc Sticky Titre / Logs / Actions */}
src/pages/IATrader.jsx:135:      {/* 📊 Bilan */}
src/pages/IATrader.jsx:161:      {/* 📌 Positions */}
src/pages/IATrader.jsx:202:      {/* Historique */}
src/pages/IATrader.jsx:237:      {/* 🧠 Archives anciens traders */}
src/pages/IATrader.jsx:275:      {/* 🧾 Modale de vente IA (si activée plus tard) */}
src/pages/IATrader.jsx:284:        onConfirm={() => {}} // tu peux brancher ici une future logique
src/pages/Signals.jsx:6:// ████████ 🧠 COMPOSANT PRINCIPAL ████████
src/pages/Signals.jsx:11:  // 🎯 Formateur de nombre
src/pages/Signals.jsx:14:  // 🎨 Couleur par type de signal
src/pages/Signals.jsx:22:  // 🎨 Couleur par niveau de risque
src/pages/Signals.jsx:30:  // 🔁 Lecture logs serveur API (version JSON)
src/pages/Signals.jsx:46:  // 🔁 Lecture signaux Firestore
src/pages/Signals.jsx:63:  // 🚀 Initialisation
src/pages/Signals.jsx:74:  // ████████ RENDU VISUEL ████████
src/pages/Signals.jsx:87:      {/* 🧱 BARRE TITRE */}
src/pages/Signals.jsx:98:        <h1>🚨 Signaux IA</h1>
src/pages/Signals.jsx:101:      {/* 🧾 LOGS CONSOLE */}
src/pages/Signals.jsx:122:      {/* 📊 BLOC SIGNAUX */}
src/pages/Signals.jsx:147:                {/* 🧠 HEADER */}
src/pages/Signals.jsx:156:                {/* 📊 SCORE */}
src/pages/Signals.jsx:164:                {/* 📋 EXPLICATIONS */}
src/pages/Signals.jsx:179:                {/* 🔗 TRADINGVIEW */}
src/pages/Login.jsx:1:// src/pages/Login.jsx
src/pages/Login.jsx:24:      const docSnap = await getDoc(doc(db, "users", user.uid));
src/pages/Login.jsx:66:            required
src/pages/Login.jsx:74:            required
src/pages/Register.jsx:1:// src/pages/Register.jsx
src/pages/Register.jsx:23:      await setDoc(doc(db, "users", newUser.uid), {
src/pages/Register.jsx:68:              required
src/pages/Register.jsx:79:              required
src/pages/Register.jsx:101:          Une fois votre compte créé, il devra être validé par l’administrateur avant que vous puissiez vous connecter.
src/pages/Trading.jsx:1:// FICHIER: src/pages/Trading.jsx
src/pages/Trading.jsx:10:  "ARB","OP","NEAR","SUI","INJ","TWT","RUNE","PEPE","GMT","LDO",
src/pages/Trading.jsx:95:        <span className="tr-note">1 ligne par crypto, fond verre dépoli, variations 1m/5m/10m/1h/6h/1d/7d</span>
src/pages/Home.jsx:57:        {/* ✅ RENDU PLUS PETIT ICI */}
src/pages/Home.jsx:66:          maxWidth: "90px", // ← ici la largeur réduite
src/pages/Home.jsx:81:          title: "💼 Portefeuille virtuel",
src/pages/Home.jsx:104:        <Link to="/signals" style={linkBox}>📡 Signaux<br />Opportunités IA</Link>
src/pages/Home.jsx:125:// 🎨 STYLES
src/pages/Home.jsx:144:  width: "250px", // ← taille fixe des 2 encarts principaux (réduit)
src/firebase.js:1:// FICHIER: ~/Documents/utc-app-full/src/firebase.js
src/firebase.js:3:// ==== [BLOC: IMPORTS] =======================================================
src/firebase.js:8:// ==== [BLOC: CONFIG] ========================================================
src/firebase.js:18:// ==== [BLOC: GUARD / DIAGNOSTIC] ===========================================
src/firebase.js:19:// Masque les valeurs pour log (évite fuite complète en console)
src/firebase.js:22:  // Log compact pour t’indiquer quoi manque au build
src/firebase.js:24:    "[Firebase] Variables manquantes au build:",
src/firebase.js:34:  throw new Error("Firebase config invalide: VITE_FIREBASE_API_KEY absente côté frontend build");
src/firebase.js:37:// ==== [BLOC: INIT] ==========================================================
src/firebase.js:42:// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
src/firebase.js:43:// - Lecture exclusive via import.meta.env.VITE_* (obligatoire avec Vite).
src/firebase.js:44:// - Guard qui throw si apiKey manquante et log masqué pour diagnostiquer.
```

## Design tokens & styled usage
```
```

## Usages d'assets (images, backgrounds) dans le code
```
src/index.css:1:html,body{margin:0;padding:0;background:#111;color:#eee;font-family:sans-serif;}
src/index.css:4:tr:nth-child(even){background:#1b1b1b;}
src/styles/trading.css:41:  background: var(--glass-bg);
src/styles/trading.css:83:  background: rgba(0,0,0,0.18);
src/styles/trading.css:119:  background:#1a73e8;
src/styles/trading.css:124:  background: rgba(255,255,255,0.12);
src/components/TopMovers.jsx:22:    <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000 }}>
src/components/TopMovers.jsx:23:      <div style={{ width: "min(520px, 92vw)", margin: "10% auto", background: "#1f1f1f", borderRadius: 8, color: "#fff", padding: "1.25rem 1.25rem 1rem" }}>
src/components/TopMovers.jsx:32:          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #333", background: "#121212", color: "#fff" }}
src/components/TopMovers.jsx:36:          <button onClick={onClose} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}>Annuler</button>
src/components/TopMovers.jsx:37:          <button onClick={onConfirm} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirmer l’achat</button>
src/components/TopMovers.jsx:113:  const thStyle = { textAlign: "left", padding: "10px 12px", background: "#232323", position: "sticky", top: 0 };
src/components/TopMovers.jsx:132:                style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}
src/components/TopMovers.jsx:139:                  style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#dc3545", color: "#fff", cursor: "pointer", fontWeight: 600 }}
src/components/TopMovers.jsx:166:      <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/components/TopMovers.jsx:186:      <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/components/SellModal.jsx:62:    <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000 }}>
src/components/SellModal.jsx:67:          background: "#1f1f1f",
src/components/SellModal.jsx:84:              background: "#2b2b2b",
src/components/SellModal.jsx:99:            background: "#181818",
src/components/SellModal.jsx:148:                background: "#3a3a3a",
src/components/SellModal.jsx:190:            style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}
src/components/SellModal.jsx:201:              background: !pos || !qty || percent <= 0 ? "#2f4f2f" : "#dc3545",
src/components/Navbar.jsx:58:            background: "transparent",
src/components/Navbar.jsx:87:          backgroundImage: 'url("/backgrounds/menubackground.png")',
src/components/Navbar.jsx:149:                    background: "red",
src/components/Navbar.jsx:170:                  background: "transparent",
src/components/CryptoList.jsx:22:    <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000 }}>
src/components/CryptoList.jsx:23:      <div style={{ width: "min(520px, 92vw)", margin: "10% auto", background: "#1f1f1f", borderRadius: 8, color: "#fff", padding: "1.25rem 1.25rem 1rem" }}>
src/components/CryptoList.jsx:32:          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #333", background: "#121212", color: "#fff" }}
src/components/CryptoList.jsx:36:          <button onClick={onClose} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}>Annuler</button>
src/components/CryptoList.jsx:37:          <button onClick={onConfirm} style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirmer l’achat</button>
src/components/CryptoList.jsx:110:  const th = { textAlign: "left", padding: "10px 12px", background: "#232323", position: "sticky", top: 0 };
src/components/CryptoList.jsx:114:    <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/components/CryptoList.jsx:145:                        style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#198754", color: "#fff", cursor: "pointer", fontWeight: 600 }}
src/components/CryptoList.jsx:152:                          style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#dc3545", color: "#fff", cursor: "pointer", fontWeight: 600 }}
src/components/LogViewer.jsx:33:      background: "#111",
src/pages/TradingTiles.jsx:59:          background: "#ffe9e9",
src/pages/TradingTiles.jsx:102:        background: "#fff",
src/pages/TradingTiles.jsx:171:  background: "#1a73e8",
src/pages/TradingTiles.jsx:180:  background: "#f6f6f6",
src/pages/Profile.jsx:78:  const th = { textAlign: "left", padding: "10px 12px", background: "#232323", position: "sticky", top: 0 };
src/pages/Profile.jsx:104:        backgroundImage: 'url("/backgrounds/homebackground.png")',
src/pages/Profile.jsx:124:          style={{ padding: "8px 12px", borderRadius: 6, background: "#6c757d", border: "none", color: "#fff", cursor: "pointer" }}
src/pages/Profile.jsx:136:            style={{ padding: "8px 12px", borderRadius: 6, background: "#0d6efd", border: "none", color: "#fff", cursor: "pointer" }}
src/pages/Profile.jsx:144:          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:149:          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:154:          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:159:          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:164:          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:169:          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:174:          <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:186:        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Profile.jsx:221:                          style={{ padding: "6px 10px", border: "none", borderRadius: 4, background: "#dc3545", color: "#fff", cursor: "pointer", fontWeight: 600 }}
src/pages/Profile.jsx:241:        <div style={{ background: "#1b1b1b", padding: 12, borderRadius: 8, border: "1px solid #2a2a2a" }}>
src/pages/Admin.jsx:76:      backgroundImage: 'url("/backgrounds/homebackground.png")',
src/pages/Admin.jsx:112:                <tr key={u.id} style={{ background: i % 2 === 0 ? "#222" : "#2a2a2a" }}>
src/pages/Analysis.jsx:129:      backgroundImage: 'url("/backgrounds/homebackground.png")',
src/pages/Analysis.jsx:147:        <select value={symbol} onChange={e => setSymbol(e.target.value)} style={{ padding: "0.5rem", marginRight: "1rem", background: "#222", color: "#eee", border: "1px solid #444" }}>
src/pages/Analysis.jsx:154:            background: p === period ? "#10b981" : "#222",
src/pages/IATrader.jsx:57:      backgroundImage: 'url("/backgrounds/iatraderbackground.png")',
src/pages/Signals.jsx:77:      backgroundImage: 'url("/backgrounds/homebackground.png")',
src/pages/Login.jsx:39:      backgroundImage: 'url("/backgrounds/homebackground.png")',
src/pages/Register.jsx:39:      backgroundImage: 'url("/backgrounds/homebackground.png")',
src/pages/Trading.jsx:99:        <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,0,0,0.08)" }}>
src/pages/Home.jsx:128:  backgroundImage: 'url("/backgrounds/homebackground.png")',
```

## Arborescence pages/composants JS/JSX
```
src/App.jsx
src/components/CryptoList.jsx
src/components/LogViewer.jsx
src/components/Navbar.jsx
src/components/PrivateRoute.jsx
src/components/SellModal.jsx
src/components/SellModalIA.jsx
src/components/TopMovers.jsx
src/components/TradingTile.jsx
src/context/AdminContext.jsx
src/context/AuthContext.jsx
src/context/IATraderContext.jsx
src/context/PortfolioContext.jsx
src/context/UserContext.jsx
src/firebase.js
src/hooks/useUserStorage.js
src/lib/api.js
src/lib/apiClient.js
src/lib/config.js
src/main.jsx
src/pages/Admin.jsx
src/pages/Analysis.jsx
src/pages/Home.jsx
src/pages/IATrader.jsx
src/pages/Login.jsx
src/pages/Profile.jsx
src/pages/Register.jsx
src/pages/Signals.jsx
src/pages/Trading.jsx
src/pages/Trading.old.jsx
src/pages/TradingTiles.jsx
src/utils/api.js
src/utils/fetchHistoricalPrices.js
src/utils/fetchPrices.js
src/utils/fetchSignals.js
src/utils/firestoreIATrader.js
src/utils/firestorePortfolio.js
src/utils/firestoreSignals.js
src/utils/iaSignals.js
src/utils/portfolio.js
```

## Styles Trading (classes tr-*) et pages clés
```
src/styles/trading.css:12:.tr-wrap{
src/styles/trading.css:17:.tr-header{
src/styles/trading.css:24:.tr-note{
src/styles/trading.css:29:.tr-list{
src/styles/trading.css:35:.tr-row{
src/styles/trading.css:49:.tr-sym{
src/styles/trading.css:57:.tr-sym .pair{
src/styles/trading.css:63:.tr-price{
src/styles/trading.css:68:.tr-vars{
src/styles/trading.css:74:.tr-chip{
src/styles/trading.css:86:.tr-chip .k{
src/styles/trading.css:90:.tr-chip .v.up{
src/styles/trading.css:94:.tr-chip .v.down{
src/styles/trading.css:98:.tr-chip .v.neutral{
src/styles/trading.css:102:.tr-actions{
src/styles/trading.css:108:.tr-btn{
src/styles/trading.css:118:.tr-btn.buy{
src/styles/trading.css:123:.tr-btn.sell{
src/styles/trading.css:130:  .tr-row{
src/styles/trading.css:135:  .tr-sym{ grid-area: sym; }
src/styles/trading.css:136:  .tr-price{ grid-area: price; justify-self:end; }
src/styles/trading.css:137:  .tr-vars{ grid-area: vars; grid-template-columns: repeat(4, minmax(64px,1fr)); }
src/styles/trading.css:138:  .tr-actions{ grid-area: act; justify-content:stretch; }
src/styles/trading.css:142:  .tr-vars{ grid-template-columns: repeat(3, minmax(64px,1fr)); }
src/pages/Trading.jsx:48:    <div className="tr-chip">
src/pages/Trading.jsx:58:    <li className="tr-row">
src/pages/Trading.jsx:59:      <div className="tr-sym">
src/pages/Trading.jsx:63:      <div className="tr-price">{price != null ? formatUSD(price) : loading ? "—" : "—"}</div>
src/pages/Trading.jsx:64:      <div className="tr-vars">
src/pages/Trading.jsx:69:      <div className="tr-actions">
src/pages/Trading.jsx:70:        <button className="tr-btn buy" disabled>Acheter</button>
src/pages/Trading.jsx:71:        <button className="tr-btn sell" disabled>Vendre</button>
src/pages/Trading.jsx:92:    <div className="tr-wrap">
src/pages/Trading.jsx:93:      <div className="tr-header">
src/pages/Trading.jsx:95:        <span className="tr-note">1 ligne par crypto, fond verre dépoli, variations 1m/5m/10m/1h/6h/1d/7d</span>
src/pages/Trading.jsx:104:      <ul className="tr-list">
src/pages/Trading.old.jsx:1:// src/pages/Trading.jsx
src/pages/Trading.old.jsx:5:import { PortfolioContext } from "../context/PortfolioContext";
src/pages/Trading.old.jsx:7:const Trading = () => {
src/pages/Trading.old.jsx:8:  const { portfolio = {}, buy, sell, reset } = useContext(PortfolioContext);
src/pages/Trading.old.jsx:9:  const positions = portfolio.positions || {};
src/pages/Trading.old.jsx:89:  const cash              = portfolio.cash              ?? 0;
src/pages/Trading.old.jsx:90:  const invested          = portfolio.invested          ?? 0;
src/pages/Trading.old.jsx:91:  const pnlPercent        = portfolio.pnlPercent        ?? 0;
src/pages/Trading.old.jsx:92:  const cumulativeUsd     = portfolio.cumulativeUsd     ?? 0;
src/pages/Trading.old.jsx:93:  const cumulativePercent = portfolio.cumulativePercent ?? 0;
src/pages/Trading.old.jsx:105:        🪙 Trading
src/pages/Trading.old.jsx:331:                        href={`https://www.tradingview.com/symbols/${c.symbol}USD`}
src/pages/Trading.old.jsx:480:export default Trading;
src/pages/TradingTiles.jsx:44:export default function TradingTiles() {
src/pages/Profile.jsx:5:import { PortfolioContext } from "../context/PortfolioContext";
src/pages/Profile.jsx:26:    portfolioName, cash, positions, history, currentPrices,
src/pages/Profile.jsx:28:    totalProfit, totalProfitPercent, updatePrices, resetPortfolio, sellPosition, totalValue,
src/pages/Profile.jsx:29:  } = useContext(PortfolioContext);
src/pages/Profile.jsx:58:    resetPortfolio();
src/pages/Profile.jsx:117:          Profile — <span style={{ color: "#9ecbff" }}>{portfolioName}</span>
src/pages/Profile.jsx:320:// - Aucun appel CryptoCompare: affichage basé sur currentPrices (alimentés par Binance via PortfolioContext).
src/pages/Analysis.jsx:28:const Analysis = () => {
src/pages/Analysis.jsx:63:  const signals = useMemo(() => {
src/pages/Analysis.jsx:94:        data: signals.filter(s => s.type === "buy").map(s => ({ x: s.time, y: null })),
src/pages/Analysis.jsx:103:        data: signals.filter(s => s.type === "sell").map(s => ({ x: s.time, y: null })),
src/pages/Analysis.jsx:111:  }), [symbol, dataPoints, signals]);
src/pages/Analysis.jsx:206:export default Analysis;
src/pages/Signals.jsx:3:import { fetchLatestSignals } from "../utils/firestoreSignals"; // 🔁 Firestore
src/pages/Signals.jsx:7:const Signals = () => {
src/pages/Signals.jsx:8:  const [signals, setSignals] = useState([]);
src/pages/Signals.jsx:33:    const res = await fetch(((import.meta.env.VITE_API_BASE||"${API_BASE_URL}").replace(/\/+$/,""))+"/get-latest-signals");
src/pages/Signals.jsx:47:  const loadSignals = async () => {
src/pages/Signals.jsx:49:      const data = await fetchLatestSignals(); // 🔥 Firebase Firestore
src/pages/Signals.jsx:56:      setSignals(sorted);
src/pages/Signals.jsx:59:      setSignals([]); // Fallback vide
src/pages/Signals.jsx:65:    loadSignals();
src/pages/Signals.jsx:68:      loadSignals();
src/pages/Signals.jsx:130:        {signals.length === 0 ? (
src/pages/Signals.jsx:134:            {signals.map((s, i) => (
src/pages/Signals.jsx:179:                {/* 🔗 TRADINGVIEW */}
src/pages/Signals.jsx:182:                    href={`https://www.tradingview.com/symbols/${s.crypto?.replace("/", "")}USD`}
src/pages/Signals.jsx:187:                    → Voir sur TradingView
src/pages/Signals.jsx:199:export default Signals;
src/pages/Trading.jsx:1:// FICHIER: src/pages/Trading.jsx
src/pages/Trading.jsx:3:import "../styles/trading.css";
src/pages/Trading.jsx:87:export default function Trading() {
src/pages/Trading.jsx:94:        <h2>Trading</h2>
src/pages/Home.jsx:4:import { PortfolioContext } from "../context/PortfolioContext";
src/pages/Home.jsx:10:    portfolioName, cash, positions, history, currentPrices,
src/pages/Home.jsx:11:  } = useContext(PortfolioContext);
src/pages/Home.jsx:82:          name: portfolioName,
src/pages/Home.jsx:88:          to: "/trading",
src/pages/Home.jsx:103:        <Link to="/analysis" style={linkBox}>📊 Analyse<br />Voir les tendances</Link>
src/pages/Home.jsx:104:        <Link to="/signals" style={linkBox}>📡 Signaux<br />Opportunités IA</Link>
src/components/TopMovers.jsx:5:import { PortfolioContext } from "../context/PortfolioContext";
src/components/TopMovers.jsx:52:  } = useContext(PortfolioContext);
src/components/TopMovers.jsx:151:              href={`https://www.tradingview.com/symbols/${sym}USD`}
src/components/TopMovers.jsx:233:// - Refonte complète pour cohérence 100% Binance et PortfolioContext.
src/components/TopMovers.jsx:236:// - Liens TradingView, indicateur ● si position ouverte, tables scrollables.
src/components/SellModal.jsx:218:// - Composant SellModal complet et autonome, conforme aux props utilisées dans Trading / Profile / TopMovers / CryptoList.
src/components/TradingTile.jsx:4:export default function TradingTile({ symbol, price, onTraded }) {
src/components/Navbar.jsx:74:          Ultimate Trading Champions
src/components/Navbar.jsx:119:              <Link to="/trading" onClick={handleLinkClick} style={linkStyle}>
src/components/Navbar.jsx:120:                💸 Trading
src/components/Navbar.jsx:125:              <Link to="/analysis" onClick={handleLinkClick} style={linkStyle}>
src/components/Navbar.jsx:128:              <Link to="/signals" onClick={handleLinkClick} style={linkStyle}>
src/components/CryptoList.jsx:5:import { PortfolioContext } from "../context/PortfolioContext";
src/components/CryptoList.jsx:53:  } = useContext(PortfolioContext);
src/components/CryptoList.jsx:164:                      href={`https://www.tradingview.com/symbols/${sym}USD`}
src/components/CryptoList.jsx:210:// - Tables scrollables, liens TradingView, indicateur ● si position ouverte.
```
