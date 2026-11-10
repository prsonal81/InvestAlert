import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Line } from 'react-native-svg';
import { colors } from '../theme';

export default function LineChart({ data, color, width, height = 160, overlay, grid = true }) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;
  const all = overlay ? [...data, ...overlay.filter((v) => v != null)] : data;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const pad = 4;
  const pts = (arr) =>
    arr
      .map((v, i) =>
        v == null ? null : `${(i / (arr.length - 1)) * width},${pad + (1 - (v - min) / range) * (height - 2 * pad)}`
      )
      .filter(Boolean)
      .join(' ');

  return (
    <Svg width={width} height={height}>
      {grid &&
        [0.25, 0.5, 0.75].map((f) => (
          <Line key={f} x1="0" x2={width} y1={height * f} y2={height * f} stroke={colors.border} strokeWidth="1" />
        ))}
      {overlay && (
        <Polyline points={pts(overlay)} fill="none" stroke={colors.yellow} strokeWidth="1.5" strokeDasharray="4,3" />
      )}
      <Polyline points={pts(data)} fill="none" stroke={color} strokeWidth="2" />
    </Svg>
  );
}
