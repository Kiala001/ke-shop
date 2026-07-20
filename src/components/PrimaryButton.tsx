// components/PrimaryButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary', // primary | danger | outline | success
  loading = false,
  disabled = false,
  style,
}) {
  const variants = {
    primary: { backgroundColor: colors.primary, borderColor: colors.primary, textColor: colors.white },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger, textColor: colors.white },
    success: { backgroundColor: colors.success, borderColor: colors.success, textColor: colors.white },
    outline: { backgroundColor: 'transparent', borderColor: colors.primary, textColor: colors.primary },
  };
  const v = variants[variant] || variants.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: v.backgroundColor, borderColor: v.borderColor },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <Text style={[styles.text, { color: v.textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
