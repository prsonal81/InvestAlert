import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { useApp, MARKET } from '../context/AppContext';
import { useTrading, money, signedMoney } from '../context/TradingContext';
import StockCard from '../components/StockCard';
import LineChart from '../components/LineChart';
import SimulatedBanner from '../components/SimulatedBanner';
import { colors, card, fmtPct, fmtPrice, colorFor } from '../theme';

function MiniRow({ stock, onPress }) {
  return (
    <TouchableOpacity style={s.mini} onPress={onPress}>
      <Text style={s.miniName}>{stock.name} <Text style={{ color: colors.muted }}>{stock.symbol}</Text></Text>
      <Text style={{ color: colorFor(stock.changePct), fontWeight: '700' }}>{fmtPct(stock.changePct)}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const { watchlist, stocks, alerts, loading, refresh } = useApp();
  const { portfolio } = useTrading();
  const { width } = useWindowDimensions();
  const list = watchlist.map((x) => stocks[x]).filter(Boolean);
  const m = stocks[MARKET];
  const gainers = list.filter((x) => x.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 3);
  const losers = list.filter((x) => x.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, 3);
  const avg = list.length ? list.reduce((a, x) => a + x.changePct, 0) / list.length : 0;
  const up = list.filter((x) => x.changePct >= 0).length;
  const open = (sym) => navigation.navigate('StockDetail', { symbol: sym });

  return (
    <View style={s.screen}>
      <SimulatedBanner />
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refresh(true)} tintColor={colors.text} />}
      >
        {!m && loading && <ActivityIndicator color={colors.blue} style={{ marginVertical: 30 }} />}

        {m && (
          <View style={card}>
            <Text style={s.label}>MERCADO · {m.name}</Text>
            <View style={s.rowBetween}>
              <Text style={s.big}>{fmtPrice(m.price)}</Text>
              <Text style={[s.bigPct, { color: colorFor(m.changePct) }]}>{fmtPct(m.changePct)}</Text>
            </View>
            <LineChart data={m.candles.map((x) => x.close)} color={colorFor(m.changePct)} width={width - 60} height={110} />
          </View>
        )}

        <TouchableOpacity style={card} onPress={() => navigation.navigate('Trading')} activeOpacity={0.7}>
          <Text style={s.label}>MI PORTAFOLIO (VIRTUAL)</Text>
          <View style={s.rowBetween}>
            <Text style={s.big}>{money(portfolio.total)}</Text>
            <Text style={[s.bigPct, { color: colorFor(portfolio.returnPct) }]}>{fmtPct(portfolio.returnPct)}</Text>
          </View>
          <Text style={s.muted}>
            Saldo {money(portfolio.cash)} · Invertido {money(portfolio.invested)} · G/P {signedMoney(portfolio.pl)}
          </Text>
        </TouchableOpacity>

        {list.length > 0 && (
          <View style={card}>
            <Text style={s.label}>RESUMEN DEL MERCADO</Text>
            <Text style={s.text}>
              {up} de {list.length} empresas suben en la última sesión. Variación promedio: {fmtPct(avg)}.
              {m ? ` El mercado (SPY) ${m.changePct >= 0 ? 'sube' : 'baja'} ${fmtPct(m.changePct)}.` : ''}
            </Text>
          </View>
        )}

        <Text style={s.section}>Acciones favoritas</Text>
        {list.map((x) => (
          <StockCard key={x.symbol} stock={x} onPress={() => open(x.symbol)} />
        ))}

        <View style={card}>
          <Text style={s.label}>MAYORES SUBIDAS</Text>
          {gainers.length ? gainers.map((x) => <MiniRow key={x.symbol} stock={x} onPress={() => open(x.symbol)} />) : <Text style={s.muted}>Ninguna.</Text>}
        </View>

        <View style={card}>
          <Text style={s.label}>MAYORES CAÍDAS</Text>
          {losers.length ? losers.map((x) => <MiniRow key={x.symbol} stock={x} onPress={() => open(x.symbol)} />) : <Text style={s.muted}>Ninguna.</Text>}
        </View>

        <View style={card}>
          <Text style={s.label}>ALERTAS RECIENTES</Text>
          {alerts.length ? (
            alerts.slice(0, 3).map((a) => (
              <View key={a.id} style={s.mini}>
                <Text style={s.miniName}>{a.type === 'down' ? 'Caída' : 'Oportunidad'}: {a.name}</Text>
                <Text style={{ color: colorFor(a.pct), fontWeight: '700' }}>{fmtPct(a.pct)}</Text>
              </View>
            ))
          ) : (
            <Text style={s.muted}>Sin alertas.</Text>
          )}
        </View>

        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Watch')}>
          <Text style={s.btnText}>Abrir modo reloj (demostración)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  big: { color: colors.text, fontSize: 28, fontWeight: '800' },
  bigPct: { fontSize: 20, fontWeight: '700' },
  text: { color: colors.text, fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted },
  section: { color: colors.text, fontSize: 18, fontWeight: '700', marginVertical: 8 },
  mini: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  miniName: { color: colors.text, fontSize: 14 },
  btn: { backgroundColor: colors.blue, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700' },
});