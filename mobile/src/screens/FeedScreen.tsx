import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Dimensions, ViewToken, View, Text } from 'react-native';
import { useFeed } from '../hooks/useFeed';
import { FeedCard } from '../components/FeedCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';
import { SafeScreen } from '../components/SafeScreen';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export function FeedScreen() {
  const { posts, loading, error, reload } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation<any>();

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });

  if (loading && !posts.length) return <LoadingScreen />;
  if (error && !posts.length) return <ErrorState message={error} onRetry={reload} />;
  if (!loading && !error && posts.length === 0) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No skill posts yet. Be the first to post!</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => String(item.id)}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <FeedCard
            post={item}
            isActive={index === activeIndex}
            onRespond={() => navigation.navigate('SkillDetail', { id: item.id, mode: 'respond' })}
            onBattle={() => navigation.navigate('BattleMode', { id: item.id })}
            onProfile={() => navigation.navigate('Profile', { id: item.userId })}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig.current}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        onRefresh={reload}
        refreshing={loading}
        snapToInterval={height}
        decelerationRate="fast"
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 16,
    textAlign: 'center',
  },
});
