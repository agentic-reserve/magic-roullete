/**
 * Seeker Device Badge Component
 * Displays a badge if user is on a Seeker device
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isSeekerDevice, getDeviceInfo } from '../lib/seeker/SeekerDetection';

export function SeekerBadge() {
  const [isSeeker, setIsSeeker] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const info = getDeviceInfo();
    setIsSeeker(info.isSeeker);
    setDeviceInfo(info);
  }, []);

  if (!isSeeker) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>⚡ Seeker Device</Text>
      </View>
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            {deviceInfo?.manufacturer} {deviceInfo?.model}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  badge: {
    backgroundColor: '#14F195',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  debugInfo: {
    marginTop: 4,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
