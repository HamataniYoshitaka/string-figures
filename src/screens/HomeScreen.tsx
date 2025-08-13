import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, StringFigure, BottomSheetState } from '../types';
import DetailBottomSheet from '../components/DetailBottomSheet';
import FilterButtons from '../components/FilterButtons';
import StringFigureCard from '../components/StringFigureCard';
import DropDownMenu from '../components/DropDownMenu';
import { dummyStringFigures } from '../data/dummyData';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [bottomSheet, setBottomSheet] = useState<BottomSheetState>({
    isVisible: false,
    selectedItem: null,
  });

  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  
  const [selectedFilters, setSelectedFilters] = useState<('easy' | 'medium' | 'hard')[]>([]);

  // ドロップダウンメニューの状態
  const [isDropDownVisible, setIsDropDownVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<View>(null);

  // 現在の言語設定の状態
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');

  // アプリ起動時に保存された言語設定を読み込む
  useEffect(() => {
    loadLanguageSetting();
  }, []);

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

  const saveLanguageSetting = async (language: 'ja' | 'en') => {
    try {
      await AsyncStorage.setItem('app_language', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('言語設定の保存に失敗しました:', error);
    }
  };

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  const toggleFilter = (filter: 'easy' | 'medium' | 'hard') => {
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

  // マソンリーレイアウト用に2つのカラムに分ける
  const organizeIntoColumns = (items: StringFigure[]) => {
    const leftColumn: StringFigure[] = [];
    const rightColumn: StringFigure[] = [];
    
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        leftColumn.push(item);
      } else {
        rightColumn.push(item);
      }
    });
    
    return { leftColumn, rightColumn };
  };

  // フィルターされたデータを取得
  const filteredStringFigures = selectedFilters.length === 0 
    ? dummyStringFigures // 全て非選択の場合は全データを表示
    : dummyStringFigures.filter(item => 
        selectedFilters.includes(item.difficulty as 'easy' | 'medium' | 'hard')
      );

  const { leftColumn, rightColumn } = organizeIntoColumns(filteredStringFigures);

  const renderCard = (item: StringFigure) => {
    const imageInfo = imageDimensions[item.id];
    let calculatedHeight = 200; // デフォルト高さ
    
    if (imageInfo) {
      // カードの幅を取得（画面幅の約45%と仮定）
      const cardWidth = 160; // 概算値
      calculatedHeight = (imageInfo.height / imageInfo.width) * cardWidth;
      // 最大高さを制限
      calculatedHeight = Math.min(calculatedHeight, 300);
    }
    
    return (
      <StringFigureCard
        key={item.id}
        item={item}
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

  // メニューボタンの処理
  const handleMenuPress = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
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
      label: '言語',
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
      label: '動画の字幕',
      value: 'あり',
      onPress: () => {
        // TODO: 字幕設定の切り替え
        console.log('字幕設定');
      },
    },
    {
      id: 'restore',
      label: '購入情報を復元',
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
        <View style={styles.header}>
          <Text style={styles.title}>
            {currentLanguage === 'ja' ? 'あやとり' : 'String Figures'}
          </Text>
          <TouchableOpacity 
            ref={menuButtonRef}
            style={styles.menuButton}
            onPress={handleMenuPress}
          >
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* フィルターボタン */}
        <FilterButtons 
          selectedFilters={selectedFilters}
          onToggleFilter={toggleFilter}
          currentLanguage={currentLanguage}
        />

        {/* あやとり一覧 */}
        <View style={styles.gridContainer}>
          <View style={styles.column}>
            {leftColumn.map(renderCard)}
          </View>
          <View style={styles.column}>
            {rightColumn.map(renderCard)}
          </View>
        </View>
      </ScrollView>

      {/* 詳細ボトムシート */}
      <DetailBottomSheet
        isVisible={bottomSheet.isVisible}
        item={bottomSheet.selectedItem}
        onClose={handleCloseBottomSheet}
        onPlayVideo={handlePlayVideo}
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
    fontFamily: 'KleeOne-SemiBold',
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
});

export default HomeScreen;
