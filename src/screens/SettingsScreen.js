import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import SimulatedBanner from '../components/SimulatedBanner';
import { colors, card } from '../theme';

const OPTIONS = [1, 2, 3, 5, 7, 10];

export default function SettingsScreen() {
  const { threshold, setThreshold, refresh, clearAlerts, hasKey, simulated, info, loading } = useApp();
  return (
    <View style={s.screen}>
      <SimulatedBanner />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={card}>
          <Text style={s.label}>UMBRAL DE ALERTA (variación diaria ±%)</Text>
          <View style={s.chips}>
            {OPTIONS.map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setThreshold(n)}
                style={[s.chip, threshold === n && { backgroundColor: colors.blue, borderColor: colors.blue }]}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>{n}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={card}>
          <Text style={s.label}>ORIGEN DE LOS DATOS</Text>
          <Text style={s.text}>
            {hasKey ? 'API key de Twelve Data detectada.' : 'Sin API key: se usa el modo SIMULADO.'}
          </Text>
          <Text style={s.text}>
            Estado: {simulated ? `SIMULADO${info ? ` (${info})` : ''}` : 'datos reales (último precio disponible, puede tener retraso)'}
          </Text>
          <TouchableOpacity style={s.btn} onPress={() => refresh(true)} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Actualizando...' : 'Actualizar datos'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.btn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={clearAlerts}>
          <Text style={s.btnText}>Borrar alertas</Text>
        </TouchableOpacity>

        <Text style={s.disclaimer}>
          InvestAlert es un proyecto escolar con fines educativos. Las señales no son asesoría financiera ni garantizan rentabilidad.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 8 },
  text: { color: colors.text, fontSize: 14, marginBottom: 6 },
  btn: { backgroundColor: colors.blue, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  disclaimer: { color: colors.muted, fontSize: 11, marginTop: 16, textAlign: 'center' },
});
