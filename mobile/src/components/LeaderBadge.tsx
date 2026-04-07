import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  username: string;
  voteCount: number;
}

export function LeaderBadge({ username, voteCount }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="trophy" size={12} color="#000" />
      <Text style={styles.text}>{username} · {voteCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  text: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
});
