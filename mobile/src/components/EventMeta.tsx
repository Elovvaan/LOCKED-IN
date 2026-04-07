import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Pill } from './Pill';

interface Props {
  players: any[];
  spectators: any[];
}

export function EventMeta({ players, spectators }: Props) {
  return (
    <View style={styles.container}>
      <Pill label={`${players.length} Players`} color="#22c55e" />
      <Pill label={`${spectators.length} Spectators`} color="#a1a1aa" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
});
