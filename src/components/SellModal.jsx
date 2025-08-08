// FICHIER: ~/Documents/utc-app-full/utc-app-full/src/components/SellModal.jsx

// ==== [BLOC: IMPORTS] =======================================================
import React from "react";

// ==== [BLOC: HELPERS] =======================================================
const fmtPrice = (n) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
};

// ==== [BLOC: COMPOSANT] =====================================================
/**
 * Props attendues:
 * - show: bool
 * - symbol: string (e.g., "BTC")
 * - price: number (prix actuel)
 * - percent: number (0..100)
 * - positions: array de positions [{ id, symbol, qty, buyPrice, buyAt, ... }], avec "quantity" (alias qty) possible
 * - onClose(): void
 * - onConfirm(): void  --> déclenche la vente avec "percent" courant (géré par parent)
 * - onChangePercent(event): void (ex: (e)=> setSellPercent(Number(e.target.value)))
 * - onSetMax(): void   --> place 100%
 */
const SellModal = ({
  show,
  symbol,
  price,
  percent,
  positions,
  onClose,
  onConfirm,
  onChangePercent,
  onSetMax,
}) => {
  if (!show) return null;

  const sym = (symbol || "").toUpperCase();
  const pos = Array.isArray(positions)
    ? positions.find((p) => (p.symbol || "").toUpperCase() === sym)
    : null;

  const qty = typeof pos?.quantity === "number" ? pos.quantity : pos?.qty || 0;
  const investedUSD =
    (typeof pos?.buyPrice === "number" ? pos.buyPrice : 0) *
    (typeof qty === "number" ? qty : 0);

  const proceedsNow =
    (typeof price === "number" ? price : 0) *
    (typeof qty === "number" ? (percent / 100) * qty : 0);

  const pnlUSD =
    (typeof price === "number" && typeof pos?.buyPrice === "number" && typeof qty === "number")
      ? (price - pos.buyPrice) * (qty * (percent / 100))
      : 0;

  const resColor = pnlUSD >= 0 ? "lightgreen" : "salmon";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 1000 }}>
      <div
        style={{
          width: "min(560px, 92vw)",
          margin: "8% auto",
          background: "#1f1f1f",
          borderRadius: 10,
          color: "#fff",
          padding: "1.25rem 1.25rem 1rem",
          border: "1px solid #2a2a2a",
          boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
        }}
      >
        {/* Titre */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ margin: 0 }}>VENTE — {sym}</h3>
          <button
            onClick={onClose}
            style={{
              padding: "6px 10px",
              border: "1px solid #3a3a3a",
              borderRadius: 6,
              background: "#2b2b2b",
              color: "#ddd",
              cursor: "pointer",
            }}
          >
            Fermer
          </button>
        </div>

        {/* Détails position */}
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: "#181818",
            border: "1px solid #2a2a2a",
          }}
        >
          {pos ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: "#9aa0a6" }}>ID position</div>
                <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{pos.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9aa0a6" }}>Date & heure d'achat</div>
                <div>{pos.buyAt ? new Date(pos.buyAt).toLocaleString() : "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9aa0a6" }}>Quantité</div>
                <div style={{ fontWeight: 600 }}>{qty ?? 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9aa0a6" }}>Investi ($)</div>
                <div style={{ fontWeight: 600 }}>{investedUSD ? `$${investedUSD.toFixed(2)}` : "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9aa0a6" }}>Prix d'achat</div>
                <div>{fmtPrice(pos.buyPrice)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9aa0a6" }}>Prix actuel</div>
                <div>{fmtPrice(price)}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: "#bbb" }}>
              Aucune position ouverte trouvée pour <b>{sym}</b>.
            </div>
          )}
        </div>

        {/* Contrôles de vente */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <label style={{ display: "block" }}>Pourcentage à vendre</label>
            <button
              onClick={onSetMax}
              style={{
                marginLeft: "auto",
                padding: "6px 10px",
                border: "none",
                borderRadius: 6,
                background: "#3a3a3a",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              MAX
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={typeof percent === "number" ? percent : 100}
            onChange={onChangePercent}
            style={{ width: "100%" }}
          />

          <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, color: "#9aa0a6" }}>
              Pourcentage sélectionné:&nbsp;
              <b style={{ color: "#fff" }}>{typeof percent === "number" ? percent : 100}%</b>
            </div>
            <div style={{ fontSize: 14, color: "#9aa0a6" }}>
              Produit de vente estimé:&nbsp;
              <b style={{ color: "#fff" }}>
                {proceedsNow ? `$${proceedsNow.toFixed(2)}` : "—"}
              </b>
            </div>
            <div style={{ fontSize: 14, color: "#9aa0a6" }}>
              Résultat estimé:&nbsp;
              <b style={{ color: resColor }}>{pnlUSD ? `$${pnlUSD.toFixed(2)}` : "—"}</b>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 14px", border: "none", borderRadius: 6, background: "#555", color: "#fff", cursor: "pointer" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!pos || !qty || percent <= 0}
            style={{
              padding: "10px 14px",
              border: "none",
              borderRadius: 6,
              background: !pos || !qty || percent <= 0 ? "#2f4f2f" : "#dc3545",
              color: "#fff",
              cursor: !pos || !qty || percent <= 0 ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            Confirmer la vente
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellModal;

// ==== [RÉSUMÉ DES CORRECTIONS] ==============================================
// - Composant SellModal complet et autonome, conforme aux props utilisées dans Trading / Profile / TopMovers / CryptoList.
// - Slider 0..100%, bouton MAX, calculs d’estimation (proceeds & PnL) affichés en direct.
// - Tolérant aux positions sans "quantity" (fallback sur "qty") et aux valeurs manquantes.
// - Styles inline sobres, fond modal semi-transparent, boutons cohérents.
// - Annotations de blocs pour modifications ciblées.