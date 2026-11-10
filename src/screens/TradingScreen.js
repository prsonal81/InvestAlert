import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTrading, money } from '../context/TradingContext';
import SimulatedBanner from '../components/SimulatedBanner';
import SignalBadge from '../components/SignalBadge';
import PortfolioView from '../components/PortfolioView';
import HistoryView from '../components/HistoryView';
import { analyze } from '../utils/signals';
import { colors, card, fmtPct, fmtPrice, colorFor } from '../theme';

const SEGMENTS = ['Operar', 'Portafolio', 'Historial'];

export default function TradingScreen({ route }) {
  const { watchlist, stocks } = useApp();
  const T = useTrading();
  const [seg, setSeg] = useState('Operar');
  const [symbol, setSymbol] = useState(null);
  const [mode, setMode] = useState('buy');
  const [qtyText, setQtyText] = useState('');

  useEffect(() => {
    const p = route.params;
    if (p && p.symbol) {
      setSymbol(p.symbol);
      setMode(p.mode || 'buy');
      setSeg('Operar');
      setQtyText('');
    }
  }, [route.params]);

  const symbols = [...new Set([...watchlist, ...Object.keys(T.holdings)])];
  const sel = symbol && symbols.includes(symbol) ? symbol : symbols[0];
  const stock = sel && watchlist.includes(sel) ? stocks[sel] : null;
  const price = stock ? stock.price : null;
  const owned = sel && T.holdings[sel] ? T.holdings[sel].shares : 0;
  const qty = /^\d+$/.test(qtyText) ? parseInt(qtyText, 10) : NaN;
  const chk = qtyText.length > 0 ? T.check(mode, sel, qty, price) : null;
  const analysis = stock ? analyze(stock.candles.map((c) => c.close)) : null;
  const maxQty = mode === 'buy' ? (price ? Math.floor(T.cash / price) : 0) : owned;
  const modeColor = mode === 'buy' ? colors.green : colors.red;

  const submit = () => {
    const c = T.check(mode, sel, qty, price);
    if (!c.ok) return Alert.alert('Operación no válida', c.msg);
    const label = mode === 'buy' ? 'Comprar' : 'Vender';
    Alert.alert(
      `${label} ${sel}`,
      `${qty} acciones × ${fmtPrice(price)}\nTotal: ${money(c.total)}${stock.simulated ? '\n\nPrecio SIMULADO (operación virtual)' : ''}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            const args = { symbol: sel, name: stock.name, qty, price, simulated: stock.simulated };
            const r = mode === 'buy' ? T.buy(args) : T.sell(args);
            if (!r.ok) return Alert.alert('No se pudo completar', r.msg);
            setQtyText('');
            Alert.alert(
              mode === 'buy' ? 'Compra realizada' : 'Venta realizada',
              `${qty} × ${sel} a ${fmtPrice(price)}\nTotal: ${money(r.op.total)}\nSaldo disponible: ${money(r.cash)}`
            );
          },
        },
      ]
    );
  };

  if (!T.ready) {
    return (
      <View style={[s.screen, { justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <SimulatedBanner />
      <View style={s.seg}>
        {SEGMENTS.map((x) => (
          <TouchableOpacity key={x} style={[s.segBtn, seg === x && { backgroundColor: colors.blue }]} onPress={() => setSeg(x)}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{x}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {seg === 'Portafolio' && <PortfolioView />}
        {seg === 'Historial' && <HistoryView />}

        {seg === 'Operar' && (
          <View>
            <View style={card}>
              <Text style={s.label}>SALDO DISPONIBLE (VIRTUAL)</Text>
              <Text style={s.big}>{money(T.cash)}</Text>
            </View>

            <View style={s.chips}>
              {symbols.map((x) => (
                <TouchableOpacity
                  key={x}
                  style={[s.chip, sel === x && { backgroundColor: colors.blue, borderColor: colors.blue }]}
                  onPress={() => { setSymbol(x); setQtyText(''); }}
                >
                  <Text style={{ color: colors.text, fontSize: 13 }}>{x}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {stock ? (
              <View style={card}>
                <Text style={s.name}>{stock.name} · {stock.symbol}</Text>
                <View style={s.rowBetween}>
                  <Text style={s.big}>{fmtPrice(stock.price)}</Text>
                  <Text style={{ color: colorFor(stock.changePct), fontSize: 18, fontWeight: '700' }}>
                    {fmtPct(stock.changePct)}
                  </Text>
                </View>
                <Text style={s.muted}>Posees: {owned} acciones</Text>
                {analysis && (
                  <View style={{ marginTop: 10 }}>
                    <SignalBadge signal={analysis.signal} />
                    <Text style={s.reason}>{analysis.reasons[0]}</Text>
                    <Text style={s.disclaimer}>Referencia educativa, no es asesoría financiera.</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={card}>
                <Text style={s.muted}>
                  No hay precio actual para {sel || 'esta empresa'}. Agrégala a tu lista de seguimiento (pestaña Empresas) para operar con ella.
                </Text>
              </View>
            )}

            <View style={s.seg2}>
              {[['buy', 'Comprar', colors.green], ['sell', 'Vender', colors.red]].map(([k, label, col]) => (
                <TouchableOpacity
                  key={k}
                  style={[s.modeBtn, mode === k && { backgroundColor: col, borderColor: col }]}
                  onPress={() => { setMode(k); setQtyText(''); }}
                >
                  <Text style={{ color: colors.text, fontWeight: '800' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={qtyText}
                onChangeText={(t) => setQtyText(t.replace(/[^0-9]/g, ''))}
                placeholder="Cantidad de acciones"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
              />
              <TouchableOpacity style={s.maxBtn} onPress={() => setQtyText(maxQty > 0 ? String(maxQty) : '')}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Máx ({maxQty})</Text>
              </TouchableOpacity>
            </View>

            {chk && (
              <Text style={{ color: chk.ok ? colors.text : colors.red, marginBottom: 10, fontSize: 15 }}>
                {chk.ok ? `${mode === 'buy' ? 'Costo total' : 'Importe de la venta'}: ${money(chk.total)}` : chk.msg}
              </Text>
            )}

            <TouchableOpacity
              style={[s.confirm, { backgroundColor: modeColor }, (!stock || !chk || !chk.ok) && { opacity: 0.4 }]}
              onPress={submit}
              disabled={!stock || !chk || !chk.ok}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                {mode === 'buy' ? 'Confirmar compra' : 'Confirmar venta'}
              </Text>
            </TouchableOpacity>
            <Text style={s.disclaimer}>Operaciones simuladas con dinero virtual. No se realizan compras reales.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  seg: { flexDirection: 'row', margin: 16, marginBottom: 0, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  big: { color: colors.text, fontSize: 28, fontWeight: '800' },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  muted: { color: colors.muted, fontSize: 13 },
  reason: { color: colors.text, fontSize: 13, marginTop: 8, lineHeight: 18 },
  disclaimer: { color: colors.muted, fontSize: 11, marginTop: 8, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, marginBottom: 8 },
  seg2: { flexDirection: 'row', marginBottom: 12 },
  modeBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginRight: 8 },
  inputRow: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, backgroundColor: colors.card, color: colors.text, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: colors.border },
  maxBtn: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center', marginLeft: 8, borderWidth: 1, borderColor: colors.border },
  confirm: { borderRadius: 12, padding: 16, alignItems: 'center' },
});
