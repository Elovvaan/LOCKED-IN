import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function ChallengeTitleInput({ value, onChange }: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="Challenge Title"
      placeholderTextColor="#a1a1aa"
      maxLength={80}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
});
