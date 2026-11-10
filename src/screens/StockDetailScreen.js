import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTrading } from '../context/TradingContext';
import LineChart from '../components/LineChart';
import SignalBadge from '../components/SignalBadge';
import SimulatedBanner from '../components/SimulatedBanner';
import { smaSeries } from '../utils/indicators';
import { analyze } from '../utils/signals';
import { colors, card, fmtPct, fmtPrice, colorFor } from '../theme';

function Stat({ label, value }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

export default function StockDetailScreen({ route, navigation }) {
  const { stocks } = useApp();
  const { holdings } = useTrading();
  const { width } = useWindowDimensions();
  const stock = stocks[route.params.symbol];

  if (!stock) {
    return (
      <View style={s.screen}>
        <Text style={{ color: colors.text, padding: 16 }}>Sin datos para este símbolo.</Text>
      </View>
    );
  }

  const closes = stock.candles.map((c) => c.close);
  const a = analyze(closes);
  const c = colorFor(stock.changePct);
  const owned = holdings[stock.symbol] ? holdings[stock.symbol].shares : 0;

  const trade = (mode) =>
    navigation.navigate('Tabs', {
      screen: 'Trading',
      params: { symbol: stock.symbol, mode, nonce: Date.now() },
    });

  return (
    <View style={s.screen}>
      <SimulatedBanner />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.name}>{stock.name} · {stock.symbol}</Text>
        <Text style={s.price}>{fmtPrice(stock.price)}</Text>
        <Text style={{ color: c, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({fmtPct(stock.changePct)}) {stock.changePct >= 0 ? '▲' : '▼'}
        </Text>

        <View style={card}>
          <Text style={s.label}>ÚLTIMOS {closes.length} DÍAS · línea punteada = media móvil 10</Text>
          <LineChart data={closes} overlay={smaSeries(closes, 10)} color={c} width={width - 60} height={180} />
          <Text style={s.date}>Último dato: {stock.lastDate}</Text>
        </View>

        <View style={[card, s.grid]}>
          <Stat label="RSI (14)" value={a.rsi != null ? a.rsi.toFixed(1) : '—'} />
          <Stat label="Media 10" value={a.sma10 != null ? fmtPrice(a.sma10) : '—'} />
          <Stat label="Media 30" value={a.sma30 != null ? fmtPrice(a.sma30) : '—'} />
          <Stat label="Tendencia 10d" value={fmtPct(a.trendPct)} />
        </View>

        <View style={card}>
          <Text style={s.label}>SEÑAL</Text>
          <SignalBadge signal={a.signal} />
          {a.reasons.map((r, i) => (
            <Text key={i} style={s.reason}>• {r}</Text>
          ))}
          <Text style={s.disclaimer}>
            Análisis técnico básico con fines educativos. No garantiza rentabilidad ni es asesoría financiera.
          </Text>
        </View>

        <View style={card}>
          <Text style={s.label}>TRADING SIMULADO · Posees {owned} acciones</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={[s.tbtn, { backgroundColor: colors.green, marginRight: 8 }]} onPress={() => trade('buy')}>
              <Text style={s.tbtnText}>Comprar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tbtn, { backgroundColor: colors.red }, owned === 0 && { opacity: 0.4 }]}
              onPress={() => trade('sell')}
              disabled={owned === 0}
            >
              <Text style={s.tbtnText}>Vender</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  name: { color: colors.muted, fontSize: 14 },
  price: { color: colors.text, fontSize: 36, fontWeight: '800' },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  date: { color: colors.muted, fontSize: 11, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { width: '50%', paddingVertical: 8 },
  statLabel: { color: colors.muted, fontSize: 11 },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  reason: { color: colors.text, fontSize: 14, marginTop: 8, lineHeight: 20 },
  disclaimer: { color: colors.muted, fontSize: 11, marginTop: 12 },
  tbtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  tbtnText: { color: '#fff', fontWeight: '800' },
});