import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProfile } from '../hooks/useProfile';
import { ProfileHero } from '../components/ProfileHero';
import { SkillGrid } from '../components/SkillGrid';
import { BattleHistoryList } from '../components/BattleHistoryList';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { logout, userId } = useAuth();
  const id = route.params?.id || userId;
  const { data, loading, error, reload } = useProfile(id!);
  const isOwnProfile = id === userId;

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { user, postedSkills, challengeWins, challengeDefenses, kingOfLocation } = data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {isOwnProfile && (
          <TouchableOpacity onPress={logout} style={styles.logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHero
          user={user}
          stats={{
            wins: challengeWins?.length || 0,
            defenses: challengeDefenses?.length || 0,
            events: data.liveEventLinks?.length || 0,
          }}
          isKing={!!kingOfLocation}
        />
        <Text style={styles.sectionTitle}>Skills</Text>
        <SkillGrid
          skills={postedSkills || []}
          onPress={skill => navigation.navigate('SkillDetail', { id: skill.id })}
        />
        <Text style={styles.sectionTitle}>Battle History</Text>
        <BattleHistoryList battles={challengeWins || []} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  back: { padding: 4 },
  logout: { padding: 8 },
  logoutText: { color: '#a1a1aa', fontSize: 14 },
  sectionTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
});
