import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SeekerBadgeProps {
  isSeeker?: boolean;
}

export function SeekerBadge({ isSeeker = false }: SeekerBadgeProps) {
  if (!isSeeker) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>⚡ Seeker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14F195',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
