import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBattle } from '../hooks/useBattle';
import { BattleHeader } from '../components/BattleHeader';
import { BattleSplit } from '../components/BattleSplit';
import { BattlePane } from '../components/BattlePane';
import { BattleResultOverlay } from '../components/BattleResultOverlay';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';
import { createRematch } from '../lib/skills';

export function BattleModeScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const { data, loading, error, voting, vote, reload } = useBattle(id);

  const handleRematch = useCallback(async () => {
    try {
      await createRematch(id);
      Alert.alert('Rematch created!', 'A rematch has been requested.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  }, [id, navigation]);

  const handleVote = useCallback(async (responseId: number) => {
    try {
      await vote(responseId);
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 409) Alert.alert('Already Voted', 'Your vote has already been recorded for this battle.');
      else if (status === 403) Alert.alert('Cannot Vote', 'Competitors cannot vote in their own battle. Share with friends to get more votes!');
      else Alert.alert('Error', e.response?.data?.error || e.message);
    }
  }, [vote]);

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { battleResponses, currentLeader, isBattleReady, hasVoted, isEnded, endsAt } = data;
  const [left, right] = battleResponses || [];

  return (
    <View style={styles.container}>
      <BattleHeader
        title="Battle Mode"
        endsAt={endsAt}
        onBack={() => navigation.goBack()}
      />

      {isBattleReady && left && right ? (
        <BattleSplit
          left={
            <BattlePane
              response={left}
              isLeader={currentLeader?.userId === left.userId}
              hasVoted={hasVoted}
              isEnded={isEnded}
              voting={voting}
              onVote={() => handleVote(left.id)}
            />
          }
          right={
            <BattlePane
              response={right}
              isLeader={currentLeader?.userId === right.userId}
              hasVoted={hasVoted}
              isEnded={isEnded}
              voting={voting}
              onVote={() => handleVote(right.id)}
            />
          }
        />
      ) : (
        <ErrorState message="Not enough responses for battle mode yet." />
      )}

      {isEnded && (
        <BattleResultOverlay
          winner={currentLeader ? { username: currentLeader.username, voteCount: currentLeader.voteCount } : null}
          onRematch={handleRematch}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
