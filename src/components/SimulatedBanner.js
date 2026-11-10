import React from 'react';
import { View, Text } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function SimulatedBanner() {
  const { simulated, info } = useApp();
  if (!simulated) return null;
  return (
    <View style={{ backgroundColor: colors.yellow, paddingVertical: 6, paddingHorizontal: 12 }}>
      <Text style={{ color: '#000', fontWeight: '700', fontSize: 12, textAlign: 'center' }}>
        DATOS SIMULADOS{info ? ` · ${info}` : ''} — no son cotizaciones reales
      </Text>
    </View>
  );
}
