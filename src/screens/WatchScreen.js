import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp, MARKET } from '../context/AppContext';
import { colors, fmtPct, fmtPrice, colorFor } from '../theme';

const SIZE = 280;
const INNER = SIZE - 12;

export default function WatchScreen() {
  const { watchlist, stocks, alerts, simulated } = useApp();
  const [idx, setIdx] = useState(0);
  const [page, setPage] = useState(0);

  const list = watchlist.map((x) => stocks[x]).filter(Boolean);
  const stock = list.length ? list[idx % list.length] : null;
  const alert0 = alerts[0];
  const up = list.filter((x) => x.changePct >= 0).length;
  const avg = list.length ? list.reduce((a, x) => a + x.changePct, 0) / list.length : 0;
  const m = stocks[MARKET];

  return (
    <View style={s.screen}>
      <Text style={s.tag}>MODO RELOJ · DEMOSTRACIÓN</Text>
      {simulated && <Text style={s.sim}>DATOS SIMULADOS</Text>}

      <View style={s.watch}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ width: INNER, height: INNER }}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / INNER))}
        >
          <TouchableOpacity style={s.page} activeOpacity={0.8} onPress={() => setIdx(idx + 1)}>
            {stock ? (
              <>
                <Text style={s.sym}>{stock.symbol}</Text>
                <Text style={s.price}>{fmtPrice(stock.price)}</Text>
                <Text style={[s.pct, { color: colorFor(stock.changePct) }]}>
                  {stock.changePct >= 0 ? '▲' : '▼'} {fmtPct(stock.changePct)}
                </Text>
                <Text style={s.small}>toca para cambiar</Text>
              </>
            ) : (
              <Text style={s.small}>Sin datos</Text>
            )}
          </TouchableOpacity>

          <View style={s.page}>
            <Text style={s.small}>ÚLTIMA ALERTA</Text>
            {alert0 ? (
              <>
                <Text style={[s.sym, { color: colorFor(alert0.pct) }]}>
                  {alert0.type === 'down' ? 'CAÍDA' : 'OPORTUNIDAD'}
                </Text>
                <Text style={s.name}>{alert0.name}</Text>
                <Text style={[s.pct, { color: colorFor(alert0.pct) }]}>{fmtPct(alert0.pct)}</Text>
              </>
            ) : (
              <Text style={s.name}>Sin alertas</Text>
            )}
          </View>

          <View style={s.page}>
            <Text style={s.small}>RESUMEN</Text>
            <Text style={[s.name, { color: colors.green }]}>▲ {up} suben</Text>
            <Text style={[s.name, { color: colors.red }]}>▼ {list.length - up} bajan</Text>
            <Text style={[s.pct, { color: colorFor(avg) }]}>{fmtPct(avg)}</Text>
            {m && <Text style={s.small}>Mercado {fmtPct(m.changePct)}</Text>}
          </View>
        </ScrollView>
      </View>

      <View style={s.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[s.dot, page === i && { backgroundColor: colors.text }]} />
        ))}
      </View>

      <Text style={s.note}>
        Simulación visual dentro del teléfono. Expo Go no puede conectarse a un reloj físico: Wear OS y Apple Watch requieren una app nativa.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', alignItems: 'center', paddingTop: 20 },
  tag: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  sim: { color: colors.yellow, fontSize: 12, fontWeight: '700', marginTop: 4 },
  watch: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 6, borderColor: '#2A2F36',
    overflow: 'hidden', backgroundColor: '#000', marginTop: 20,
  },
  page: { width: INNER, height: INNER, alignItems: 'center', justifyContent: 'center' },
  sym: { color: colors.text, fontSize: 26, fontWeight: '800' },
  price: { color: colors.text, fontSize: 38, fontWeight: '800', marginVertical: 2 },
  pct: { fontSize: 30, fontWeight: '800' },
  name: { color: colors.text, fontSize: 22, fontWeight: '700', marginVertical: 2 },
  small: { color: colors.muted, fontSize: 12, marginTop: 6 },
  dots: { flexDirection: 'row', marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333', marginHorizontal: 4 },
  note: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 24, paddingHorizontal: 30 },
});

