import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoStage } from './VideoStage';
import { VoteButton } from './VoteButton';

interface Props {
  response: any;
  isLeader: boolean;
  hasVoted: boolean;
  isEnded: boolean;
  voting: boolean;
  onVote: () => void;
}

export function BattlePane({ response, isLeader, hasVoted, isEnded, voting, onVote }: Props) {
  return (
    <View style={styles.container}>
      <VideoStage uri={response.videoUrl} style={styles.video} />
      <View style={styles.info}>
        <Text style={[styles.username, isLeader && styles.leader]}>
          @{response.user?.username || 'unknown'}
        </Text>
        <Text style={styles.votes}>{response.voteCount || 0} votes</Text>
        {!isEnded && !hasVoted && (
          <VoteButton onPress={onVote} loading={voting} disabled={voting} />
        )}
        {isLeader && <Text style={styles.leaderLabel}>👑 Leading</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  video: {
    flex: 1,
  },
  info: {
    padding: 10,
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  leader: {
    color: '#22c55e',
  },
  votes: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  leaderLabel: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
});
