import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Font from 'expo-font';
import { View, Text } from 'react-native';
import 'react-native-gesture-handler';

import { RootStackParamList } from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // フォントの設定
    const loadResources = async () => {
      try {
        // フォントをロード
        await Font.loadAsync({
          'KleeOne-Regular': require('./assets/fonts/Klee_One/KleeOne-Regular.ttf'),
          'KleeOne-SemiBold': require('./assets/fonts/Klee_One/KleeOne-SemiBold.ttf'),
        });
        
        setFontLoaded(true);
      } catch (error) {
        console.warn('フォントの読み込みに失敗しました:', error);
        setFontLoaded(true); // エラーでもアプリを続行
      }
    };

    loadResources();
  }, []);

  if (!fontLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

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
