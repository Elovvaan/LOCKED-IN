import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  responseCount: number;
  voteCount: number;
  battleReady?: boolean;
  onRespond?: () => void;
  onBattle?: () => void;
  onEvent?: () => void;
  onShare?: () => void;
  onProfile?: () => void;
}

export function ActionRail({ responseCount, voteCount, battleReady, onRespond, onBattle, onEvent, onShare, onProfile }: Props) {
  return (
    <View style={styles.container}>
      <ActionItem icon="videocam-outline" label={String(responseCount)} onPress={onRespond} />
      <ActionItem icon="flash-outline" label="Battle" onPress={onBattle} dimmed={battleReady === false} />
      <ActionItem icon="calendar-outline" label={String(voteCount)} onPress={onEvent} />
      <ActionItem icon="share-social-outline" label="Share" onPress={onShare} />
      <ActionItem icon="person-circle-outline" label="Profile" onPress={onProfile} />
    </View>
  );
}

function ActionItem({ icon, label, onPress, dimmed }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; dimmed?: boolean }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={dimmed ? 0.5 : 0.7} disabled={!!dimmed}>
      <Ionicons name={icon} size={30} color={dimmed ? '#555' : '#fff'} />
      <Text style={[styles.label, dimmed && styles.dimmedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 18,
  },
  item: {
    alignItems: 'center',
    gap: 3,
  },
  label: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  dimmedLabel: {
    color: '#555',
  },
});
