import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export function VoteButton({ onPress, disabled, loading, label = 'Vote' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#333',
  },
  text: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
