import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTrading, INITIAL_CAPITAL, money, signedMoney } from '../context/TradingContext';
import { colors, card, fmtPct, fmtPrice, colorFor } from '../theme';

function Row({ label, value, color }) {
  return (
    <View style={s.row}>
      <Text style={s.rl}>{label}</Text>
      <Text style={[s.rv, color && { color }]}>{value}</Text>
    </View>
  );
}

export default function PortfolioView() {
  const { portfolio: p, reset } = useTrading();

  const confirmReset = () =>
    Alert.alert(
      'Reiniciar portafolio',
      'Se borrarán el saldo, las acciones y el historial. El saldo volverá a $10,000.00 virtuales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: reset },
      ]
    );

  return (
    <View>
      <View style={card}>
        <Row label="Capital inicial" value={money(INITIAL_CAPITAL)} />
        <Row label="Saldo disponible" value={money(p.cash)} />
        <Row label="Valor de inversiones" value={money(p.invested)} />
        <Row label="Valor total del portafolio" value={money(p.total)} />
        <Row label="Ganancia / pérdida" value={signedMoney(p.pl)} color={colorFor(p.pl)} />
        <Row label="Rendimiento" value={fmtPct(p.returnPct)} color={colorFor(p.returnPct)} />
      </View>

      <Text style={s.section}>Mis acciones</Text>
      {p.positions.length === 0 && (
        <Text style={s.muted}>Aún no tienes acciones. Compra la primera en la pestaña Operar.</Text>
      )}
      {p.positions.map((pos) => (
        <View key={pos.symbol} style={card}>
          <View style={s.row}>
            <Text style={s.name}>{pos.name} <Text style={{ color: colors.muted }}>{pos.symbol}</Text></Text>
            <Text style={s.name}>{pos.shares} acc.</Text>
          </View>
          <Row label="Costo promedio" value={fmtPrice(pos.avgCost)} />
          <Row label={pos.live ? 'Precio actual' : 'Precio (último guardado)'} value={fmtPrice(pos.price)} />
          <Row label="Valor" value={money(pos.value)} />
          <Row label="Ganancia / pérdida" value={`${signedMoney(pos.pl)} (${fmtPct(pos.plPct)})`} color={colorFor(pos.pl)} />
        </View>
      ))}

      <TouchableOpacity style={s.reset} onPress={confirmReset}>
        <Text style={{ color: colors.muted }}>Reiniciar portafolio</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rl: { color: colors.muted, fontSize: 14 },
  rv: { color: colors.text, fontSize: 14, fontWeight: '700' },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  section: { color: colors.text, fontSize: 18, fontWeight: '700', marginVertical: 8 },
  muted: { color: colors.muted, marginBottom: 12 },
  reset: { alignItems: 'center', padding: 14 },
});
