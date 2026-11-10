export function detectAlerts(stocks, threshold, existing) {
  const ids = new Set(existing.map((a) => a.id));
  const out = [];
  for (const s of stocks) {
    if (Math.abs(s.changePct) >= threshold) {
      const type = s.changePct < 0 ? 'down' : 'up';
      const id = `${s.symbol}-${s.lastDate}-${type}`;
      if (!ids.has(id)) {
        out.push({
          id,
          symbol: s.symbol,
          name: s.name,
          pct: s.changePct,
          type,
          simulated: s.simulated,
          date: s.lastDate,
          createdAt: Date.now(),
        });
      }
    }
  }
  return out;
}
