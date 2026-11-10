import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { load, save } from '../services/storage';
import { fetchStocks } from '../services/api';
import { detectAlerts } from '../utils/alerts';
import { fmtPct } from '../theme';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const MARKET = 'SPY';
export const MAX_WATCHLIST = 7;
const DEFAULT_WATCH = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];
const CACHE_MS = 15 * 60 * 1000;

export function AppProvider({ children }) {
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCH);
  const [stocks, setStocks] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [threshold, setThresholdState] = useState(5);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  const ref = useRef({});
  ref.current = { watchlist, stocks, alerts, threshold };

  const applyAlerts = (wl, data, th, al) => {
    const fresh = detectAlerts(wl.map((s) => data[s]).filter(Boolean), th, al);
    if (!fresh.length) return;
    const next = [...fresh, ...al].slice(0, 50);
    setAlerts(next);
    save('alerts', next);
    Alert.alert(
      'InvestAlert',
      fresh
        .map((a) =>
          a.type === 'down'
            ? `ALERTA: ${a.name} cae ${fmtPct(a.pct)}`
            : `Oportunidad potencial: ${a.name} sube ${fmtPct(a.pct)}`
        )
        .join('\n')
    );
  };

  const runRefresh = async (wl, th, al, force) => {
    setLoading(true);
    const symbols = [...wl, MARKET];
    let data = null;
    if (!force) {
      const cache = await load('cache', null);
      if (cache && Date.now() - cache.time < CACHE_MS && symbols.every((s) => cache.stocks[s])) {
        data = cache.stocks;
        setInfo('');
      }
    }
    if (!data) {
      const res = await fetchStocks(symbols);
      data = res.data;
      setInfo(res.reason || '');
      if (Object.keys(data).length && !Object.values(data).some((s) => s.simulated)) {
        await save('cache', { time: Date.now(), stocks: data });
      }
    }
    setStocks((prev) => ({ ...prev, ...data }));
    applyAlerts(wl, data, th, al);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const wl = await load('watchlist', DEFAULT_WATCH);
      const th = await load('threshold', 5);
      const al = await load('alerts', []);
      setWatchlist(wl);
      setThresholdState(th);
      setAlerts(al);
      await runRefresh(wl, th, al, false);
    })();
  }, []);

  const refresh = (force = true) =>
    runRefresh(ref.current.watchlist, ref.current.threshold, ref.current.alerts, force);

  const setThreshold = (n) => {
    setThresholdState(n);
    save('threshold', n);
    applyAlerts(ref.current.watchlist, ref.current.stocks, n, ref.current.alerts);
  };

  const addSymbol = async (raw) => {
    const sym = raw.trim().toUpperCase();
    if (!/^[A-Z.]{1,6}$/.test(sym)) return { ok: false, msg: 'Símbolo no válido' };
    if (watchlist.includes(sym)) return { ok: false, msg: 'Ya está en tu lista' };
    if (watchlist.length >= MAX_WATCHLIST) {
      return { ok: false, msg: `Máximo ${MAX_WATCHLIST} empresas (límite del plan gratuito)` };
    }
    setLoading(true);
    const res = await fetchStocks([sym]);
    setLoading(false);
    const s = res.data[sym];
    if (!s) return { ok: false, msg: 'Símbolo no encontrado' };
    const next = [...watchlist, sym];
    setWatchlist(next);
    save('watchlist', next);
    setStocks((p) => ({ ...p, [sym]: s }));
    return { ok: true };
  };

  const removeSymbol = (sym) => {
    const next = watchlist.filter((s) => s !== sym);
    setWatchlist(next);
    save('watchlist', next);
  };

  const clearAlerts = () => {
    setAlerts([]);
    save('alerts', []);
  };

  const simulated = [...watchlist, MARKET].some((s) => stocks[s] && stocks[s].simulated);
  const hasKey = !!process.env.EXPO_PUBLIC_TWELVEDATA_KEY;

  return (
    <Ctx.Provider
      value={{
        watchlist, stocks, alerts, threshold, loading, info, simulated, hasKey,
        refresh, setThreshold, addSymbol, removeSymbol, clearAlerts,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
