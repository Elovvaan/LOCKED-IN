import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { VideoStage } from './VideoStage';

const { width } = Dimensions.get('window');

interface Props {
  response: any;
  onPress?: () => void;
}

export function ResponseCard({ response, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <VideoStage uri={response.videoUrl} style={styles.video} isActive={false} />
      <View style={styles.meta}>
        <Text style={styles.username}>@{response.user?.username || 'unknown'}</Text>
        {response.caption ? <Text style={styles.caption}>{response.caption}</Text> : null}
        <Text style={styles.votes}>{response.voteCount || 0} votes</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 220,
    marginBottom: 2,
    backgroundColor: '#111',
    flexDirection: 'row',
  },
  video: {
    width: 140,
    height: '100%',
  },
  meta: {
    flex: 1,
    padding: 14,
    gap: 6,
    justifyContent: 'center',
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  caption: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  votes: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
});
