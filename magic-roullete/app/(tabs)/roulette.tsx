import React, { useState } from 'react'
import { View, StyleSheet, Animated, Pressable, ScrollView } from 'react-native'
import { AppPage } from '@/components/app-page'
import { AppText } from '@/components/app-text'
import { Colors } from '@/constants/colors'
import { useColorScheme } from '@/hooks/use-color-scheme'

const NUMBERS = Array.from({ length: 37 }, (_, i) => i) // 0-36
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export default function RouletteScreen() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'dark']
  
  const [selectedBet, setSelectedBet] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState(0.1)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [spinValue] = useState(new Animated.Value(0))

  const spinWheel = () => {
    if (spinning) return
    
    setSpinning(true)
    setResult(null)
    
    const winningNumber = Math.floor(Math.random() * 37)
    
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setResult(winningNumber)
      setSpinning(false)
      spinValue.setValue(0)
    })
  }

  const getNumberColor = (num: number) => {
    if (num === 0) return colors.primary
    return RED_NUMBERS.includes(num) ? colors.accent : colors.text
  }

  return (
    <AppPage>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <AppText style={[styles.title, { color: colors.text }]}>
            🤠 SALOON ROULETTE 🤠
          </AppText>
          <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Place your bets, partner!
          </AppText>
        </View>

        {/* Wheel Display */}
        <View style={[styles.wheelContainer, { borderColor: colors.border }]}>
          <Animated.View
            style={[
              styles.wheel,
              {
                backgroundColor: colors.backgroundSecondary,
                transform: [
                  {
                    rotate: spinValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '1440deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <AppText style={[styles.wheelText, { color: colors.primary }]}>
              {spinning ? '🎰' : result !== null ? result : '?'}
            </AppText>
          </Animated.View>
        </View>

        {/* Result Display */}
        {result !== null && !spinning && (
          <View style={[styles.resultContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <AppText style={[styles.resultText, { color: colors.text }]}>
              Winning Number: {result}
            </AppText>
            <AppText style={[styles.resultSubtext, { color: getNumberColor(result) }]}>
              {result === 0 ? 'GREEN' : RED_NUMBERS.includes(result) ? 'RED' : 'BLACK'}
            </AppText>
            {selectedBet === result && (
              <AppText style={[styles.winText, { color: colors.primary }]}>
                🎉 YOU WIN! 🎉
              </AppText>
            )}
          </View>
        )}

        {/* Betting Grid */}
        <View style={styles.bettingGrid}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>
            Select Your Number
          </AppText>
          <View style={styles.numbersGrid}>
            {NUMBERS.slice(0, 19).map((num) => (
              <Pressable
                key={num}
                style={[
                  styles.numberButton,
                  {
                    backgroundColor: selectedBet === num ? colors.primary : colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedBet(num)}
                disabled={spinning}
              >
                <AppText
                  style={[
                    styles.numberText,
                    { color: selectedBet === num ? colors.background : getNumberColor(num) },
                  ]}
                >
                  {num}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.numbersGrid}>
            {NUMBERS.slice(19).map((num) => (
              <Pressable
                key={num}
                style={[
                  styles.numberButton,
                  {
                    backgroundColor: selectedBet === num ? colors.primary : colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedBet(num)}
                disabled={spinning}
              >
                <AppText
                  style={[
                    styles.numberText,
                    { color: selectedBet === num ? colors.background : getNumberColor(num) },
                  ]}
                >
                  {num}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Spin Button */}
        <Pressable
          style={[
            styles.spinButton,
            {
              backgroundColor: spinning || selectedBet === null ? colors.backgroundSecondary : colors.primary,
              borderColor: colors.border,
            },
          ]}
          onPress={spinWheel}
          disabled={spinning || selectedBet === null}
        >
          <AppText style={[styles.spinButtonText, { color: colors.background }]}>
            {spinning ? '🎰 SPINNING...' : selectedBet === null ? 'SELECT A NUMBER' : `🎲 SPIN (${betAmount} SOL)`}
          </AppText>
        </Pressable>
      </ScrollView>
    </AppPage>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    borderWidth: 4,
    borderRadius: 120,
    width: 240,
    height: 240,
    alignSelf: 'center',
  },
  wheel: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultSubtext: {
    fontSize: 18,
    marginTop: 4,
    fontWeight: '600',
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bettingGrid: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  numberButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    marginTop: 'auto',
  },
  spinButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})
