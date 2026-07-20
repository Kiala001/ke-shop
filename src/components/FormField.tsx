// components/FormField.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  optional = false,
  multiline = false,
  editable = true,
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label} {optional && <Text style={styles.optional}>(opcional)</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, !editable && styles.disabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 6,
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  disabled: {
    backgroundColor: colors.cardAlt,
    color: colors.textMuted,
  },
});
