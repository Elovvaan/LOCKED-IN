import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  count: number;
  color?: string;
}

export function CountBadge({ count, color = '#22c55e' }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  text: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
});
