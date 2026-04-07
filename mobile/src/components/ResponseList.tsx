import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { ResponseCard } from './ResponseCard';

interface Props {
  responses: any[];
  onPressResponse?: (r: any) => void;
}

export function ResponseList({ responses, onPressResponse }: Props) {
  if (!responses.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No responses yet. Be the first!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={responses}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => (
        <ResponseCard response={item} onPress={() => onPressResponse?.(item)} />
      )}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  sep: {
    height: 2,
    backgroundColor: '#000',
  },
});
