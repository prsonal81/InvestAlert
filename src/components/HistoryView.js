import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTrading, money, signedMoney } from '../context/TradingContext';
import { colors, card, fmtPrice, colorFor } from '../theme';

export default function HistoryView() {
  const { history } = useTrading();

  if (!history.length) return <Text style={s.empty}>Aún no hay operaciones registradas.</Text>;

  return (
    <View>
      {history.map((op) => {
        const c = op.type === 'buy' ? colors.green : colors.red;
        return (
          <View key={op.id} style={[card, { borderLeftWidth: 4, borderLeftColor: c }]}>
            <View style={s.row}>
              <Text style={{ color: c, fontWeight: '800' }}>
                {op.type === 'buy' ? 'COMPRA' : 'VENTA'}{op.simulated ? '  [SIMULADO]' : ''}
              </Text>
              <Text style={s.date}>{new Date(op.date).toLocaleString()}</Text>
            </View>
            <Text style={s.name}>{op.name} ({op.symbol})</Text>
            <Text style={s.text}>
              {op.qty} acciones × {fmtPrice(op.price)} = {money(op.total)}
            </Text>
            {op.type === 'sell' && op.realized != null && (
              <Text style={{ color: colorFor(op.realized), marginTop: 2 }}>
                Resultado de la venta: {signedMoney(op.realized)}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  date: { color: colors.muted, fontSize: 11 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  text: { color: colors.text, fontSize: 14, marginTop: 2 },
  empty: { color: colors.text, textAlign: 'center', marginTop: 20 },
});
