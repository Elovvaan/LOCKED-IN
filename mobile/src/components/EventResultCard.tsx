import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  voteResults: any[];
}

export function EventResultCard({ voteResults }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>🏆 Event Results</Text>
      {voteResults?.map((r: any, i: number) => (
        <View key={i} style={styles.row}>
          <Text style={styles.rank}>#{i + 1}</Text>
          <Text style={styles.name}>{r.username || r.user?.username}</Text>
          <Text style={styles.votes}>{r.voteCount || r.votes} votes</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rank: {
    color: '#a1a1aa',
    fontSize: 13,
    width: 28,
  },
  name: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  votes: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
});
