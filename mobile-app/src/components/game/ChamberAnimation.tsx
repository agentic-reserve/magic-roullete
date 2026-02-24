import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ChamberAnimationProps {
  chamber: number;
  isBullet: boolean;
  onComplete?: () => void;
}

export function ChamberAnimation({ chamber, isBullet, onComplete }: ChamberAnimationProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotate animation
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: chamber * 60, // 6 chambers, 360/6 = 60 degrees each
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      // Scale animation for reveal
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) {
        setTimeout(onComplete, 1000);
      }
    });
  }, [chamber, rotateAnim, scaleAnim, onComplete]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.cylinder,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.chamber,
              {
                transform: [{ rotate: `${index * 60}deg` }],
              },
            ]}
          >
            <View style={styles.chamberInner} />
          </View>
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.result,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.resultText, isBullet && styles.bulletText]}>
          {isBullet ? '💥 BANG!' : '✓ SAFE'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cylinder: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  chamber: {
    position: 'absolute',
    width: 40,
    height: 40,
    left: 80,
    top: 80,
    transformOrigin: 'center',
  },
  chamberInner: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#666',
  },
  result: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  resultText: {
    color: '#14F195',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bulletText: {
    color: '#ff4444',
  },
});
