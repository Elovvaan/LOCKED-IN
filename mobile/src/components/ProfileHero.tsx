import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';

interface Props {
  user: any;
  stats: { wins: number; defenses: number; events: number };
  isKing?: boolean;
}

export function ProfileHero({ user, stats, isKing }: Props) {
  return (
    <View style={styles.container}>
      <Avatar username={user.username} size={72} />
      <Text style={styles.username}>@{user.username}</Text>
      {isKing && <Text style={styles.king}>👑 King of Location</Text>}
      <View style={styles.statsRow}>
        <StatItem label="Wins" value={stats.wins} />
        <StatItem label="Defenses" value={stats.defenses} />
        <StatItem label="Events" value={stats.events} />
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    gap: 10,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  king: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  statLabel: {
    color: '#a1a1aa',
    fontSize: 12,
  },
});
