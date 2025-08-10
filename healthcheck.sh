#!/usr/bin/env bash
set -euo pipefail

API=${API:-https://utc-api.onrender.com}

green(){ printf "\033[32m%s\033[0m\n" "$*"; }
red(){ printf "\033[31m%s\033[0m\n" "$*"; }
sec(){ echo; printf "— %s —\n" "$*"; }

fail=0

sec "1) /ping"
if curl -sS "${API}/ping" | jq . >/dev/null 2>&1; then
  green "✅ ping OK"
else
  red "❌ ping KO"; fail=1
fi

sec "2) /prices"
PRICES=$(curl -sS "${API}/prices?symbols=BTC,ETH,SOL" || true)
if echo "$PRICES" | jq -e '.prices.BTC and .prices.ETH' >/dev/null 2>&1; then
  echo "$PRICES" | jq '{symbols, prices:{BTC:.prices.BTC, ETH:.prices.ETH, SOL:.prices.SOL}}'
  green "✅ prices OK"
else
  echo "$PRICES"
  red "❌ prices KO (map vide ou clés manquantes)"; fail=1
fi

sec "3) /get-latest-signals"
SIG=$(curl -sS "${API}/get-latest-signals?limit=5" || true)
COUNT=$(echo "$SIG" | jq 'length' 2>/dev/null || echo 0)
if [ "${COUNT}" -gt 0 ]; then
  echo "$SIG" | jq .
  green "✅ latest signals OK (${COUNT})"
else
  echo "$SIG"
  red "❌ latest signals vide → le worker qui écrit signals.json ne tourne peut‑être pas"
fi

sec "4) /trader-log (tail)"
LOG=$(curl -sS "${API}/trader-log" || true)
TXT=$(echo "$LOG" | jq -r '.log // ""' 2>/dev/null || echo "")
if [ -n "$TXT" ]; then
  echo "$TXT" | tail -n 20
  green "✅ log OK (contenu présent)"
else
  echo "$LOG"
  red "❌ log vide"
fi

sec "5) /klines (Binance proxy)"
KLINES=$(curl -sS "${API}/klines?symbol=BTC/USDT&interval=1m&limit=5" || true)
if echo "$KLINES" | jq -e '.klines | length > 0' >/dev/null 2>&1; then
  echo "$KLINES" | jq '{symbol, interval, n:(.klines|length)}'
  green "✅ klines OK"
else
  echo "$KLINES"
  red "❌ klines KO"
fi

echo
if [ "$fail" -eq 0 ]; then
  green "🎉 HEALTHCHECK: OK"
else
  red "💥 HEALTHCHECK: échecs détectés ($fail)"
  exit 1
fi
