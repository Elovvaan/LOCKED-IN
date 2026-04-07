import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function SubmitBar({ onSubmit, loading, disabled, label = 'Post Challenge' }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onSubmit}
        disabled={disabled || loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.text}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#333',
  },
  text: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
