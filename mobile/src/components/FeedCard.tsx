import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoStage } from './VideoStage';
import { FeedMeta } from './FeedMeta';
import { ActionRail } from './ActionRail';
import { LeaderBadge } from './LeaderBadge';
import { LiveBadge } from './LiveBadge';
import { Pill } from './Pill';

const { height } = Dimensions.get('window');

interface Props {
  post: any;
  isActive: boolean;
  onRespond?: () => void;
  onBattle?: () => void;
  onProfile?: () => void;
}

export function FeedCard({ post, isActive, onRespond, onBattle, onProfile }: Props) {
  const isEnded = !!post.isEnded;
  const isLiveBattle = !isEnded && !!post.currentLeader;
  const isBattleReady = !!post.isBattleReady;

  return (
    <View style={styles.container}>
      <VideoStage uri={post.videoUrl} isActive={isActive} />
      <View style={styles.overlay}>
        <View style={styles.badges}>
          {isEnded ? (
            <Pill label="Ended" color="#a1a1aa" />
          ) : isLiveBattle ? (
            <LiveBadge />
          ) : isBattleReady ? (
            <Pill label="⚔ Battle Ready" color="#22c55e" />
          ) : null}
          {post.currentLeader && (
            <LeaderBadge
              username={post.currentLeader.username}
              voteCount={post.currentLeader.voteCount}
            />
          )}
        </View>
        <FeedMeta
          username={post.creator?.username || 'unknown'}
          title={post.title}
          caption={post.caption}
        />
        <ActionRail
          responseCount={post.responseCount || 0}
          voteCount={post.voteCount || 0}
          battleReady={isBattleReady}
          onRespond={onRespond}
          onBattle={onBattle}
          onProfile={onProfile}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    width: '100%',
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  badges: {
    position: 'absolute',
    top: 60,
    left: 12,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});
