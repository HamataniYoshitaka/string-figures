import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList, StringFigure, BottomSheetState } from '../types';
import DetailBottomSheet from '../components/DetailBottomSheet';
import FilterButtons from '../components/FilterButtons';
import StringFigureCard from '../components/StringFigureCard';
import DropDownMenu from '../components/DropDownMenu';
import { stringFigures } from '../data/index';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { DotsVerticalIcon } from '../components/icons';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [bottomSheet, setBottomSheet] = useState<BottomSheetState>({
    isVisible: false,
    selectedItem: null,
  });
  const { isTablet } = useDeviceInfo();

  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  
  const [selectedFilters, setSelectedFilters] = useState<('basic' | 'easy' | 'medium' | 'hard')[]>([]);
  const [isBookmarkFilterActive, setIsBookmarkFilterActive] = useState(false);

  // ドロップダウンメニューの状態
  const [isDropDownVisible, setIsDropDownVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<View>(null);
  const [showCallout, setShowCallout] = useState(false);

  // 現在の言語設定の状態
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');

  // ブックマーク済みIDのリスト
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

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
      await loadBookmarkedIds();
      // スマホの場合、HomeScreen表示時は常に縦向きに設定
      if (!isTablet) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
    initializeSettings();

    // マイクと音声認識の許可を求める
    const requestMicrophonePermissions = async () => {
      try {
          const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
          if (!granted) {
              setShowCallout(true);
          }
      } catch (error) {
          console.error('マイクの使用許可のリクエスト中にエラーが発生しました:', error);
      }
    };
    requestMicrophonePermissions();
  }, []);

  // 画面にフォーカスが戻ってきた時にブックマーク情報を再読み込み
  useFocusEffect(
    React.useCallback(() => {
      loadBookmarkedIds();
    }, [])
  );

  // 画面サイズ変更の監視
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
      setColumnsCount(getColumnsCount(window.width));
    });

    return () => subscription?.remove();
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

  const saveLanguageSetting = async (language: 'ja' | 'en') => {
    try {
      await AsyncStorage.setItem('app_language', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('言語設定の保存に失敗しました:', error);
    }
  };

  const loadBookmarkedIds = async () => {
    try {
      const savedBookmarks = await AsyncStorage.getItem('bookmarkedIds');
      if (savedBookmarks) {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('ブックマークの読み込みに失敗しました:', error);
    }
  };

  const saveBookmarkedIds = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(ids));
      setBookmarkedIds(ids);
    } catch (error) {
      console.error('ブックマークの保存に失敗しました:', error);
    }
  };

  const toggleFilter = (filter: 'basic' | 'easy' | 'medium' | 'hard') => {
    setIsBookmarkFilterActive(false);
    setSelectedFilters(prev => {
      if (prev.includes(filter)) {
        // フィルターが既に選択されている場合は削除
        return prev.filter(f => f !== filter);
      } else {
        // フィルターが選択されていない場合は追加
        return [...prev, filter];
      }
    });
  };

  // マルチカラムレイアウト用にカラムに分ける
  const organizeIntoColumns = (items: StringFigure[], numColumns: number) => {
    const columns: StringFigure[][] = Array.from({ length: numColumns }, () => []);
    
    items.forEach((item, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(item);
    });
    
    return columns;
  };

  const handleBookmarkFilterToggle = () => {
    setSelectedFilters([]);
    setIsBookmarkFilterActive(prev => !prev);
  };

  // フィルターされたデータを取得
  const filteredStringFigures = useMemo(() => {
    let figures = stringFigures;

    if (isBookmarkFilterActive) {
      figures = figures.filter(item => bookmarkedIds.includes(item.id));
    }

    if (selectedFilters.length > 0) {
      figures = figures.filter(item =>
        selectedFilters.includes(item.difficulty as 'easy' | 'medium' | 'hard')
      );
    }

    return figures;
  }, [bookmarkedIds, isBookmarkFilterActive, selectedFilters]);

  const columns = organizeIntoColumns(filteredStringFigures, columnsCount);

  const renderCard = (item: StringFigure) => {
    const imageInfo = imageDimensions[item.id];
    let calculatedHeight = 200; // デフォルト高さ
    
    if (imageInfo) {
      // カードの幅を取得（画面幅を段組み数で割った値から余白を引く）
      const totalHorizontalPadding = 40; // 左右のpadding 20px × 2
      const gapBetweenColumns = (columnsCount - 1) * 15; // カラム間のgap
      const cardWidth = (screenWidth - totalHorizontalPadding - gapBetweenColumns) / columnsCount;
      calculatedHeight = (imageInfo.height / imageInfo.width) * cardWidth;
      // 最大高さを制限
      // calculatedHeight = Math.min(calculatedHeight, 300);
    }
    
    // bookmarkedIdsとitem.idを突合してブックマーク状態を判定
    const isBookmarked = bookmarkedIds.includes(item.id);
    
    return (
      <StringFigureCard
        key={item.id}
        item={item}
        bookmarked={isBookmarked}
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
    setBottomSheet({
      isVisible: true,
      selectedItem: item,
    });
  };

  const handleCloseBottomSheet = () => {
    setBottomSheet({
      isVisible: false,
      selectedItem: null,
    });
  };

  const handlePlayVideo = (item: StringFigure) => {
    handleCloseBottomSheet();
    navigation.navigate('VideoPlayer', { stringFigure: item });
  };

  const toggleBookmark = () => {
    if (!bottomSheet.selectedItem) return;
    
    const itemId = bottomSheet.selectedItem.id;
    const newBookmarkedIds = bookmarkedIds.includes(itemId)
      ? bookmarkedIds.filter(id => id !== itemId)
      : [...bookmarkedIds, itemId];
    
    saveBookmarkedIds(newBookmarkedIds);
  };

  // メニューボタンの処理
  const handleMenuPress = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((_x, _y, _width, _height, pageX, pageY) => {
        setMenuButtonPosition({ x: pageX, y: pageY });
        setIsDropDownVisible(true);
      });
    }
  };

  const handleCloseDropDown = () => {
    setIsDropDownVisible(false);
  };

  // 言語選択ActionSheetを表示
  const showLanguageActionSheet = () => {
    // iOS/Android共通のAlert実装に統一
    Alert.alert(
      currentLanguage === 'ja' ? '言語を選択してください' : 'Select Language',
      '',
      [
        {
          text: '日本語',
          onPress: () => saveLanguageSetting('ja'),
        },
        {
          text: 'English',
          onPress: () => saveLanguageSetting('en'),
        },
        {
          text: currentLanguage === 'ja' ? 'キャンセル' : 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // ドロップダウンメニューの項目
  const dropDownItems = [
    {
      id: 'language',
      label: currentLanguage === 'ja' ? '言語' : 'Language',
      value: currentLanguage === 'ja' ? '日本語' : 'English',
      onPress: () => {
        handleCloseDropDown();
        // ドロップダウンが完全に閉じるまで少し待ってからActionSheetを表示
        setTimeout(() => {
          showLanguageActionSheet();
        }, 300);
      },
    },
    {
      id: 'subtitles',
      label: currentLanguage === 'ja' ? '動画の字幕' : 'Subtitles',
      value: currentLanguage === 'ja' ? 'あり' : 'On',
      onPress: () => {
        // TODO: 字幕設定の切り替え
        console.log('字幕設定');
      },
    },
    {
      id: 'restore',
      label: currentLanguage === 'ja' ? '購入情報を復元' : 'Restore Purchase Information',
      onPress: () => {
        // TODO: 購入情報復元処理
        console.log('購入情報復元');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ヘッダー */}
        <View style={[styles.header, isTablet && styles.headerTablet]}>
          <Text style={[styles.title, isTablet && styles.titleTablet]}>
            {currentLanguage === 'ja' ? 'あやとり' : 'String Figures'}
          </Text>
          <TouchableOpacity 
            ref={menuButtonRef}
            style={styles.menuButton}
            onPress={handleMenuPress}
          >
            <DotsVerticalIcon width={28} height={28} strokeColor="none" fillColor="#5D4037" />
          </TouchableOpacity>
        </View>

        {showCallout && (
          <View style={{paddingHorizontal: 16, marginBottom: 16}}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('IntroError')}
              activeOpacity={0.8}
              style={{ borderRadius: 8, padding: 12, borderWidth: 2, borderColor: '#cc7000ff'}}
            >
              <Text style={{ color: '#533000ff' }}>
                {currentLanguage === 'ja' ? '音声認識機が有効化されていません。このままでもアプリをご利用いただけますが、有効化することで「声」で操作できるようになり便利です' : 'The speech recognition feature is not enabled. You can still use the app as is, but enabling it will allow you to control the app with your voice.'}
              </Text>
            </TouchableOpacity>
          </View>
        
        )}
        {/* フィルターボタン */}
        <FilterButtons 
          selectedFilters={selectedFilters}
          onToggleFilter={toggleFilter}
          currentLanguage={currentLanguage}
          isBookmarkFilterActive={isBookmarkFilterActive}
          onToggleBookmarkFilter={handleBookmarkFilterToggle}
          showBookmarkButton={bookmarkedIds.length > 0}
        />

        {/* あやとり一覧 */}
        <View style={styles.gridContainer}>
          {columns.map((column, index) => (
            <View key={index} style={styles.column}>
              {column.map(renderCard)}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 詳細ボトムシート */}
      <DetailBottomSheet
        isVisible={bottomSheet.isVisible}
        item={bottomSheet.selectedItem}
        isBookmarked={bottomSheet.selectedItem ? bookmarkedIds.includes(bottomSheet.selectedItem.id) : false}
        onClose={handleCloseBottomSheet}
        onPlayVideo={handlePlayVideo}
        onToggleBookmark={toggleBookmark}
        currentLanguage={currentLanguage}
      />

      {/* ドロップダウンメニュー */}
      <DropDownMenu
        isVisible={isDropDownVisible}
        onClose={handleCloseDropDown}
        items={dropDownItems}
        buttonPosition={menuButtonPosition}
      />
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
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? 32 : 8, // Android用に12pt追加
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
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#5D4037',
  },
  scrollView: {
    flex: 1,
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
  headerTablet: {
    paddingVertical: 28,
    paddingTop: 32,
  },
  titleTablet: {
    fontSize: 48,
    lineHeight: 56,
  },
});

export default HomeScreen;
