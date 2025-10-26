import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Localization from 'expo-localization';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';

type IntroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Intro'>;

interface Props {
  navigation: IntroScreenNavigationProp;
}

const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const { isTablet } = useDeviceInfo();
  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  // 現在の言語設定の状態
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');
  // 画面幅の状態
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  // 段組み数を決定する関数
  const getColumnsCount = (width: number): number => {
    if (width < 600) { // スマホ縦
      return 2;
    } else if (width < 900) { // スマホ横, タブレット縦
      return 3;
    } else { // タブレット横
      return 4;
    }
  };

  const [columnsCount, setColumnsCount] = useState(getColumnsCount(screenWidth));

  // アプリ起動時に保存された言語設定を読み込む & 画面を縦向きに設定
  useEffect(() => {
    const initializeSettings = async () => {
      await loadLanguageSetting();
      // IntroScreen表示時は常に縦向きに設定
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
    initializeSettings();
  }, []);

  const loadLanguageSetting = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
        // 保存された言語設定がある場合はそれを使用
        setCurrentLanguage(savedLanguage);
      } else {
        // 初回起動時：OS言語設定に基づいて言語を決定
        const osLanguage = Localization.getLocales()[0]?.languageCode || 'en';
        const initialLanguage = osLanguage === 'ja' ? 'ja' : 'en';
        setCurrentLanguage(initialLanguage);
        // 決定した言語をAsyncStorageに保存
        await AsyncStorage.setItem('app_language', initialLanguage);
      }
    } catch (error) {
      console.error('言語設定の読み込みに失敗しました:', error);
      // エラーの場合はデフォルトで英語を設定
      setCurrentLanguage('en');
    }
  };
  
  const handleComplete = async () => {
    try {
      // イントロ完了フラグをAsyncStorageに保存
      await AsyncStorage.setItem('introduction_completed', 'true');
      // HomeScreenへ遷移
      navigation.replace('Home');
    } catch (error) {
      console.error('イントロ完了状態の保存に失敗しました:', error);
      // エラーが発生してもHomeScreenへ遷移
      navigation.replace('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>あやとりへようこそ</Text>
        <Text style={styles.description}>
          日本の伝統的なあやとりを学びましょう{'\n'}
          さまざまな作り方を動画で紹介します
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>はじめる</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e6e0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    color: '#5D4037',
    fontFamily: Platform.OS === 'ios' ? 'KleeOne-SemiBold' : 'KleeOne-SemiBold',
    fontWeight: Platform.OS === 'android' ? '600' : 'normal',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#5D4037',
    fontFamily: Platform.OS === 'ios' ? 'KleeOne-Regular' : 'KleeOne-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#5D4037',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'KleeOne-SemiBold' : 'KleeOne-SemiBold',
    fontWeight: Platform.OS === 'android' ? '600' : 'normal',
  },
});

export default IntroScreen;
