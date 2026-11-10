import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { load, save } from '../services/storage';
import { useApp } from './AppContext';

const Ctx = createContext(null);
export const useTrading = () => useContext(Ctx);

export const INITIAL_CAPITAL = 10000;
const EMPTY = { cash: INITIAL_CAPITAL, holdings: {}, history: [] };
const round2 = (n) => Math.round(n * 100) / 100;

export const money = (n) => {
  const [i, d] = Math.abs(n).toFixed(2).split('.');
  return `$${i.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${d}`;
};
export const signedMoney = (n) => `${n < 0 ? '-' : '+'}${money(n)}`;

export function TradingProvider({ children }) {
  const { watchlist, stocks } = useApp();
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const dataRef = useRef(EMPTY);

  const commit = (next) => {
    dataRef.current = next;
    setData(next);
    save('trading', next);
  };

  useEffect(() => {
    (async () => {
      const saved = await load('trading', null);
      if (saved) {
        dataRef.current = saved;
        setData(saved);
      }
      setReady(true);
    })();
  }, []);

  // Guarda el último precio real conocido de cada empresa en cartera.
  useEffect(() => {
    if (!ready) return;
    const d = dataRef.current;
    const hs = { ...d.holdings };
    let changed = false;
    Object.keys(hs).forEach((sym) => {
      const st = stocks[sym];
      if (watchlist.includes(sym) && st && !st.simulated && st.price !== hs[sym].lastPrice) {
        hs[sym] = { ...hs[sym], lastPrice: st.price };
        changed = true;
      }
    });
    if (changed) commit({ ...d, holdings: hs });
  }, [stocks, watchlist, ready]);

  const priceFor = (sym) => (watchlist.includes(sym) && stocks[sym] ? stocks[sym].price : null);

  const check = (type, symbol, qty, price) => {
    const d = dataRef.current;
    if (!Number.isInteger(qty) || qty <= 0) {
      return { ok: false, msg: 'Ingresa una cantidad entera mayor a cero.' };
    }
    if (typeof price !== 'number' || !isFinite(price) || price <= 0) {
      return { ok: false, msg: 'Precio no disponible o inválido.' };
    }
    const total = round2(price * qty);
    if (type === 'buy') {
      if (total > d.cash) {
        return { ok: false, msg: `Saldo insuficiente: necesitas ${money(total)} y tienes ${money(d.cash)}.` };
      }
    } else {
      const own = d.holdings[symbol] ? d.holdings[symbol].shares : 0;
      if (qty > own) return { ok: false, msg: `Solo tienes ${own} acciones de ${symbol}.` };
    }
    return { ok: true, total };
  };

  const buy = ({ symbol, name, qty, price, simulated }) => {
    const c = check('buy', symbol, qty, price);
    if (!c.ok) return c;
    const d = dataRef.current;
    const h = d.holdings[symbol];
    const shares = (h ? h.shares : 0) + qty;
    const avgCost = ((h ? h.shares * h.avgCost : 0) + c.total) / shares;
    const op = {
      id: `${Date.now()}-${symbol}-buy`, type: 'buy', symbol, name, qty, price,
      total: c.total, date: new Date().toISOString(), simulated: !!simulated,
    };
    const cash = round2(d.cash - c.total);
    commit({
      cash,
      holdings: { ...d.holdings, [symbol]: { symbol, name, shares, avgCost, lastPrice: price } },
      history: [op, ...d.history].slice(0, 500),
    });
    return { ok: true, op, cash };
  };

  const sell = ({ symbol, name, qty, price, simulated }) => {
    const c = check('sell', symbol, qty, price);
    if (!c.ok) return c;
    const d = dataRef.current;
    const h = d.holdings[symbol];
    const remaining = h.shares - qty;
    const holdings = { ...d.holdings };
    if (remaining === 0) delete holdings[symbol];
    else holdings[symbol] = { ...h, shares: remaining, lastPrice: price };
    const op = {
      id: `${Date.now()}-${symbol}-sell`, type: 'sell', symbol, name, qty, price,
      total: c.total, realized: round2((price - h.avgCost) * qty),
      date: new Date().toISOString(), simulated: !!simulated,
    };
    const cash = round2(d.cash + c.total);
    commit({ cash, holdings, history: [op, ...d.history].slice(0, 500) });
    return { ok: true, op, cash };
  };

  const reset = () => commit(EMPTY);

  const positions = Object.values(data.holdings).map((h) => {
    const live = priceFor(h.symbol);
    const price = live != null ? live : h.lastPrice;
    const value = round2(h.shares * price);
    const cost = h.shares * h.avgCost;
    return {
      ...h, price, live: live != null, value,
      pl: round2(value - cost), plPct: cost ? ((value - cost) / cost) * 100 : 0,
    };
  });
  const invested = round2(positions.reduce((a, p) => a + p.value, 0));
  const total = round2(data.cash + invested);
  const pl = round2(total - INITIAL_CAPITAL);
  const portfolio = {
    cash: data.cash, invested, total, pl,
    returnPct: (pl / INITIAL_CAPITAL) * 100, positions,
  };

  return (
    <Ctx.Provider
      value={{
        ready, cash: data.cash, holdings: data.holdings, history: data.history,
        portfolio, priceFor, check, buy, sell, reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
