import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function BattleSplit({ left, right }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.pane}>{left}</View>
      <View style={styles.divider}>
        <Text style={styles.vs}>VS</Text>
      </View>
      <View style={styles.pane}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  pane: {
    flex: 1,
  },
  divider: {
    width: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vs: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
});
