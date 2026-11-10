const KEY = process.env.EXPO_PUBLIC_TWELVEDATA_KEY;

export const NAMES = {
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  NVDA: 'NVIDIA',
  TSLA: 'Tesla',
  AMZN: 'Amazon',
  GOOGL: 'Alphabet',
  META: 'Meta',
  NFLX: 'Netflix',
  SPY: 'S&P 500 (SPY)',
};

// Precios base SOLO para el modo SIMULADO (no son cotizaciones reales).
const BASE = { AAPL: 190, MSFT: 420, NVDA: 130, TSLA: 250, AMZN: 180, SPY: 520 };
const LIMIT_CODES = [401, 403, 429];

function build(symbol, candles, simulated = false) {
  const n = candles.length;
  const price = candles[n - 1].close;
  const prev = n > 1 ? candles[n - 2].close : price;
  const change = price - prev;
  return {
    symbol,
    name: NAMES[symbol] || symbol,
    candles,
    price,
    change,
    changePct: prev ? (change / prev) * 100 : 0,
    lastDate: candles[n - 1].date,
    simulated,
  };
}

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function simulateOne(sym) {
  let seed = 0;
  for (const c of sym) seed = seed * 31 + c.charCodeAt(0);
  const r = rng(seed >>> 0 || 1);
  let p = BASE[sym] || 50 + (seed % 150);
  const candles = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    p = p * (1 + (r() - 0.5) * 0.05);
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    candles.push({ date: d.toISOString().slice(0, 10), close: +p.toFixed(2) });
  }
  return build(sym, candles, true);
}

function simulate(symbols) {
  const out = {};
  symbols.forEach((s) => (out[s] = simulateOne(s)));
  return out;
}

export async function fetchStocks(symbols) {
  const fallback = (reason) => ({ data: simulate(symbols), reason });
  if (!KEY) return fallback('Sin API key');
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbols.join(',')}&interval=1day&outputsize=60&apikey=${KEY}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'error' && LIMIT_CODES.includes(json.code)) {
      return fallback(json.code === 429 ? 'Límite de solicitudes alcanzado' : 'API key inválida');
    }

    const raw = symbols.length === 1 ? { [symbols[0]]: json } : json;
    const data = {};
    let reason = '';
    for (const sym of symbols) {
      const r = raw[sym];
      if (r && r.status === 'error' && LIMIT_CODES.includes(r.code)) {
        data[sym] = simulateOne(sym);
        reason = 'Límite de solicitudes alcanzado';
        continue;
      }
      if (!r || r.status === 'error' || !r.values || !r.values.length) continue;
      const candles = r.values
        .slice()
        .reverse()
        .map((v) => ({ date: v.datetime, close: parseFloat(v.close) }))
        .filter((c) => !isNaN(c.close));
      if (candles.length) data[sym] = build(sym, candles, false);
    }
    return { data, reason };
  } catch (e) {
    return fallback('Sin conexión');
  }
}
