import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { VideoStage } from './VideoStage';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri: string;
  onRemove: () => void;
}

export function VideoPreview({ uri, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <VideoStage uri={uri} style={styles.video} />
      <TouchableOpacity style={styles.remove} onPress={onRemove}>
        <Ionicons name="close-circle" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  remove: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
  },
});
