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
import { RootStackParamList, StringFigure } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import StringFigureCard from '../components/StringFigureCard';

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

  const renderCard = (item: StringFigure, disabled: boolean) => {
    const imageInfo = imageDimensions[item.id];
    let calculatedHeight = 200; // デフォルト高さ
    
    if (imageInfo) {
      // カードの幅を取得（画面幅を段組み数で割った値から余白を引く）
      const totalHorizontalPadding = 40; // 左右のpadding 20px × 2
      const gapBetweenColumns = (columnsCount - 1) * 15; // カラム間のgap
      const cardWidth = (screenWidth - totalHorizontalPadding - gapBetweenColumns) / columnsCount;
      calculatedHeight = (imageInfo.height / imageInfo.width) * cardWidth;
      // 最大高さを制限
      calculatedHeight = Math.min(calculatedHeight, 300);
    }
        
    return (
      <StringFigureCard
        key={item.id}
        disabled={disabled}
        item={item}
        bookmarked={false}
        calculatedHeight={calculatedHeight}
        currentLanguage={currentLanguage}
        onPress={handleItemPress}
        onImageLoad={handleImageLoad}
      />
    );
  };

  const handleImageLoad = (itemId: string, event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions(prev => ({
      ...prev,
      [itemId]: { width, height }
    }));
  };

  const handleItemPress = (item: StringFigure) => {
    navigation.navigate('IntroVideo');
  }


  // マルチカラムレイアウト用にカラムに分ける
  const organizeIntoColumns = (items: StringFigure[], numColumns: number) => {
    const columns: StringFigure[][] = Array.from({ length: numColumns }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(item);
    });
    
    return columns;
  };

  const filteredStringFigures: StringFigure[] = [
    { id: '1',
      name: { ja: 'はじめに', en: 'Introduction' },
      difficulty: 'easy',
      directory: '0_introduction',
      thumbnail: require('../../assets/string-figures/0_introduction/thumbnail.jpg'),
      patternImage: require('../../assets/string-figures/1_star/pattern.jpg'),
      previewUrl: require('../../assets/string-figures/1_star/preview.mp4'),
      description: { ja: 'このアプリの操作方法の紹介です', en: 'Introduction to the operation of this app.' },
      premiumCourseId: 0,
    },
    {
      id: '2',
      name: { ja: '四段ばしご', en: 'Jacob\'s Ladder' },
      difficulty: 'easy',
      directory: '2_jacobs-ladder',
      thumbnail: require('../../assets/string-figures/2_jacobs-ladder/thumbnail.jpg'),
      patternImage: require('../../assets/string-figures/2_jacobs-ladder/pattern.jpg'),
      previewUrl: require('../../assets/string-figures/2_jacobs-ladder/preview.mp4'),
      description: { ja: '日本では中指を主に使う「四段ばしご」、世界では人差し指を使う「ヤコブの梯子」という名前で知られています。ここでは人差し指を使ってとる方法を紹介します。', en: 'Description for Jacob\'s Ladder.' },
      premiumCourseId: 0,
    },
    {
      id: '3',
      name: { ja: '蜘蛛の巣', en: 'Spiderweb' },
      difficulty: 'easy',
      directory: '3_spiderweb',
      thumbnail: require('../../assets/string-figures/3_spiderweb/thumbnail.jpg'),
      patternImage: require('../../assets/string-figures/3_spiderweb/pattern.jpg'),
      previewUrl: require('../../assets/string-figures/3_spiderweb/preview.mp4'),
      description: { ja: '蜘蛛の巣の説明文です。', en: 'Description for Spiderweb.' },
      premiumCourseId: 1,
    },
    {
      id: '4',
      name: { ja: '火山', en: 'Volcano' },
      difficulty: 'medium',
      directory: '4_volcano',
      thumbnail: require('../../assets/string-figures/4_volcano/thumbnail.jpg'),
      patternImage: require('../../assets/string-figures/4_volcano/pattern.jpg'),
      previewUrl: require('../../assets/string-figures/4_volcano/preview.mp4'),
      description: { ja: '火山の説明文です。', en: 'Description for Volcano.' },
      premiumCourseId: 2,
    },
    {
      id: '5',
      name: { ja: 'たくさんの星', en: 'Many Stars' },
      difficulty: 'easy',
      directory: '5_many-stars',
      thumbnail: require('../../assets/string-figures/5_many-stars/thumbnail.jpg'),
      patternImage: require('../../assets/string-figures/5_many-stars/pattern.jpg'),
      previewUrl: require('../../assets/string-figures/5_many-stars/preview.mp4'),
      description: { ja: 'たくさんの星の説明文です。', en: 'Description for Many Stars.' },
      premiumCourseId: 0,
    },
  ]; // あやとりデータの配列

  const columns = organizeIntoColumns(filteredStringFigures, columnsCount);

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={[styles.header, isTablet && styles.headerTablet]}>
        <Text style={[styles.title, isTablet && styles.titleTablet]}>
          {currentLanguage === 'ja' ? 'あやとり' : 'String Figures'}
        </Text>
      </View>

      {/* あやとり一覧 */}
      <View style={styles.gridContainer}>
        {columns.map((column, index) => (
          <View key={index} style={styles.column}>
            {column.map((item, index2) => renderCard(item, (index > 0 || index2 > 0))) /* 最初の以外はdisabled*/}
          </View>
        ))}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e6e0',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingTop: Platform.OS === 'android' ? 32 : 8, // Android用に12pt追加
  },
  headerTablet: {
    paddingVertical: 28,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    color: '#5D4037',
    fontFamily: Platform.OS === 'ios' ? 'KleeOne-SemiBold' : 'KleeOne-SemiBold',
    fontWeight: Platform.OS === 'android' ? '600' : 'normal', // Androidでのフォント重み調整
    lineHeight: Platform.OS === 'android' ? 34 : 32, // Androidでより大きなlineHeight
    includeFontPadding: false, // Androidの余分なパディングを削除
    textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto', // Android用の垂直配置
    minHeight: Platform.OS === 'android' ? 34 : undefined, // Androidで最小高さを確保
  },
  titleTablet: {
    fontSize: 48,
    lineHeight: 56,
  },
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
  },
  column: {
    flex: 1,
    gap: 15,
  },
});

export default IntroScreen;
