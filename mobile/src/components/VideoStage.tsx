import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface Props {
  uri: string;
  style?: ViewStyle;
  isActive?: boolean;
}

export function VideoStage({ uri, style, isActive = true }: Props) {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isActive]);

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        shouldPlay={isActive}
      />
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
});
