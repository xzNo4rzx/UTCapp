import datetime

def generate_signal_message(signal):
    symbol = signal["crypto"]
    typ = signal["type"]
    score = signal.get("score20", "?")
    risk = signal.get("risk", "?")
    details = signal.get("explanation", [])
    time = datetime.datetime.fromisoformat(signal["timestamp"]).strftime("%d/%m %H:%M")

    detail_text = "\n".join(f"- {d}" for d in details)
    return f"""🚨 {signal["type"].upper()} — {symbol}
Type : {typ}
Score IA : {score}/20
Risque : {risk}

🧠 Détails :
{detail_text}

🕒 {time}
→ Voir sur TradingView : https://www.tradingview.com/symbols/{symbol}USD"""