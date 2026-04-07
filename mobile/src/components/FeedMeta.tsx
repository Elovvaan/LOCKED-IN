import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';

interface Props {
  username: string;
  title: string;
  caption?: string;
}

export function FeedMeta({ username, title, caption }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Avatar username={username} size={36} />
        <Text style={styles.username}>@{username}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 12,
    right: 80,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  caption: {
    color: '#a1a1aa',
    fontSize: 13,
  },
});
