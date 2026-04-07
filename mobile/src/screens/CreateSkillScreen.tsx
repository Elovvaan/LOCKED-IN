import React, { useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet, Alert, SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreateSkill } from '../hooks/useCreateSkill';
import { ChallengeTitleInput } from '../components/ChallengeTitleInput';
import { CaptionInput } from '../components/CaptionInput';
import { SubmitBar } from '../components/SubmitBar';
import { VideoPicker } from '../components/VideoPicker';
import { VideoPreview } from '../components/VideoPreview';

export function CreateSkillScreen() {
  const navigation = useNavigation<any>();
  const { submit, loading, error } = useCreateSkill();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    if (!videoUri) {
      Alert.alert('Error', 'Please pick a video');
      return;
    }

    const result = await submit({
      videoUrl: videoUri,
      title: title.trim(),
      caption: caption.trim() || undefined,
    });

    if (result) {
      Alert.alert('Posted!', 'Your challenge is live.', [
        { text: 'OK', onPress: () => navigation.navigate('Feed') },
      ]);
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Challenge</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {videoUri ? (
          <VideoPreview uri={videoUri} onRemove={() => setVideoUri(null)} />
        ) : (
          <VideoPicker onPicked={setVideoUri} />
        )}

        <View style={styles.fields}>
          <ChallengeTitleInput value={title} onChange={setTitle} />
          <CaptionInput value={caption} onChange={setCaption} />
        </View>
      </ScrollView>

      <SubmitBar onSubmit={handleSubmit} loading={loading} disabled={!title || !videoUri} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 20 },
  fields: { gap: 16 },
});
