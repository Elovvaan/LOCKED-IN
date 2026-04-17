import React from 'react';
import { ImageBackground, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

interface MediaSurfaceProps {
  uri: string;
  style: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: React.ReactNode;
}

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm'];

function isVideoUri(uri: string): boolean {
  const clean = uri.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some(ext => clean.endsWith(ext));
}

export function MediaSurface({ uri, style, imageStyle, children }: MediaSurfaceProps) {
  if (isVideoUri(uri)) {
    return (
      <View style={style}>
        <Video
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          shouldPlay
          isLooping
          isMuted
          resizeMode={ResizeMode.COVER}
        />
        {children}
      </View>
    );
  }

  return (
    <ImageBackground source={{ uri }} style={style} imageStyle={imageStyle} resizeMode="cover">
      {children}
    </ImageBackground>
  );
}
