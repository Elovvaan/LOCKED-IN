import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LiveBadge } from './LiveBadge';

interface Props {
  event: any;
}

export function EventHeader({ event }: Props) {
  const isLive = event.startsAt && !event.isEnded;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>{event.title || event.name || 'Event'}</Text>
        {isLive && <LiveBadge />}
      </View>
      {event.location && <Text style={styles.location}>{event.location}</Text>}
      {event.startsAt && (
        <Text style={styles.time}>{new Date(event.startsAt).toLocaleString()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  location: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  time: {
    color: '#a1a1aa',
    fontSize: 13,
  },
});
