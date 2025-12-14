import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList, StringFigure } from '../types';
import DetailBottomSheet, { DetailBottomSheetRef } from '../components/DetailBottomSheet';
import FilterButtons from '../components/FilterButtons';
import StringFigureCard from '../components/StringFigureCard';
import DropDownMenu from '../components/DropDownMenu';
import { stringFigures } from '../data/index';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { DotsVerticalIcon } from '../components/icons';
import MicrophoneQuestionIcon from '../components/icons/MicrophoneQuestion';
import { showLanguageSelectionDialog } from '../components/LanguageSwitchButton';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const DEFAULT_SELECTED_FILTERS: ('basic' | 'easy' | 'medium' | 'hard')[] = ['basic', 'easy'];

const CommercialCollection1: StringFigure = { 
  id: '99998',
  name: { ja: '追加コレクションを見る', en: 'See Additional Collection' },
  difficulty: 'basic',
  directory: '99998_additional-collection',
  thumbnail: require('../../assets/purchase/dummy-card1.jpg'),
  patternImage: require('../../assets/string-figures/1_star/pattern.jpg'),
  previewUrl: require('../../assets/string-figures/1_star/preview.mp4'),
  description: { ja: '追加コレクションを見る', en: 'See Additional Collection.' },
  premiumCourseId: 0,
  directNavigationDestination: 'Additional',
  data: null,
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const bottomSheetRef = useRef<DetailBottomSheetRef>(null);
  const [selectedItem, setSelectedItem] = useState<StringFigure | null>(null);
  const { isTablet } = useDeviceInfo();

  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  
  const [selectedFilters, setSelectedFilters] = useState<('basic' | 'easy' | 'medium' | 'hard' | 'two_people')[]>(DEFAULT_SELECTED_FILTERS);
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

  // 購入済みアイテムのリスト
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]);

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
      await Promise.all([loadBookmarkedIds(), loadSelectedFilters(), loadPurchasedItems()]);
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
      loadSelectedFilters();
      loadPurchasedItems();
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

  const loadSelectedFilters = async () => {
    try {
      const savedFilters = await AsyncStorage.getItem('selectedFilters');
      if (!savedFilters) {
        setSelectedFilters(DEFAULT_SELECTED_FILTERS);
        saveSelectedFilters(DEFAULT_SELECTED_FILTERS);
        return;
      }
      const parsedFilters = JSON.parse(savedFilters);
      if (!Array.isArray(parsedFilters)) {
        setSelectedFilters(DEFAULT_SELECTED_FILTERS);
        saveSelectedFilters(DEFAULT_SELECTED_FILTERS);
        return;
      }
      const validFilters = parsedFilters.filter((filter: unknown): filter is 'basic' | 'easy' | 'medium' | 'hard' | 'two_people' =>
        filter === 'basic' || filter === 'easy' || filter === 'medium' || filter === 'hard' || filter === 'two_people'
      );
      setSelectedFilters(validFilters.length > 0 ? validFilters : []);
    } catch (error) {
      console.error('フィルターの読み込みに失敗しました:', error);
    }
  };

  const loadPurchasedItems = async () => {
    try {
      const savedPurchasedItems = await AsyncStorage.getItem('purchasedItems');
      if (savedPurchasedItems) {
        const parsedItems = JSON.parse(savedPurchasedItems);
        if (Array.isArray(parsedItems)) {
          setPurchasedItems(parsedItems);
        } else {
          setPurchasedItems([]);
        }
      } else {
        setPurchasedItems([]);
      }
    } catch (error) {
      console.error('購入済みアイテムの読み込みに失敗しました:', error);
      setPurchasedItems([]);
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

  const saveSelectedFilters = async (filters: ('basic' | 'easy' | 'medium' | 'hard' | 'two_people')[]) => {
    try {
      await AsyncStorage.setItem('selectedFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('フィルターの保存に失敗しました:', error);
    }
  };

  const toggleFilter = (filter: 'basic' | 'easy' | 'medium' | 'hard' | 'two_people') => {
    setIsBookmarkFilterActive(false);
    setSelectedFilters(prev => {
      let updatedFilters: ('basic' | 'easy' | 'medium' | 'hard' | 'two_people')[];
      if (prev.includes(filter)) {
        // フィルターが既に選択されている場合は削除
        updatedFilters = prev.filter(f => f !== filter);
      } else {
        // フィルターが選択されていない場合は追加
        updatedFilters = [...prev, filter];
      }
      saveSelectedFilters(updatedFilters);
      return updatedFilters;
    });
  };

  // マルチカラムレイアウト用にカラムに分ける
  const organizeIntoColumns = (items: StringFigure[], numColumns: number) => {
    const columns: StringFigure[][] = Array.from({ length: numColumns }, () => []);
    
    // premiumCourseId === 0 または purchasedItems に含まれるものをフィルタリング
    const filteredItems = items.filter(item => 
      item.premiumCourseId === 0 || purchasedItems.includes(item.premiumCourseId)
    );
    
    // 既存のアイテムをカラムに分配
    filteredItems.forEach((item, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push(item);
    });
    
    // premiumCourseId !== 0 かつ purchasedItems に含まれていないアイテムをランダムに選ぶ
    const premiumUnpurchasedItems = items.filter(item => 
      item.premiumCourseId !== 0 && !purchasedItems.includes(item.premiumCourseId)
    );
    
    // ランダムにシャッフル（フィッシャー・イェーツのシャッフル）
    const shuffledPremiumItems = [...premiumUnpurchasedItems];
    for (let i = shuffledPremiumItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPremiumItems[i], shuffledPremiumItems[j]] = [shuffledPremiumItems[j], shuffledPremiumItems[i]];
    }
    
    // 各カラムに1個ずつ挿入（最大でnumColumns個まで）
    const itemsToInsert = shuffledPremiumItems.slice(0, numColumns);
    itemsToInsert.forEach((item, index) => {
      columns[index].unshift(item); // カラムの先頭に挿入
    });
    
    return columns;
  };

  const handleBookmarkFilterToggle = () => {
    setSelectedFilters([]);
    saveSelectedFilters([]);
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

  const columns = useMemo(() => 
    organizeIntoColumns(filteredStringFigures, columnsCount),
    [filteredStringFigures, columnsCount, purchasedItems]
  );

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
        purchasedItems={purchasedItems}
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
    if (item.directNavigationDestination) {
      if (item.directNavigationDestination === 'Additional') {
        navigation.navigate('Additional');
      }
      if (item.directNavigationDestination === 'Policy') {
        navigation.navigate('Policy');
      }
      if (item.directNavigationDestination === 'Intro') {
        navigation.navigate('IntroVideo', { currentLanguage: currentLanguage });
      }
      return;
    }
    setSelectedItem(item);
  };

  // selectedItemが設定されたときに自動的にBottomSheetを表示
  useEffect(() => {
    if (selectedItem) {
      bottomSheetRef.current?.present();
    }
  }, [selectedItem]);

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.dismiss();
    setSelectedItem(null);
  };

  const handlePlayVideo = (item: StringFigure) => {
    handleCloseBottomSheet();
    navigation.navigate('VideoPlayer', { stringFigure: item, currentLanguage: currentLanguage });
  };

  const handleAdditionalCollectionPress = () => {
    handleCloseBottomSheet();
    navigation.navigate('Additional');
  };

  const toggleBookmark = () => {
    if (!selectedItem) return;
    
    const itemId = selectedItem.id;
    const newBookmarkedIds = bookmarkedIds.includes(itemId)
      ? bookmarkedIds.filter(id => id !== itemId)
      : [...bookmarkedIds, itemId];
    
    saveBookmarkedIds(newBookmarkedIds);
    if (newBookmarkedIds.length === 0 && isBookmarkFilterActive) {
      setIsBookmarkFilterActive(false);
    }
  };

  const handlePrerequisitePress = (prerequisiteId: string) => {
    // 1. BottomSheetを閉じる
    bottomSheetRef.current?.dismiss();
    
    // 2. BottomSheetが完全に閉じるのを待ってから、そのIDの作品をセットしてBottomSheetを表示
    setTimeout(() => {
      const prerequisiteItem = stringFigures.find(figure => figure.id === prerequisiteId);
      if (prerequisiteItem) {
        setSelectedItem(prerequisiteItem);
      }
    }, 600);
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
    showLanguageSelectionDialog(currentLanguage, saveLanguageSetting);
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
      id: 'policy',
      label: currentLanguage === 'ja' ? 'このアプリについて' : 'About this app',
      onPress: () => {
        navigation.navigate('Policy');
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
    <LinearGradient
      colors={['#e0e0e0', '#ffffff', '#EBE6D8']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.5, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
        {/* ヘッダー */}
        <View style={[styles.header, isTablet && styles.headerTablet]}>
          <Text 
            maxFontSizeMultiplier={1.35}
            style={[
              styles.title, 
              isTablet && styles.titleTablet,
              { fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }
            ]}
          >
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
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('IntroError')}
              activeOpacity={0.8}
              style={{
                borderRadius: 8,
                padding: 12,
                borderWidth: 2,
                borderColor: '#cc7000ff',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MicrophoneQuestionIcon width={24} height={24} fillColor="#533000ff" />
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={{ color: '#533000ff', marginLeft: 8, flex: 1 }}
                >
                  {currentLanguage === 'ja'
                    ? '音声認識が有効化されていません。このままでもアプリをご利用いただけますが、有効化することで「声」で操作できるようになり便利です'
                    : 'The speech recognition is not enabled. You can still use the app as is, but enabling it will allow you to control the app with your voice.'}
                </Text>
              </View>
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
              {index === 0 && renderCard(CommercialCollection1)}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 詳細ボトムシート */}
      <DetailBottomSheet
        ref={bottomSheetRef}
        item={selectedItem}
        isBookmarked={selectedItem ? bookmarkedIds.includes(selectedItem.id) : false}
        onClose={handleCloseBottomSheet}
        onPlayVideo={handlePlayVideo}
        onToggleBookmark={toggleBookmark}
        currentLanguage={currentLanguage}
        purchasedItems={purchasedItems}
        onPrerequisitePress={handlePrerequisitePress}
        onAdditionalCollectionPress={handleAdditionalCollectionPress}
      />

      {/* ドロップダウンメニュー */}
      <DropDownMenu
        isVisible={isDropDownVisible}
        onClose={handleCloseDropDown}
        items={dropDownItems}
        buttonPosition={menuButtonPosition}
      />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
    color: '#57534D',
    fontFamily: 'KleeOne-SemiBold',
    fontWeight: '600',
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
    paddingBottom: 60,
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
