// components/StatusBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusMeta } from '../theme/colors';

export default function StatusBadge({ estado, size = 'normal' }) {
  const meta = statusMeta[estado] || statusMeta.pendente;
  const small = size === 'small';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.bg },
        small && styles.badgeSmall,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.text, { color: meta.color }, small && styles.textSmall]}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 11,
  },
});
