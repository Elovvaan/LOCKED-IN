import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function CaptionInput({ value, onChange }: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="Add a caption..."
      placeholderTextColor="#a1a1aa"
      multiline
      maxLength={280}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    color: '#fff',
    fontSize: 15,
    paddingVertical: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
