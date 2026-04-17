import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Dimensions,
  ViewToken,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFeed } from '../hooks/useFeed';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';
import { useNavigation } from '@react-navigation/native';
import { MediaSurface } from '../components/MediaSurface';

const { height } = Dimensions.get('window');

const bg = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80';

export function FeedScreen() {
  const { posts, loading, error, reload } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation<any>();

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });

  if (loading && !posts.length) return <LoadingScreen />;
  if (error && !posts.length) return <ErrorState message={error} onRetry={reload} />;

  return (
    <FlatList
      data={posts.length ? posts : [{ id: 0, username: 'tyrell_dunk_king', title: 'Street Dunk Championship', caption: 'Final qualifier for the Obsidian Arena finals.' }]}
      keyExtractor={item => String(item.id)}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const pct = index % 2 === 0 ? '68%' : '32%';
        return (
          <View style={styles.slide}>
            <MediaSurface uri={item.videoUrl || bg} style={styles.video}>
              <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.75)', '#000']} style={StyleSheet.absoluteFill} />

              <View style={styles.topRow}>
                <View style={styles.brandWrap}>
                  <Image source={{ uri: 'https://i.pravatar.cc/80?img=13' }} style={styles.avatar} />
                  <Text style={styles.brand}>LOCKED-IN</Text>
                </View>
                <Ionicons name="search" size={30} color="#58ff37" />
              </View>

              <TouchableOpacity style={styles.livePill}>
                <Text style={styles.liveText}>LIVE CHALLENGE</Text>
              </TouchableOpacity>

              <View style={styles.actionRail}>
                {['return-up-back', 'git-compare', 'trophy', 'share-social'].map(icon => (
                  <TouchableOpacity key={icon} style={styles.railButton}>
                    <Ionicons name={icon as any} size={28} color="#d4d4d4" />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.metaBlock}>
                <Text style={styles.username}>@{(item.username || 'LEX_FLUX').toUpperCase()}</Text>
                <Text style={styles.title}>{(item.title || 'STREET DUNK CHAMPIONSHIP').toUpperCase()}</Text>
                <Text style={styles.caption}>{item.caption || 'Final qualifier for the Obsidian Arena finals. Level 4 difficulty unlocked.'}</Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreName}>PLAYER 01</Text>
                  <Text style={styles.scorePct}>{pct}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: pct }]} />
                </View>
              </View>
            </MediaSurface>
          </View>
        );
      }}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewConfig.current}
      getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
      onRefresh={reload}
      refreshing={loading}
      snapToInterval={height}
      decelerationRate="fast"
      onMomentumScrollEnd={() => {
        if (posts[activeIndex]) {
          // keep backend integration available through navigation
          navigation.setParams?.({ activeSkill: posts[activeIndex].id });
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  slide: { height, backgroundColor: '#0e0e0e' },
  video: { flex: 1, paddingTop: 54, paddingHorizontal: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 10, borderWidth: 2, borderColor: '#58ff37' },
  brand: { color: '#58ff37', fontSize: 44 / 2, fontWeight: '900', fontStyle: 'italic' },
  livePill: {
    alignSelf: 'center',
    backgroundColor: '#8eff71',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 18,
  },
  liveText: { color: '#0d6100', fontWeight: '800', fontSize: 16, letterSpacing: 2 },
  actionRail: { position: 'absolute', right: 12, top: height * 0.30, gap: 16 },
  railButton: { width: 60, height: 60, backgroundColor: 'rgba(19,19,19,0.7)', justifyContent: 'center', alignItems: 'center' },
  metaBlock: { marginTop: 'auto', paddingBottom: 120 },
  username: { color: '#fff', fontSize: 42 / 2, fontWeight: '900' },
  title: { color: '#fff', fontSize: 68 / 2, fontWeight: '900', fontStyle: 'italic', marginTop: 8 },
  caption: { color: '#ababab', fontSize: 18 * 0.9, marginTop: 12, lineHeight: 31 * 0.8 },
  scoreRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  scoreName: { color: '#ababab', fontSize: 12, letterSpacing: 2, fontWeight: '700' },
  scorePct: { color: '#8eff71', fontSize: 54 / 2, fontWeight: '900', fontStyle: 'italic' },
  progressTrack: { marginTop: 8, height: 12, backgroundColor: '#353535', borderRadius: 6 },
  progressFill: { height: 12, backgroundColor: '#8eff71', borderRadius: 6 },
});
