import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletContextProvider } from './src/contexts/WalletContextWeb';
import { HomeScreen } from './src/screens/HomeScreenWeb';
import { GameLobbyScreen } from './src/screens/GameLobbyScreenWeb';
import { CreateGameScreen } from './src/screens/CreateGameScreenWeb';
import { GamePlayScreen } from './src/screens/GamePlayScreenWeb';
import './polyfill';

const Stack = createNativeStackNavigator();

export default function AppWeb() {
  return (
    <WalletContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f1e' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
          <Stack.Screen name="CreateGame" component={CreateGameScreen} />
          <Stack.Screen name="GamePlay" component={GamePlayScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletContextProvider>
  );
}
