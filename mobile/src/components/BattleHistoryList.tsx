import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

interface Props {
  battles: any[];
}

export function BattleHistoryList({ battles }: Props) {
  if (!battles?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No battle history yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={battles}
      scrollEnabled={false}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{item.title || 'Battle'}</Text>
          <Text style={[styles.result, item.won ? styles.win : styles.loss]}>
            {item.won ? 'Won' : 'Lost'}
          </Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
  },
  result: {
    fontWeight: '700',
    fontSize: 13,
  },
  win: {
    color: '#22c55e',
  },
  loss: {
    color: '#a1a1aa',
  },
  sep: {
    height: 1,
    backgroundColor: '#111',
  },
});
