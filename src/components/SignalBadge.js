import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

const MAP = {
  COMPRA: { label: 'POSIBLE COMPRA', color: colors.green },
  MANTENER: { label: 'MANTENER', color: colors.yellow },
  PRECAUCION: { label: 'PRECAUCIÓN', color: colors.red },
};

export default function SignalBadge({ signal }) {
  const m = MAP[signal];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderColor: m.color,
        borderWidth: 1,
        backgroundColor: m.color + '22',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: m.color, fontWeight: '700', fontSize: 13 }}>{m.label}</Text>
    </View>
  );
}
