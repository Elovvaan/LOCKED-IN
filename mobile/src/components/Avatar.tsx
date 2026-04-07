import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  username: string;
  size?: number;
}

export function Avatar({ username, size = 40 }: Props) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontWeight: '700',
  },
});
