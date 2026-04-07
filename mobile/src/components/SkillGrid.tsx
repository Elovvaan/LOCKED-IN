import React from 'react';
import { FlatList, View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { VideoStage } from './VideoStage';

const { width } = Dimensions.get('window');
const ITEM = (width - 4) / 3;

interface Props {
  skills: any[];
  onPress?: (skill: any) => void;
}

export function SkillGrid({ skills, onPress }: Props) {
  return (
    <FlatList
      data={skills}
      numColumns={3}
      keyExtractor={item => String(item.id)}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => onPress?.(item)}>
          <VideoStage uri={item.videoUrl || item.thumbnailUrl} style={styles.video} isActive={false} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    width: ITEM,
    height: ITEM,
    margin: 1,
    backgroundColor: '#111',
  },
  video: {
    flex: 1,
  },
});
