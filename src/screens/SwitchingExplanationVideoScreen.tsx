import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Text,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';

type SwitchingExplanationVideoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SwitchingExplanationVideo'
>;
type SwitchingExplanationVideoScreenRouteProp = RouteProp<
  RootStackParamList,
  'SwitchingExplanationVideo'
>;

interface Props {
  navigation: SwitchingExplanationVideoScreenNavigationProp;
  route: SwitchingExplanationVideoScreenRouteProp;
}

const SwitchingExplanationVideoScreen: React.FC<Props> = ({ navigation }) => {
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const { isTablet } = useDeviceInfo();

  const createPressInHandler = (scale: Animated.Value) => () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const createPressOutHandler = (scale: Animated.Value) => () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const onGoBack = () => {
    navigation.goBack();
  };

  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  const loadLanguageSetting = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('言語設定の読み込みに失敗しました:', error);
    }
  };

  useEffect(() => {
    loadLanguageSetting();
  }, []);

  const titleFontFamily =
    currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold';
  const sectionTitleFontFamily =
    currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableWithoutFeedback
          onPress={onGoBack}
          onPressIn={createPressInHandler(backButtonScale)}
          onPressOut={createPressOutHandler(backButtonScale)}
        >
          <Animated.View
            style={[styles.backButton, { transform: [{ scale: backButtonScale }] }]}
          >
            <CloseIcon width={24} height={24} fillColor="#292520" />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Text
          maxFontSizeMultiplier={1.35}
          style={[
            styles.title,
            { fontSize: isTablet ? 22 : 18, fontFamily: titleFontFamily },
          ]}
          numberOfLines={2}
        >
          {getLocalizedText({
            ja: '解説動画を切り替え中です...',
            en: 'Switching explanation videos...',
          })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>

          <View style={styles.sectionContainer}>
            <Text maxFontSizeMultiplier={1.35} style={styles.sectionDescription}>
              {getLocalizedText({
                ja: 'このアプリをご利用いただき、ありがとうございます。現在、あやとりの手順を説明する動画を順次切り替えている最中です。',
                en: 'Thank you for using this app. We are currently in the process of switching over the videos that explain how to make each string figure.',
              })}
            </Text>

            <View style={styles.heroImageWrapper}>
              <Image
                source={require('../../assets/string-figures/99997-switching/01.jpg')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            <Text
              maxFontSizeMultiplier={1.35}
              style={[styles.sectionTitle, { fontFamily: sectionTitleFontFamily }]}
            >
              {getLocalizedText({
                ja: '文字を使わずに説明',
                en: 'Explanations without text',
              })}
            </Text>
            <Text maxFontSizeMultiplier={1.35} style={styles.sectionDescription}>
              {getLocalizedText({
                ja: '文字が読めない子供や、あらゆる国や言語の人でも等しくあやとりを楽しんでいただくために、文字を使わずに制作手順が判るような動画に切り替えていきます。',
                en: 'We are switching to videos that show each step clearly without using text, so that children who cannot yet read and people of all countries and languages can enjoy string figures equally.',
              })}
            </Text>

            <Text
              maxFontSizeMultiplier={1.35}
              style={[styles.sectionTitle, { fontFamily: sectionTitleFontFamily }]}
            >
              {getLocalizedText({
                ja: 'しばらくは2種の動画が混在',
                en: 'Two types of videos for now',
              })}
            </Text>
            <Text maxFontSizeMultiplier={1.35} style={styles.sectionDescription}>
              {getLocalizedText({
                ja: '新しい動画の作成には時間がかかるため、現在このアプリは',
                en: 'Creating new videos takes time, so for now this app includes both:',
              })}
            </Text>
            <Text maxFontSizeMultiplier={1.35} style={styles.bulletItem}>
              {getLocalizedText({
                ja: '・文字による説明動画',
                en: '• Videos with on-screen text explanations',
              })}
            </Text>
            <Text maxFontSizeMultiplier={1.35} style={styles.bulletItem}>
              {getLocalizedText({
                ja: '・文字を使わない説明動画',
                en: '• Videos without on-screen text',
              })}
            </Text>
            <Text maxFontSizeMultiplier={1.35} style={styles.sectionDescription}>
              {getLocalizedText({
                ja: 'が混在しています。ちょっと見にくいかもしれませんが、順次動画を切り替えていくのでしばらくお待ちください。2026年中には全て切り替えることを目指しています。',
                en: 'It may be a little confusing for a while, but we are switching them over one by one—thank you for your patience. We aim to complete the transition for all videos by the end of 2026.',
              })}
            </Text>

            <Text
              maxFontSizeMultiplier={1.35}
              style={[styles.sectionDescription, styles.closingText]}
            >
              {getLocalizedText({
                ja: 'それでは、引き続きあやとりをお楽しみください!!',
                en: 'In the meantime, please keep enjoying string figures!!',
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  contentContainer: {
    paddingHorizontal: 6,
    paddingBottom: 32,
    alignItems: 'center',
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  heroImageWrapper: {
    alignSelf: 'stretch',
    width: '100%',
    aspectRatio: 800 / 495,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    marginTop: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  sectionContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'LineSeed-Bold',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 24,
  },
  sectionDescription: {
    fontFamily: 'LineSeed-Regular',
    fontSize: 16,
    color: '#57534D',
    lineHeight: 24,
    fontWeight: '500',
  },
  bulletItem: {
    fontFamily: 'LineSeed-Regular',
    fontSize: 16,
    color: '#57534D',
    lineHeight: 24,
    fontWeight: '500',
    paddingLeft: 8,
    marginTop: 4,
  },
  closingText: {
    marginTop: 24,
  },
});

export default SwitchingExplanationVideoScreen;
