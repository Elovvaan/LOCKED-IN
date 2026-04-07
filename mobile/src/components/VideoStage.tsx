import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle, ActivityIndicator, Text } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface Props {
  uri: string;
  style?: ViewStyle;
  isActive?: boolean;
}

export function VideoStage({ uri, style, isActive = true }: Props) {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isActive]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.warn('[VideoStage] Playback error:', status.error);
        setHasError(true);
        setIsLoading(false);
      }
    } else {
      if (isLoading) setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {!hasError && (
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
          shouldPlay={isActive}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
      )}
      {isLoading && !hasError && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      )}
      {hasError && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>Video unavailable</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  video: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorText: {
    color: '#a1a1aa',
    fontSize: 15,
    textAlign: 'center',
  },
});
