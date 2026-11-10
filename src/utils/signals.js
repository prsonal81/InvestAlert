import { sma, rsi } from './indicators';

export function analyze(closes) {
  const n = closes.length;
  const price = closes[n - 1];
  const s10 = sma(closes, 10);
  const s30 = sma(closes, 30);
  const r = rsi(closes, 14);
  const base = { rsi: r, sma10: s10, sma30: s30 };

  if (s10 == null || s30 == null || r == null) {
    return { ...base, signal: 'MANTENER', trendPct: 0, reasons: ['Datos históricos insuficientes para calcular los indicadores.'] };
  }

  const p10 = sma(closes.slice(0, -1), 10);
  const p30 = sma(closes.slice(0, -1), 30);
  const crossUp = p10 != null && p30 != null && p10 <= p30 && s10 > s30;
  const crossDown = p10 != null && p30 != null && p10 >= p30 && s10 < s30;
  const bearish = s10 < s30;
  const trendPct = n > 10 ? (price / closes[n - 11] - 1) * 100 : 0;
  const out = { ...base, trendPct };

  const caution = [];
  const buy = [];
  if (r >= 70) caution.push(`RSI en ${r.toFixed(0)}: zona de sobrecompra, posible corrección.`);
  if (crossDown) caution.push('La media de 10 días cruzó por debajo de la de 30: señal bajista.');
  else if (bearish && price < s10 && r > 35) {
    caution.push('Tendencia bajista: la media corta está bajo la larga y el precio bajo la media de 10 días.');
  }
  if (r <= 35) buy.push(`RSI en ${r.toFixed(0)}: zona de sobreventa, posible rebote.`);
  if (crossUp) buy.push('La media de 10 días cruzó por encima de la de 30: señal alcista.');

  if (caution.length) return { ...out, signal: 'PRECAUCION', reasons: caution };
  if (buy.length) return { ...out, signal: 'COMPRA', reasons: buy };
  return {
    ...out,
    signal: 'MANTENER',
    reasons: [
      `Sin señales claras: RSI en ${r.toFixed(0)} (zona neutral) y sin cruce de medias.`,
      `Tendencia ${bearish ? 'bajista' : 'alcista'} moderada (media 10 ${bearish ? '<' : '>'} media 30).`,
    ],
  };
}
