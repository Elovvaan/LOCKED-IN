import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPicked: (uri: string) => void;
}

export function VideoPicker({ onPicked }: Props) {
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      onPicked(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={pick} activeOpacity={0.8}>
      <Ionicons name="cloud-upload-outline" size={32} color="#22c55e" />
      <Text style={styles.text}>Pick a Video</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  text: {
    color: '#22c55e',
    fontSize: 15,
    fontWeight: '600',
  },
});
