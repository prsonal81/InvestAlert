import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LineChart from './LineChart';
import { colors, card, fmtPct, fmtPrice, colorFor } from '../theme';

export default function StockCard({ stock, onPress, right }) {
  const c = colorFor(stock.changePct);
  return (
    <TouchableOpacity style={[card, s.row]} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{stock.name}</Text>
        <Text style={s.sym}>{stock.symbol}</Text>
      </View>
      <LineChart data={stock.candles.slice(-30).map((x) => x.close)} color={c} width={70} height={34} grid={false} />
      <View style={s.right}>
        <Text style={s.price}>{fmtPrice(stock.price)}</Text>
        <Text style={{ color: c, fontWeight: '600' }}>{fmtPct(stock.changePct)}</Text>
      </View>
      {right}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  sym: { color: colors.muted, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', marginLeft: 12, minWidth: 80 },
  price: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
