import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { Card } from '../components/ui';
import { useWallet } from '../contexts/WalletContext';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { connected, disconnect } = useWallet();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {connected && (
            <Card style={styles.settingCard}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={handleDisconnect}
              >
                <Text style={styles.settingLabel}>Disconnect Wallet</Text>
                <Text style={styles.settingAction}>→</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#333', true: '#9945FF' }}
                thumbColor={notifications ? '#14F195' : '#666'}
              />
            </View>
          </Card>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{ false: '#333', true: '#9945FF' }}
                thumbColor={soundEffects ? '#14F195' : '#666'}
              />
            </View>
          </Card>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{ false: '#333', true: '#9945FF' }}
                thumbColor={hapticFeedback ? '#14F195' : '#666'}
              />
            </View>
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <Card style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
              <Text style={styles.settingAction}>→</Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.settingAction}>→</Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>0.1.0</Text>
            </View>
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <Card style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Help Center</Text>
              <Text style={styles.settingAction}>→</Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Report a Bug</Text>
              <Text style={styles.settingAction}>→</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingCard: {
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
  },
  settingValue: {
    color: '#999',
    fontSize: 16,
  },
  settingAction: {
    color: '#9945FF',
    fontSize: 20,
  },
});
