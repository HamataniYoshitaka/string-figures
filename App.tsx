import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Font from 'expo-font';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { RootStackParamList } from './src/types';
import IntroScreen from './src/screens/IntroScreen';
import IntroVideoScreen from './src/screens/IntroVideoScreen';
import IntroVoiceScreen from './src/screens/IntroVoiceScreen';
import IntroErrorScreen from './src/screens/IntroErrorScreen';  
import HomeScreen from './src/screens/HomeScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import IntroCompleteScreen from './src/screens/IntroCompleteScreen';
import AdditionalScreen from './src/screens/AdditionalScreen';
import PolicyScreen from './src/screens/PolicyScreen';

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
          'Merriweather-SemiBold': require('./assets/fonts/Merriweather/Merriweather-SemiBold.ttf'),
          'Roboto-Medium': require('./assets/fonts/Roboto/Roboto-Medium.ttf'),
          'Montserrat-SemiBold': require('./assets/fonts/Montserrat/Montserrat-SemiBold.ttf'),
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
        <Text>Now Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName={introductionCompleted ? 'Home' : 'Intro'}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="IntroVideo" component={IntroVideoScreen} />
            <Stack.Screen name="IntroVoice" component={IntroVoiceScreen} />
            <Stack.Screen name="IntroComplete" component={IntroCompleteScreen} />
            <Stack.Screen name="IntroError" component={IntroErrorScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="VideoPlayer"
              component={VideoPlayerScreen}
              options={{
                gestureEnabled: true,
              }}
            />
            <Stack.Screen name="Additional" component={AdditionalScreen} />
            <Stack.Screen name="Policy" component={PolicyScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
