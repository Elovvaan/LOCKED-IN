import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoStage } from './VideoStage';
import { VoteButton } from './VoteButton';

interface Props {
  response: any;
  isLeader: boolean;
  isLoser: boolean;
  hasVoted: boolean;
  isEnded: boolean;
  voting: boolean;
  onVote: () => void;
  userVotedFor?: number | null;
}

export function BattlePane({ response, isLeader, isLoser, hasVoted, isEnded, voting, onVote, userVotedFor }: Props) {
  const isVotedFor = userVotedFor != null && userVotedFor === response.id;

  return (
    <View style={[styles.container, isLeader && styles.leaderBorder]}>
      <View style={[styles.videoWrapper, isLoser && styles.dimmed]}>
        <VideoStage uri={response.videoUrl} style={styles.video} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.username, isLeader && styles.leaderText]}>
          {isLeader ? '👑 ' : ''}{response.responder?.username || 'unknown'}
        </Text>
        <Text style={styles.votes}>{response.voteCount || 0} votes</Text>
        {isEnded ? (
          <Text style={styles.votingClosed}>🔒 Voting closed</Text>
        ) : !hasVoted ? (
          <VoteButton onPress={onVote} loading={voting} disabled={voting} />
        ) : null}
        {isVotedFor && <Text style={styles.votedLabel}>✓ Your vote</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  leaderBorder: {
    borderColor: '#22c55e',
  },
  videoWrapper: {
    flex: 1,
  },
  dimmed: {
    opacity: 0.6,
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
  leaderText: {
    color: '#22c55e',
  },
  votes: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  votedLabel: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  votingClosed: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
  },
});
