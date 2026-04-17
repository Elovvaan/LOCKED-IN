import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image, ImageBackground } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEvent } from '../hooks/useEvent';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';

const arenaBg = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80';

export function EventDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const id = route.params?.id ?? 1;
  const { data, loading, error, reload } = useEvent(id);

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const event = data?.event || { name: 'Neo-Tokyo Drift Invitational', location: 'Tokyo Cyberdeck Arena', startsAt: new Date().toISOString() };

  return (
    <View style={styles.container}>
      <View style={styles.header}><View style={styles.headLeft}><Image source={{ uri: 'https://i.pravatar.cc/60?img=14' }} style={styles.avatar} /><Text style={styles.logo}>LOCKED-IN</Text></View><Ionicons name="search" size={24} color="#58ff37" /></View>
      <ScrollView contentContainerStyle={styles.content}>
        <ImageBackground source={{ uri: arenaBg }} style={styles.hero}><View style={styles.heroMask} /><Text style={styles.live}>LIVE EVENT</Text><Text style={styles.stage}>SEASON 04 • QUALIFIER</Text><Text style={styles.title}>NEO-TOKYO{"\n"}DRIFT{"\n"}INVITATIONAL</Text>
          <Text style={styles.meta}>📍 {event.location.toUpperCase()}</Text><Text style={styles.meta}>🕒 FINALS • 21:00 JST</Text><Text style={styles.meta}>👁 14.2K SPECTATORS</Text></ImageBackground>

        <View style={styles.card}><View style={styles.rowBetween}><Text style={styles.cardTitle}>ELITE CONTENDERS</Text><Text style={styles.small}>12 Registered</Text></View>
          <View style={styles.grid}>{['VIPER_99', 'GHOST_K', 'LUMINA', 'JAX_R', 'ZERO_IN', 'JOIN'].map((name, i) => <View key={name} style={styles.cell}><View style={styles.portrait} /><Text style={styles.cellText}>{name}</Text></View>)}</View>
        </View>

        <View style={styles.sectionHead}><Text style={styles.cardTitle}>REVIVE THE FIRE</Text><TouchableOpacity><Text style={styles.link}>VIEW ALL →</Text></TouchableOpacity></View>
        <View style={styles.mediaRow}><View style={styles.media} /><View style={styles.media} /></View>
        <View style={styles.mediaRow}><View style={styles.media} /><View style={styles.media} /></View>

        <View style={styles.card}><View style={styles.rowBetween}><Text style={styles.cardTitle}>FINAL RESULTS</Text><Ionicons name="trophy" size={16} color="#8eff71" /></View>
          {[{ n: 'VIPER_99', p: '2,840', first: true }, { n: 'LUMINA', p: '2,710' }, { n: 'GHOST_K', p: '2,650' }].map(row => (
            <View style={[styles.resultRow, row.first && styles.champion]} key={row.n}><View style={styles.dotAvatar} /><Text style={styles.resultName}>{row.n}</Text><Text style={styles.points}>{row.p}</Text></View>
          ))}
          <TouchableOpacity style={styles.report}><Text style={styles.reportText}>SHARE FINAL REPORT</Text></TouchableOpacity>
        </View>

        <View style={styles.card}><Text style={styles.smallHead}>LOCATION INTEL</Text><View style={styles.map} /><Text style={styles.location}>Minato City, 105-0011</Text><Text style={styles.caption}>Access via underground level 4. Security clearance "Silver" required for pit access.</Text></View>
      </ScrollView>

      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  header: { paddingTop: 46, paddingHorizontal: 14, paddingBottom: 12, backgroundColor: '#111', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headLeft: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  avatar: { width: 30, height: 30, borderRadius: 6 },
  logo: { color: '#58ff37', fontWeight: '900', fontStyle: 'italic', fontSize: 30 / 2 },
  content: { paddingBottom: 110 },
  hero: { minHeight: 360, padding: 16, justifyContent: 'flex-end' },
  heroMask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  live: { color: '#0d6100', backgroundColor: '#8eff71', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, fontWeight: '900', fontSize: 10, letterSpacing: 1, zIndex: 2 },
  stage: { color: '#ababab', fontSize: 10, letterSpacing: 2, marginTop: 8, zIndex: 2 },
  title: { color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: 58 / 2, lineHeight: 31, marginTop: 10, zIndex: 2 },
  meta: { color: '#d8d8d8', fontWeight: '700', marginTop: 14, zIndex: 2, letterSpacing: 1 },
  card: { margin: 12, backgroundColor: '#131313', padding: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: 30 / 2 },
  small: { color: '#ababab', fontSize: 12 },
  grid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '31%', backgroundColor: '#1f1f1f', padding: 10, alignItems: 'center' },
  portrait: { width: 54, height: 54, borderRadius: 12, backgroundColor: '#2a2a2a', marginBottom: 8 },
  cellText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sectionHead: { marginHorizontal: 12, marginTop: 6, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: '#8eff71', fontWeight: '800', fontSize: 12 },
  mediaRow: { marginHorizontal: 12, flexDirection: 'row', gap: 8, marginBottom: 8 },
  media: { flex: 1, height: 64, backgroundColor: '#1f1f1f' },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  champion: { backgroundColor: 'rgba(142,255,113,0.2)', paddingHorizontal: 8 },
  dotAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#7a7a7a', marginRight: 10 },
  resultName: { color: '#fff', fontWeight: '900', flex: 1 },
  points: { color: '#fff', fontWeight: '900', fontSize: 26 / 2 },
  report: { marginTop: 10, backgroundColor: '#8eff71', alignItems: 'center', paddingVertical: 14 },
  reportText: { color: '#0d6100', fontWeight: '900', letterSpacing: 1.5 },
  smallHead: { color: '#ababab', letterSpacing: 2, fontSize: 11, fontWeight: '700' },
  map: { height: 88, marginTop: 12, backgroundColor: '#262626' },
  location: { color: '#fff', marginTop: 12, fontWeight: '700' },
  caption: { color: '#ababab', marginTop: 6, fontSize: 12, lineHeight: 17 },
  back: { position: 'absolute', left: 8, top: 40, padding: 6 },
});
