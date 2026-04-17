import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBattle } from '../hooks/useBattle';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';
import { MediaSurface } from '../components/MediaSurface';

const topBg = 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80';
const bottomBg = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80';

export function BattleModeScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id = route.params?.id ?? 1;
  const { data, loading, error, vote, voting, reload } = useBattle(id);

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const left = data?.battleResponses?.[0];
  const right = data?.battleResponses?.[1];
  const total = (left?.voteCount || 68) + (right?.voteCount || 32);
  const leftPctNum = Math.round((((left?.voteCount || 68) / total) * 100));
  const rightPctNum = 100 - leftPctNum;
  const leftPct = `${leftPctNum}%` as `${number}%`;
  const rightPct = `${rightPctNum}%` as `${number}%`;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>LOCKED-IN</Text>
        <View style={styles.timer}><Ionicons name="timer" size={17} color="#8eff71" /><Text style={styles.timerText}>02:45</Text></View>
        <Ionicons name="search" size={30} color="#58ff37" />
      </View>

      <TouchableOpacity style={styles.winningPill}><Text style={styles.winningText}>WINNING</Text></TouchableOpacity>

      <MediaSurface uri={left?.videoUrl || topBg} style={styles.half}>
        <View style={styles.overlay} />
        <View style={styles.sideActions}>
          {['share-social', 'chatbox', 'heart'].map(icon => (
            <TouchableOpacity key={icon} style={styles.sideBtn}><Ionicons name={icon as any} size={28} color="#ccc" /></TouchableOpacity>
          ))}
        </View>
        <View style={styles.labelWrap}><Text style={styles.player}>PLAYER 01</Text><Text style={styles.name}>{(left?.username || 'LEX_FLUX').toUpperCase()}</Text></View>
        <Text style={styles.percentTop}>{leftPct}</Text>
        <TouchableOpacity style={styles.voteStrip} disabled={voting} onPress={() => left && vote(left.id)}><View style={[styles.voteFill, { width: leftPct }]} /></TouchableOpacity>
      </MediaSurface>

      <View style={styles.vsDiamond}><Text style={styles.vsText}>VS</Text></View>

      <MediaSurface uri={right?.videoUrl || bottomBg} style={styles.half}>
        <View style={styles.overlay} />
        <View style={styles.labelWrapBottom}><Text style={styles.player}>PLAYER 02</Text><Text style={styles.name}>{(right?.username || 'CORE_ZENITH').toUpperCase()}</Text></View>
        <Text style={styles.percentBottom}>{rightPct}</Text>
        <TouchableOpacity style={styles.voteStripBottom} disabled={voting} onPress={() => right && vote(right.id)}><View style={[styles.voteFillMuted, { width: rightPct }]} /></TouchableOpacity>
      </MediaSurface>

      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: { position: 'absolute', top: 46, left: 16, right: 16, zIndex: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#58ff37', fontSize: 40 / 2, fontWeight: '900', fontStyle: 'italic' },
  timer: { backgroundColor: 'rgba(19,19,19,0.8)', flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  timerText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  winningPill: { position: 'absolute', top: 140, left: 16, zIndex: 15, backgroundColor: '#8eff71', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20 },
  winningText: { color: '#0d6100', fontWeight: '900', fontSize: 31 / 2 },
  half: { height: '50%', justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 40 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sideActions: { position: 'absolute', right: 12, top: 110, zIndex: 10, gap: 14 },
  sideBtn: { width: 58, height: 58, backgroundColor: 'rgba(19,19,19,0.7)', justifyContent: 'center', alignItems: 'center' },
  labelWrap: { zIndex: 2 },
  labelWrapBottom: { zIndex: 2, marginBottom: 12 },
  player: { color: '#ababab', letterSpacing: 2, fontSize: 15, fontWeight: '700' },
  name: { color: '#fff', fontSize: 56 / 2, fontWeight: '900', fontStyle: 'italic', marginTop: 4 },
  percentTop: { position: 'absolute', right: 16, bottom: 56, color: '#8eff71', fontWeight: '900', fontSize: 72 / 2, zIndex: 3, fontStyle: 'italic' },
  percentBottom: { position: 'absolute', right: 16, bottom: 58, color: '#fff', fontWeight: '900', fontSize: 72 / 2, zIndex: 3, fontStyle: 'italic' },
  voteStrip: { height: 12, backgroundColor: '#2b2b2b', borderRadius: 6, zIndex: 2 },
  voteFill: { height: 12, backgroundColor: '#8eff71', borderRadius: 6 },
  voteStripBottom: { height: 12, backgroundColor: '#2b2b2b', borderRadius: 6, zIndex: 2 },
  voteFillMuted: { height: 12, backgroundColor: '#d9d9d9', borderRadius: 6 },
  vsDiamond: { position: 'absolute', top: '48.5%', left: '50%', transform: [{ translateX: -36 }, { rotate: '45deg' }], width: 72, height: 72, backgroundColor: '#0a0a0f', zIndex: 30, justifyContent: 'center', alignItems: 'center' },
  vsText: { color: '#fff', fontSize: 52 / 2, fontWeight: '900', transform: [{ rotate: '-45deg' }] },
  back: { position: 'absolute', left: 12, top: 8, zIndex: 40, padding: 8 },
});
