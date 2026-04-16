import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import Animated, { interpolateColor, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

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
import Purchases from 'react-native-purchases';
import * as StoreReview from 'expo-store-review';
import * as Notifications from 'expo-notifications';
import { getClearPoints, getHasReviewed, shouldShowReviewDialog, saveHasReviewed, shouldShowPushPermissionDialog } from '../utils/clearPoints';
import { getHasRequestedPushPermission, requestAndRegisterPushNotification, registerPushTokenIfGranted } from '../utils/pushNotifications';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

type HomePageKey = 'basic' | 'easy' | 'medium' | 'hard' | 'two_people' | 'bookmark';
const HOME_PAGE_KEYS: HomePageKey[] = ['basic', 'easy', 'medium', 'hard', 'two_people', 'bookmark'];
const DEFAULT_HOME_PAGE: HomePageKey = 'basic';

/** HOME_PAGE_KEYS と同じ順。スワイプ中の背景色補間に使用 */
const HOME_PAGE_BACKGROUND_COLORS = [
  '#B5CFF0', // basic
  '#9BB262', // easy
  '#FDBBDF', // medium (normal)
  '#FADA5E', // hard
  '#7EB8D8', // two_people（上記以外のトーン）
  '#D9B8E8', // bookmark
] as const;

const PAGE_SCROLL_INPUT_RANGE = HOME_PAGE_KEYS.map((_, i) => i);

/** Figma 準拠のアーチ装飾（viewBox 428×345） */
const ARCH_VIEWBOX = { w: 428, h: 345 };
const ARCH_PATH_D =
  'M0 0H428V344.5C356.986 221.5 68.416 226 0 344.5V0Z';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  const pagerRef = useRef<PagerView>(null);
  const [selectedItem, setSelectedItem] = useState<StringFigure | null>(null);
  const { isTablet } = useDeviceInfo();
  const insets = useSafeAreaInsets();

  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  
  const [selectedPageKey, setSelectedPageKey] = useState<HomePageKey>(DEFAULT_HOME_PAGE);

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

  // StringFigureCardのリフレッシュ用キー
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());

  // 画面幅の状態
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pageScrollProgress = useSharedValue(HOME_PAGE_KEYS.indexOf(DEFAULT_HOME_PAGE));

  const archAnimatedProps = useAnimatedProps(() => ({
    fill: interpolateColor(
      pageScrollProgress.value,
      PAGE_SCROLL_INPUT_RANGE,
      [...HOME_PAGE_BACKGROUND_COLORS]
    ),
  }));

  const archDisplayHeight = screenWidth * (ARCH_VIEWBOX.h / ARCH_VIEWBOX.w);

  // レビューダイアログの表示チェック関数
  const checkAndShowReview = React.useCallback(async () => {
    try {
      const points = await getClearPoints();
      console.log('クリアポイント:', points);
      const hasReviewed = await getHasReviewed();
      console.log('レビュー済みフラグ:', hasReviewed);
      
      // レビュー済みの場合は表示しない
      if (hasReviewed) {
        return;
      }
      
      // ポイントが15n+0〜15n+2の範囲（n >= 1）にあるかチェック
      if (shouldShowReviewDialog(points)) {
        // レビューダイアログを表示
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
          // 表示を試みた後、レビュー済みフラグを保存
          await saveHasReviewed(true);
        }
      }
    } catch (error) {
      console.error('レビューダイアログの表示チェック中にエラーが発生しました:', error);
    }
  }, []);

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
      await Promise.all([loadBookmarkedIds(), loadSelectedHomePage(), loadPurchasedItems()]);
      // スマホの場合、HomeScreen表示時は常に縦向きに設定
      if (!isTablet) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
      
      // バッジをクリア
      try {
        await Notifications.setBadgeCountAsync(0);
      } catch (error) {
        console.warn('バッジのクリアに失敗しました:', error);
      }

      // アプリ起動時に毎回トークンをサーバーにPOST（既に許可されている場合）
      setTimeout(async () => {
        try {
          const savedLanguage = await AsyncStorage.getItem('app_language');
          const language = (savedLanguage === 'ja' || savedLanguage === 'en')
            ? savedLanguage
            : (Localization.getLocales()[0]?.languageCode === 'ja' ? 'ja' : 'en');
          await registerPushTokenIfGranted(language as 'ja' | 'en');
        } catch (error) {
          console.error('プッシュ通知トークンの登録中にエラーが発生しました:', error);
        }
      }, 1500);
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

    // 初回マウント時にもレビューダイアログをチェック
    setTimeout(() => {
      checkAndShowReview();
    }, 1000);
  }, [checkAndShowReview]);



  // 画面にフォーカスが戻ってきた時にブックマーク情報を再読み込み
  useFocusEffect(
    React.useCallback(() => {
      loadBookmarkedIds();
      loadSelectedHomePage();
      loadPurchasedItems();
      // StringFigureCardのリフレッシュ用キーを更新
      setRefreshKey(Date.now());
      // レビューダイアログのチェックも実行
      setTimeout(() => {
        checkAndShowReview();
      }, 500);
      // プッシュ通知許可のチェックも実行
      setTimeout(async () => {
        try {
          const points = await getClearPoints();
          const hasRequested = await getHasRequestedPushPermission();
          
          // 条件を満たし、かつ未リクエストの場合のみ許可ダイアログを表示
          if (shouldShowPushPermissionDialog(points) && !hasRequested) {
            await requestAndRegisterPushNotification(currentLanguage);
          }
        } catch (error) {
          console.error('プッシュ通知許可のチェック中にエラーが発生しました:', error);
        }
      }, 500);
    }, [checkAndShowReview, currentLanguage])
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

  const isHomePageKey = (value: unknown): value is HomePageKey =>
    value === 'basic' ||
    value === 'easy' ||
    value === 'medium' ||
    value === 'hard' ||
    value === 'two_people' ||
    value === 'bookmark';

  const saveSelectedHomePage = async (pageKey: HomePageKey) => {
    try {
      await AsyncStorage.setItem('selectedHomePage', pageKey);
    } catch (error) {
      console.error('ホームページ選択状態の保存に失敗しました:', error);
    }
  };

  const loadSelectedHomePage = async () => {
    try {
      const savedPage = await AsyncStorage.getItem('selectedHomePage');
      if (savedPage && isHomePageKey(savedPage)) {
        setSelectedPageKey(savedPage);
        return;
      }

      const legacyFilters = await AsyncStorage.getItem('selectedFilters');
      if (!legacyFilters) {
        setSelectedPageKey(DEFAULT_HOME_PAGE);
        saveSelectedHomePage(DEFAULT_HOME_PAGE);
        return;
      }

      const parsedFilters = JSON.parse(legacyFilters);
      if (!Array.isArray(parsedFilters)) {
        setSelectedPageKey(DEFAULT_HOME_PAGE);
        saveSelectedHomePage(DEFAULT_HOME_PAGE);
        return;
      }

      const mappedPage = parsedFilters.find((filter: unknown): filter is HomePageKey => isHomePageKey(filter));
      const nextPage = mappedPage ?? DEFAULT_HOME_PAGE;
      setSelectedPageKey(nextPage);
      saveSelectedHomePage(nextPage);
    } catch (error) {
      console.error('ホームページ選択状態の読み込みに失敗しました:', error);
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
      columns[index].push(item); // カラムの先頭に挿入
    });
    
    return columns;
  };

  const selectHomePage = (pageKey: HomePageKey) => {
    const pageIndex = HOME_PAGE_KEYS.indexOf(pageKey);
    setSelectedPageKey(pageKey);
    saveSelectedHomePage(pageKey);
    if (pageIndex >= 0) {
      setCurrentPageIndex(pageIndex);
      pagerRef.current?.setPage(pageIndex);
    }
  };

  const getFiguresByPage = (pageKey: HomePageKey): StringFigure[] => {
    if (pageKey === 'bookmark') {
      return stringFigures.filter(item => bookmarkedIds.includes(item.id));
    }

    return stringFigures.filter(item => item.difficulty === pageKey);
  };

  const pageColumnsMap = useMemo(() => {
    return HOME_PAGE_KEYS.reduce<Record<HomePageKey, StringFigure[][]>>((acc, pageKey) => {
      const pageFigures = getFiguresByPage(pageKey);
      acc[pageKey] = organizeIntoColumns(pageFigures, columnsCount);
      return acc;
    }, {
      basic: [],
      easy: [],
      medium: [],
      hard: [],
      two_people: [],
      bookmark: [],
    });
  }, [bookmarkedIds, columnsCount, purchasedItems]);

  useEffect(() => {
    const targetIndex = HOME_PAGE_KEYS.indexOf(selectedPageKey);
    if (targetIndex >= 0 && targetIndex !== currentPageIndex) {
      setCurrentPageIndex(targetIndex);
      pagerRef.current?.setPageWithoutAnimation(targetIndex);
      pageScrollProgress.value = targetIndex;
    }
  }, [currentPageIndex, selectedPageKey]);

  const handlePageSelected = (position: number) => {
    pageScrollProgress.value = position;
    const pageKey = HOME_PAGE_KEYS[position];
    if (!pageKey || pageKey === selectedPageKey) {
      setCurrentPageIndex(position);
      return;
    }
    setCurrentPageIndex(position);
    setSelectedPageKey(pageKey);
    saveSelectedHomePage(pageKey);
  };

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
        refreshKey={refreshKey}
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
    if (item.nonverbalFormat === true) {
      navigation.navigate('NonverbalVideoPlayer', {
        stringFigure: item,
        currentLanguage: currentLanguage,
      });
    } else {
      navigation.navigate('VideoPlayer', { stringFigure: item, currentLanguage: currentLanguage });
    }
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

  // 購入情報を復元する関数
  const handleRestorePurchase = async () => {
    try {
      console.log('購入情報を復元しています...');
      
      // RevenueCatから購入情報を復元
      const customerInfo = await Purchases.restorePurchases();
      console.log('Customer info:', JSON.stringify(customerInfo, null, 2));
      
      // 購入済みの製品IDを取得
      const purchasedProductIds = customerInfo.allPurchasedProductIdentifiers;
      console.log('購入済み製品ID:', purchasedProductIds);
      
      if (purchasedProductIds.length === 0) {
        // 購入情報が見つからない場合
        const title = currentLanguage === 'ja' ? '購入情報の復元' : 'Restore Purchase';
        const message = currentLanguage === 'ja'
          ? '復元できる購入情報が見つかりませんでした。'
          : 'No purchase information found to restore.';
        Alert.alert(title, message, [{ text: 'OK' }]);
        return;
      }
      
      // オファリングからパッケージ情報を取得して、購入済み製品IDとマッチング
      const offerings = await Purchases.getOfferings();
      const restoredCollectionIds: number[] = [];
      
      if (offerings.current && offerings.current.availablePackages) {
        offerings.current.availablePackages.forEach(pkg => {
          // パッケージの製品IDが購入済みリストに含まれているかチェック
          if (purchasedProductIds.includes(pkg.product.identifier)) {
            // パッケージidentifierからcollectionIdを抽出（例: "collection1" -> 1）
            const match = pkg.identifier.match(/collection(\d+)/);
            if (match) {
              const collectionId = parseInt(match[1], 10);
              restoredCollectionIds.push(collectionId);
              console.log(`復元: コレクション${collectionId}`);
            }
          }
        });
      }
      
      if (restoredCollectionIds.length === 0) {
        // マッチするコレクションが見つからない場合
        const title = currentLanguage === 'ja' ? '購入情報の復元' : 'Restore Purchase';
        const message = currentLanguage === 'ja'
          ? '復元できるコレクションが見つかりませんでした。'
          : 'No collections found to restore.';
        Alert.alert(title, message, [{ text: 'OK' }]);
        return;
      }
      
      // 既存のpurchasedItemsを読み込む
      const savedPurchasedItems = await AsyncStorage.getItem('purchasedItems');
      let updatedPurchasedItems: number[] = [];
      
      if (savedPurchasedItems) {
        const parsedItems = JSON.parse(savedPurchasedItems);
        if (Array.isArray(parsedItems)) {
          updatedPurchasedItems = parsedItems;
        }
      }
      
      // 復元されたコレクションIDを追加（重複を避ける）
      const newCollectionIds = restoredCollectionIds.filter(id => !updatedPurchasedItems.includes(id));
      if (newCollectionIds.length > 0) {
        updatedPurchasedItems = [...updatedPurchasedItems, ...newCollectionIds];
        await AsyncStorage.setItem('purchasedItems', JSON.stringify(updatedPurchasedItems));
        setPurchasedItems([...updatedPurchasedItems]);
        console.log('購入情報を復元しました:', newCollectionIds);
      }
      
      // 成功メッセージを表示
      const title = currentLanguage === 'ja' ? '購入情報の復元' : 'Restore Purchase';
      const message = currentLanguage === 'ja'
        ? newCollectionIds.length > 0
          ? `コレクション${newCollectionIds.join('、')}を復元しました。`
          : '全ての購入情報は既に復元済みです。'
        : newCollectionIds.length > 0
          ? `Restored collections: ${newCollectionIds.join(', ')}.`
          : 'All purchase information has already been restored.';
      Alert.alert(title, message, [{ text: 'OK' }]);
      
    } catch (error: any) {
      console.error('購入情報の復元中にエラーが発生しました:', error);
      const title = currentLanguage === 'ja' ? 'エラー' : 'Error';
      const message = currentLanguage === 'ja'
        ? '購入情報の復元中にエラーが発生しました。もう一度お試しください。'
        : 'An error occurred while restoring purchases. Please try again.';
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
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
        handleCloseDropDown();
        // ドロップダウンが完全に閉じるまで少し待ってから復元処理を実行
        setTimeout(() => {
          handleRestorePurchase();
        }, 300);
      },
    },
  ];

  const headerPaddingTop =
    insets.top + (isTablet ? 32 : Platform.OS === 'android' ? 12 : 8);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {/* SafeAreaView の外：ステータスバー直下までアーチを表示。タッチは通す */}
      <Svg
        width={screenWidth}
        height={archDisplayHeight}
        viewBox={`0 0 ${ARCH_VIEWBOX.w} ${ARCH_VIEWBOX.h}`}
        preserveAspectRatio="xMidYMin meet"
        pointerEvents="none"
        style={[styles.archSvg, { width: screenWidth }]}
      >
        <AnimatedPath d={ARCH_PATH_D} animatedProps={archAnimatedProps} />
      </Svg>

      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.contentContainer}>
          <View style={styles.topSectionForeground}>
          {/* ヘッダー */}
          <View
            style={[
              styles.header,
              isTablet && styles.headerTablet,
              { paddingTop: headerPaddingTop },
            ]}
          >
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
          <View style={styles.stickyFilterContainer}>
            <FilterButtons 
              pages={HOME_PAGE_KEYS}
              selectedPageKey={selectedPageKey}
              onSelectPage={selectHomePage}
              currentLanguage={currentLanguage}
            />
          </View>
        </View>

        {/* あやとり一覧（アーチより手前に描画） */}
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={HOME_PAGE_KEYS.indexOf(selectedPageKey)}
          onPageScroll={(event) => {
            const { position, offset } = event.nativeEvent;
            const max = HOME_PAGE_KEYS.length - 1;
            pageScrollProgress.value = Math.min(max, Math.max(0, position + offset));
          }}
          onPageSelected={(event) => handlePageSelected(event.nativeEvent.position)}
        >
          {HOME_PAGE_KEYS.map((pageKey) => {
            const columns = pageColumnsMap[pageKey];
            const isBookmarkPage = pageKey === 'bookmark';
            const hasCards = columns.some(column => column.length > 0);

            return (
              <View key={pageKey} style={styles.pageContainer}>
                <ScrollView
                  style={styles.pageScrollView}
                  contentContainerStyle={styles.pageScrollContent}
                >
                  <View style={styles.gridContainer}>
                    {columns.map((column, index) => (
                      <View key={`${pageKey}-${index}`} style={styles.column}>
                        {column.map(renderCard)}
                        {pageKey === 'basic' && index === 0 && renderCard(CommercialCollection1)}
                      </View>
                    ))}
                  </View>
                  {isBookmarkPage && !hasCards && (
                    <Text
                      maxFontSizeMultiplier={1.25}
                      style={styles.emptyBookmarkText}
                    >
                      {currentLanguage === 'ja'
                        ? 'ブックマークした作品はまだありません。'
                        : 'No bookmarked figures yet.'}
                    </Text>
                  )}
                </ScrollView>
              </View>
            );
          })}
        </PagerView>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 0 : 8,
  },
  title: {
    fontSize: 28,
    color: '#292524',
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
  contentContainer: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  archSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    elevation: 0,
  },
  topSectionForeground: {
    position: 'relative',
    zIndex: 1,
  },
  pagerView: {
    flex: 1,
    zIndex: 2,
    elevation: 2,
    backgroundColor: 'transparent',
  },
  pageContainer: {
    flex: 1,
  },
  pageScrollView: {
    flex: 1,
  },
  pageScrollContent: {
    paddingBottom: 60,
  },
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
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
  stickyFilterContainer: {
    zIndex: 10,
  },
  emptyBookmarkText: {
    color: '#292524',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    fontSize: 16,
    lineHeight: 24,
  },
});

export default HomeScreen;
