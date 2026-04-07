import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSkillDetail } from '../hooks/useSkillDetail';
import { ResponseList } from '../components/ResponseList';
import { VideoStage } from '../components/VideoStage';
import { LoadingScreen } from '../components/LoadingScreen';
import { ErrorState } from '../components/ErrorState';
import { LiveBadge } from '../components/LiveBadge';
import { LeaderBadge } from '../components/LeaderBadge';
import { respondToSkill } from '../lib/skills';
import { Ionicons } from '@expo/vector-icons';

export function SkillDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id, mode } = route.params;
  const { data, loading, error, reload } = useSkillDetail(id);
  const [responding, setResponding] = useState(mode === 'respond');
  const [responseUrl, setResponseUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { post, responses, stats } = data;
  const isLive = post?.endsAt && new Date(post.endsAt) > new Date();

  const handleRespond = async () => {
    if (!responseUrl) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }
    setSubmitting(true);
    try {
      await respondToSkill(id, { videoUrl: responseUrl, caption });
      setResponseUrl('');
      setCaption('');
      setResponding(false);
      reload();
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 429) Alert.alert('Limit Reached', 'You can only submit 3 responses');
      else Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{post?.title}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          <VideoStage uri={post?.videoUrl} />
          <View style={styles.videoBadges}>
            {isLive && <LiveBadge />}
            {post?.currentLeader && (
              <LeaderBadge username={post.currentLeader.username} voteCount={post.currentLeader.voteCount} />
            )}
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={styles.title}>{post?.title}</Text>
          {post?.caption && <Text style={styles.caption}>{post.caption}</Text>}
          <Text style={styles.creator}>by @{post?.creator?.username}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>{stats?.responseCount || 0} responses</Text>
            <Text style={styles.stat}>{stats?.totalVotes || 0} votes</Text>
          </View>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => setResponding(r => !r)}
            >
              <Ionicons name="videocam-outline" size={18} color="#000" />
              <Text style={styles.ctaText}>Respond</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaButton, styles.battleButton]}
              onPress={() => navigation.navigate('BattleMode', { id })}
            >
              <Ionicons name="flash-outline" size={18} color="#000" />
              <Text style={styles.ctaText}>Battle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {responding && (
          <View style={styles.respondForm}>
            <Text style={styles.sectionTitle}>Your Response</Text>
            <TextInput
              style={styles.input}
              value={responseUrl}
              onChangeText={setResponseUrl}
              placeholder="Video URL"
              placeholderTextColor="#a1a1aa"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, styles.captionInput]}
              value={caption}
              onChangeText={setCaption}
              placeholder="Caption (optional)"
              placeholderTextColor="#a1a1aa"
              multiline
            />
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitDisabled]}
              onPress={handleRespond}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.submitText}>Submit Response</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.responses}>
          <Text style={styles.sectionTitle}>Responses ({responses?.length || 0})</Text>
          <ResponseList responses={responses || []} />
        </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  back: { padding: 4 },
  headerTitle: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  scroll: { flex: 1 },
  videoContainer: { height: 320, position: 'relative' },
  videoBadges: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  meta: { padding: 16, gap: 8 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  caption: { color: '#a1a1aa', fontSize: 14 },
  creator: { color: '#a1a1aa', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  stat: { color: '#a1a1aa', fontSize: 13 },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  ctaButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  battleButton: {},
  ctaText: { color: '#000', fontWeight: '700', fontSize: 14 },
  respondForm: {
    margin: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 16, paddingHorizontal: 16, paddingTop: 8 },
  input: {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  captionInput: { minHeight: 60, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitDisabled: { backgroundColor: '#333' },
  submitText: { color: '#000', fontWeight: '700', fontSize: 15 },
  responses: { paddingBottom: 32 },
});
