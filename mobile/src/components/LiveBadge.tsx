import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export function LiveBadge() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity }]} />
      <Text style={styles.text}>LIVE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  text: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
