import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useEvent } from '../hooks/useEvent';
import { EventHeader } from '../components/EventHeader';
import { EventMeta } from '../components/EventMeta';
import { EventMediaGrid } from '../components/EventMediaGrid';
import { EventResultCard } from '../components/EventResultCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';
import { Ionicons } from '@expo/vector-icons';

export function EventDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const { data, loading, error, reload } = useEvent(id);

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { event, players, spectators, media, voteResults, isEnded } = data;

  return (
    <View style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <EventHeader event={event || {}} />
        <EventMeta players={players || []} spectators={spectators || []} />
        {isEnded && voteResults?.length > 0 && (
          <EventResultCard voteResults={voteResults} />
        )}
        {media?.length > 0 && <EventMediaGrid media={media} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  navHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  back: { padding: 4 },
});
