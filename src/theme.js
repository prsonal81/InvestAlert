export const colors = {
  bg: '#0B0F14',
  card: '#151B23',
  border: '#222B36',
  text: '#E8EDF2',
  muted: '#8A97A6',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#EAB308',
};

export const card = {
  backgroundColor: colors.card,
  borderRadius: 14,
  padding: 14,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 12,
};

export const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
export const fmtPrice = (n) => `$${n.toFixed(2)}`;
export const colorFor = (n) => (n >= 0 ? colors.green : colors.red);