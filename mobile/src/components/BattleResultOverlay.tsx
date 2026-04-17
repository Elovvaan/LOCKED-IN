import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  winner: { username: string; voteCount: number } | null;
  onRematch?: () => void;
  rematchLoading?: boolean;
}

export function BattleResultOverlay({ winner, onRematch, rematchLoading }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.label}>Winner</Text>
        <Text style={styles.username}>@{winner?.username || 'Unknown'}</Text>
        <Text style={styles.votes}>{winner?.voteCount || 0} votes</Text>
        {onRematch && (
          <TouchableOpacity
            style={[styles.rematch, rematchLoading && styles.rematchLoading]}
            onPress={onRematch}
            disabled={rematchLoading}
            activeOpacity={0.8}
          >
            {rematchLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.rematchText}>Request Rematch</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  trophy: {
    fontSize: 48,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 22,
  },
  votes: {
    color: '#22c55e',
    fontSize: 15,
    fontWeight: '600',
  },
  rematch: {
    marginTop: 12,
    alignItems: 'center',
    minWidth: 160,
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rematchLoading: {
    opacity: 0.7,
  },
  rematchText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
