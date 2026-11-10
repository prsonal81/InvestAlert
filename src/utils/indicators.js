export function sma(v, p) {
  if (v.length < p) return null;
  const s = v.slice(-p);
  return s.reduce((a, b) => a + b, 0) / p;
}

export function smaSeries(v, p) {
  return v.map((_, i) => (i < p - 1 ? null : v.slice(i - p + 1, i + 1).reduce((a, b) => a + b, 0) / p));
}

export function rsi(v, p = 14) {
  if (v.length <= p) return null;
  let g = 0;
  let l = 0;
  for (let i = 1; i <= p; i++) {
    const d = v[i] - v[i - 1];
    if (d >= 0) g += d;
    else l -= d;
  }
  let ag = g / p;
  let al = l / p;
  for (let i = p + 1; i < v.length; i++) {
    const d = v[i] - v[i - 1];
    ag = (ag * (p - 1) + (d > 0 ? d : 0)) / p;
    al = (al * (p - 1) + (d < 0 ? -d : 0)) / p;
  }
  if (al === 0) return 100;
  return 100 - 100 / (1 + ag / al);
}
