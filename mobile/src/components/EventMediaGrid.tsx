import React from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { VideoStage } from './VideoStage';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3;

interface Props {
  media: any[];
}

export function EventMediaGrid({ media }: Props) {
  return (
    <FlatList
      data={media}
      numColumns={3}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item}>
          <VideoStage uri={item.videoUrl || item.url} style={styles.video} isActive={false} />
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
    backgroundColor: '#111',
  },
  video: {
    flex: 1,
  },
});
