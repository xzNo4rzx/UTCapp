// src/utils/portfolio.js

// État du portefeuille simulé (à adapter ou charger dynamiquement si besoin)
const _portfolio = {
    "BTC/USD": { entry: 60000, current: 60000, amount: 0.05 },
    "ETH/USD": { entry: 3000, current: 3000, amount: 0.3 },
    // … ajoute ici tes autres positions
};

/**
 * Retourne un résumé texte du portefeuille, identique à ta version Python.
 * Chaque ligne : PAIRE | PnL : xx.xx% | Qty: y.yy
 */
export function get_portfolio_status() {
    const lines = ["💼 Portefeuille simulé"];
    for (const [pair, data] of Object.entries(_portfolio)) {
        const pnl = ((data.current - data.entry) / data.entry) * 100;
        lines.push(`${pair} | PnL : ${pnl.toFixed(2)}% | Qty: ${data.amount}`);
    }
    return lines.join("\n");
}