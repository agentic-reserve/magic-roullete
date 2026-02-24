import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { MigrationDashboard } from '../components/MigrationDashboard';
import { MigrationPrompt } from '../components/MigrationPrompt';
import { useMigration } from '../hooks/useMigration';
import { useProgram } from '../hooks/useProgram';

/**
 * Screen for managing compressed token migration
 * Displays migration dashboard and handles migration prompts
 */
export const MigrationScreen: React.FC = () => {
  const { provider } = useProgram();
  const userId = provider?.wallet?.publicKey?.toString() || 'guest';
  
  const {
    showPrompt,
    setShowPrompt,
    migrate,
    dismissPrompt,
  } = useMigration(userId);

  const [migrating, setMigrating] = useState(false);

  const handleMigrate = async () => {
    try {
      setMigrating(true);
      // TODO: Get actual mint and amount from user input or context
      // For now, this is a placeholder
      console.log('Migration initiated');
      // await migrate(mintPubkey, amount);
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MigrationDashboard userId={userId} />
      </View>

      <MigrationPrompt
        visible={showPrompt}
        userId={userId}
        onClose={() => setShowPrompt(false)}
        onMigrate={handleMigrate}
        onDismiss={dismissPrompt}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
  content: {
    flex: 1,
  },
});
