import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import 'react-native-gesture-handler';

import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // アプリ起動時にポートレートモードに固定
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="VideoPlayer" 
          component={VideoPlayerScreen}
          options={{
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
