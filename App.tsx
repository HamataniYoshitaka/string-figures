import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Font from 'expo-font';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';

import { RootStackParamList } from './src/types';
import IntroScreen from './src/screens/IntroScreen';
import HomeScreen from './src/screens/HomeScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [introductionCompleted, setIntroductionCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // フォントと初期設定の読み込み
    const loadResources = async () => {
      try {
        // フォントをロード
        await Font.loadAsync({
          'KleeOne-Regular': require('./assets/fonts/Klee_One/KleeOne-Regular.ttf'),
          'KleeOne-SemiBold': require('./assets/fonts/Klee_One/KleeOne-SemiBold.ttf'),
        });

        // イントロ完了状態を読み込む
        const completed = await AsyncStorage.getItem('introduction_completed');
        setIntroductionCompleted(completed === 'true');

        setFontLoaded(true);
      } catch (error) {
        console.warn('リソースの読み込みに失敗しました:', error);
        setIntroductionCompleted(false); // エラー時は初回起動扱い
        setFontLoaded(true); // エラーでもアプリを続行
      }
    };

    loadResources();
  }, []);

  if (!fontLoaded || introductionCompleted === null) {
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
        initialRouteName={introductionCompleted ? 'Home' : 'Intro'}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} />
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
