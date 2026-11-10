import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTrading } from '../context/TradingContext';
import SimulatedBanner from '../components/SimulatedBanner';
import { colors, card, fmtPct, colorFor } from '../theme';

export default function AlertsScreen({ navigation }) {
  const { alerts, threshold, clearAlerts } = useApp();
  const { holdings } = useTrading();
  return (
    <View style={s.screen}>
      <SimulatedBanner />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.hint}>Umbral actual: {threshold}% (cámbialo en Ajustes)</Text>
        {alerts.length === 0 && <Text style={s.empty}>No hay alertas todavía.</Text>}
        {alerts.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[card, { borderLeftWidth: 4, borderLeftColor: colorFor(a.pct) }]}
            onPress={() => navigation.navigate('StockDetail', { symbol: a.symbol })}
          >
            <Text style={s.title}>
              {a.type === 'down' ? 'Caída importante' : 'Oportunidad potencial'}
              {a.simulated ? '  [SIMULADO]' : ''}
            </Text>
            <Text style={{ color: colorFor(a.pct), fontSize: 18, fontWeight: '700', marginVertical: 4 }}>
              {a.name} ({a.symbol}) {fmtPct(a.pct)}
            </Text>
            <Text style={s.hint}>Sesión: {a.date}</Text>
            {holdings[a.symbol] && (
              <Text style={s.owned}>EN TU PORTAFOLIO · {holdings[a.symbol].shares} acciones</Text>
            )}
          </TouchableOpacity>
        ))}
        {alerts.length > 0 && (
          <TouchableOpacity onPress={clearAlerts} style={s.clear}>
            <Text style={{ color: colors.muted }}>Borrar alertas</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hint: { color: colors.muted, fontSize: 12, marginBottom: 8 },
  empty: { color: colors.text, marginTop: 20, textAlign: 'center' },
  title: { color: colors.text, fontWeight: '700' },
  owned: { color: colors.blue, fontSize: 12, fontWeight: '700', marginTop: 2 },
  clear: { alignItems: 'center', padding: 12 },
});