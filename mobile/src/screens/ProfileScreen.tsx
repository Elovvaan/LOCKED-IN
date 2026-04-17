import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';


export function ProfileScreen() {
  const route = useRoute<any>();
  const { logout, userId } = useAuth();
  const id = route.params?.id || userId || 1;
  const { data, loading, error, reload } = useProfile(id);

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const user = data?.user || { username: 'lex_ironfoot', bio: 'Urban Athletics | Elite Tier' };
  const cards = [
    { label: 'TOTAL WINS', value: String(data?.user?.eventsWon ?? '—') },
    { label: 'CHALLENGE WINS', value: String(data?.challengeWins ?? '—') },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}><View style={styles.userHead}><Image source={{ uri: 'https://i.pravatar.cc/80?img=15' }} style={styles.avatar} /><Text style={styles.logo}>LOCKED-IN</Text></View><Ionicons name="search" size={28} color="#58ff37" /></View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1567013127542-490d757e6349?auto=format&fit=crop&w=500&q=80' }} style={styles.heroImg} />
        <View style={styles.proTag}><Text style={styles.proText}>PRO</Text></View>
        <Text style={styles.name}>{String(user.username).toUpperCase()}</Text>
        <Text style={styles.sub}>{user.bio || 'Urban Athletics | Elite Tier'}</Text>

        <View style={styles.statsRow}>{cards.map(c => <View key={c.label} style={styles.statCard}><Text style={styles.statLabel}>{c.label}</Text><Text style={styles.statValue}>{c.value}</Text></View>)}</View>

        <View style={styles.sectionRow}><Text style={styles.section}>TOP SKILLS</Text><Text style={styles.mastery}>VIEW MASTERY</Text></View>
        <View style={styles.skillsRow}><View style={styles.skillCard}><Text style={styles.skillTitle}>EXPLOSIVE POWER</Text><Text style={styles.skillValue}>LVL 84</Text></View><View style={styles.skillCard}><Text style={styles.skillTitle}>SPRINT SPEED</Text><Text style={styles.skillValue}>LVL 91</Text></View></View>

        <Text style={styles.section}>BATTLE HISTORY</Text>
        {[0, 1, 2].map((_: any, i: number) => (
          <View key={i} style={styles.historyRow}>
            <View style={styles.thumb} />
            <View style={{ flex: 1 }}><Text style={styles.historyTitle}>{['STREET OVERLOAD', 'ZEN MASTERY', 'POWER SLAM'][i]}</Text><Text style={styles.historyMeta}>vs Rival_{i + 1} • {i === 0 ? '2h ago' : i === 1 ? 'Yesterday' : '2d ago'}</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={[styles.badge, i === 1 ? styles.loss : styles.win]}>{i === 1 ? 'LOSS' : 'WIN'}</Text><Text style={styles.xp}>{i === 1 ? '-120 XP' : '+450 XP'}</Text></View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.logout} onPress={logout}><Text style={styles.logoutText}>LOGOUT</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#111' },
  userHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 8, borderWidth: 1, borderColor: '#8eff71' },
  logo: { color: '#58ff37', fontSize: 38 / 2, fontWeight: '900', fontStyle: 'italic' },
  content: { padding: 16, paddingBottom: 130 },
  heroImg: { width: 184, height: 184, alignSelf: 'center' },
  proTag: { alignSelf: 'center', marginTop: -16, backgroundColor: '#8eff71', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  proText: { color: '#0d6100', fontWeight: '900', fontSize: 16 * 0.9 },
  name: { marginTop: 18, textAlign: 'center', color: '#fff', fontSize: 64 / 2, fontWeight: '900' },
  sub: { textAlign: 'center', color: '#ababab', fontSize: 18 * 0.9, marginTop: 6 },
  statsRow: { marginTop: 24, flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#131313', padding: 18 },
  statLabel: { color: '#ababab', letterSpacing: 2, fontSize: 11 },
  statValue: { color: '#8eff71', fontSize: 38 / 2, fontWeight: '900', marginTop: 6 },
  sectionRow: { marginTop: 26, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
  section: { color: '#ababab', letterSpacing: 3, fontSize: 12, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  mastery: { color: '#8eff71', fontWeight: '800', marginTop: 22 },
  skillsRow: { flexDirection: 'row', gap: 10 },
  skillCard: { flex: 1, backgroundColor: '#131313', height: 160, padding: 14, justifyContent: 'flex-end' },
  skillTitle: { color: '#8eff71', fontWeight: '700', fontSize: 24 / 2 },
  skillValue: { color: '#fff', fontWeight: '900', fontSize: 40 / 2, marginTop: 6 },
  historyRow: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#131313', padding: 12, marginBottom: 10 },
  thumb: { width: 56, height: 56, backgroundColor: '#1f1f1f' },
  historyTitle: { color: '#fff', fontWeight: '800', fontSize: 17 * 0.95 },
  historyMeta: { color: '#ababab', fontSize: 12, marginTop: 4 },
  badge: { fontSize: 12, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 13, overflow: 'hidden' },
  win: { color: '#8eff71', backgroundColor: 'rgba(110,255,90,0.15)' },
  loss: { color: '#ff8f63', backgroundColor: 'rgba(255,143,99,0.18)' },
  xp: { color: '#e2e2e2', fontWeight: '800', marginTop: 6 },
  logout: { position: 'absolute', right: 16, top: 52, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#1f1f1f' },
  logoutText: { color: '#ababab', fontWeight: '700', fontSize: 12 },
});
