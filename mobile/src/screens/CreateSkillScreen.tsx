import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCreateSkill } from '../hooks/useCreateSkill';
import { VideoPicker } from '../components/VideoPicker';

const stadium = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80';

export function CreateSkillScreen() {
  const navigation = useNavigation<any>();
  const { submit, loading, error } = useCreateSkill();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const handleSubmit = async () => {
    if (!videoUri || !title.trim()) return Alert.alert('Required', 'Video and title are required.');
    const result = await submit({ videoUrl: videoUri, title: title.trim(), caption: caption.trim() || undefined, endsAt: endsAt || undefined });
    if (result) Alert.alert('Posted', 'Your challenge is now live.', [{ text: 'OK', onPress: () => navigation.navigate('Home') }]);
    else if (error) Alert.alert('Error', error);
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: stadium }} style={styles.hero}><View style={styles.heroMask} />
        <Text style={styles.heroTitle}>UPLOAD CHALLENGE VIDEO</Text>
        <Text style={styles.heroSub}>Show the world what they need to beat. High quality video increases engagement.</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.content}>
        <VideoPicker onPicked={setVideoUri} />
        <Text style={styles.fieldLabel}>EXACT CHALLENGE TITLE *</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="E.G. 50 UNBROKEN BURPEES" placeholderTextColor="#4f4f4f" style={styles.input} />

        <Text style={styles.fieldLabel}>CAPTION (OPTIONAL)</Text>
        <TextInput value={caption} onChangeText={setCaption} placeholder="Tell the arena why you're the best..." placeholderTextColor="#4f4f4f" multiline style={[styles.input, styles.multiline]} />

        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <TouchableOpacity style={styles.input}><Text style={styles.inputText}>ATHLETICS</Text><Ionicons name="chevron-down" size={18} color="#8b8b8b" /></TouchableOpacity>

        <Text style={styles.fieldLabel}>END TIME</Text>
        <View style={styles.input}><TextInput value={endsAt} onChangeText={setEndsAt} placeholder="mm/dd/yyyy, --:-- --" placeholderTextColor="#d4d4d4" style={styles.dtInput} /><Ionicons name="calendar-outline" size={17} color="#fff" /></View>

        <View style={styles.chipCard}><View style={styles.victoryChip}><Text style={styles.victoryText}>VICTORY CHIP</Text></View><Text style={styles.chipDesc}>Unlock this badge for your profile upon winning.</Text><Ionicons name="shield-checkmark" size={20} color="#8eff71" /></View>

        <TouchableOpacity onPress={handleSubmit} disabled={loading || !videoUri || !title.trim()}>
          <LinearGradient colors={['#8eff71', '#2ff801']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitBtn}>
            <Text style={styles.submitText}>{loading ? 'POSTING...' : 'POST CHALLENGE  ➤'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  hero: { height: 280, justifyContent: 'flex-end', padding: 22 },
  heroMask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  heroTitle: { color: '#fff', fontSize: 36 / 2, fontWeight: '900', zIndex: 1, textAlign: 'center', marginBottom: 8 },
  heroSub: { color: '#ababab', textAlign: 'center', fontSize: 15, zIndex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  fieldLabel: { color: '#ababab', letterSpacing: 2.5, fontSize: 11, fontWeight: '700', marginBottom: 10, marginTop: 22 },
  input: { backgroundColor: '#262626', minHeight: 58, paddingHorizontal: 14, color: '#fff', fontWeight: '700', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' },
  multiline: { minHeight: 84, textAlignVertical: 'top', paddingTop: 16 },
  inputText: { color: '#fff', fontSize: 26 / 2, fontWeight: '700' },
  dtInput: { flex: 1, color: '#fff', fontWeight: '700' },
  chipCard: { marginTop: 22, backgroundColor: '#131313', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  victoryChip: { backgroundColor: '#8eff71', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 12 },
  victoryText: { color: '#0d6100', fontWeight: '900', fontSize: 12 },
  chipDesc: { flex: 1, color: '#cbcbcb', fontSize: 14 },
  submitBtn: { marginTop: 24, paddingVertical: 18, alignItems: 'center', borderRadius: 4 },
  submitText: { color: '#093900', fontWeight: '900', fontSize: 28 / 2, letterSpacing: 2.5 },
});
