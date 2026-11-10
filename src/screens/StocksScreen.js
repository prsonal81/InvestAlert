import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, MAX_WATCHLIST } from '../context/AppContext';
import StockCard from '../components/StockCard';
import SimulatedBanner from '../components/SimulatedBanner';
import { colors, card } from '../theme';

const SUGGESTED = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'NFLX'];

export default function StocksScreen({ navigation }) {
  const { watchlist, stocks, loading, addSymbol, removeSymbol } = useApp();
  const [text, setText] = useState('');

  const add = async (sym) => {
    const r = await addSymbol(sym);
    if (r.ok) setText('');
    else Alert.alert('No se pudo agregar', r.msg);
  };

  const del = (sym) => (
    <TouchableOpacity onPress={() => removeSymbol(sym)} style={{ marginLeft: 12 }} hitSlop={10}>
      <Ionicons name="trash-outline" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <View style={s.screen}>
      <SimulatedBanner />
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={s.hint}>Lista de seguimiento ({watchlist.length}/{MAX_WATCHLIST})</Text>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder="Símbolo (ej. GOOGL)"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity style={s.btn} onPress={() => add(text)} disabled={loading}>
            <Text style={s.btnText}>{loading ? '...' : 'Agregar'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.chips}>
          {SUGGESTED.filter((x) => !watchlist.includes(x)).map((x) => (
            <TouchableOpacity key={x} style={s.chip} onPress={() => add(x)}>
              <Text style={s.chipText}>+ {x}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {watchlist.map((sym) =>
          stocks[sym] ? (
            <StockCard
              key={sym}
              stock={stocks[sym]}
              onPress={() => navigation.navigate('StockDetail', { symbol: sym })}
              right={del(sym)}
            />
          ) : (
            <View key={sym} style={[card, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <Text style={{ color: colors.text }}>{sym} · sin datos</Text>
              {del(sym)}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hint: { color: colors.muted, marginBottom: 8 },
  inputRow: { flexDirection: 'row', marginBottom: 10 },
  input: { flex: 1, backgroundColor: colors.card, color: colors.text, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.blue, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', marginLeft: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipText: { color: colors.text, fontSize: 13 },
});
