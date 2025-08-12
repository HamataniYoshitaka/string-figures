import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, StringFigure, BottomSheetState } from '../types';
import DetailBottomSheet from '../components/DetailBottomSheet';
import FilterButtons from '../components/FilterButtons';
import { dummyStringFigures } from '../data/dummyData';
import { EasyIcon, NormalIcon, HardIcon } from '../components/icons';

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

  // 現在の言語を取得（後でAppSettingsから取得するように変更予定）
  const currentLanguage: 'ja' | 'en' = 'ja'; // デフォルトは日本語

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
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.cardImageContainer}>
          {item.thumbnail ? (
            <Image 
              source={typeof item.thumbnail === 'string' ? { uri: item.thumbnail } : item.thumbnail}
              style={[
                styles.cardImage,
                { height: calculatedHeight }
              ]}
              resizeMode="cover"
              onLoad={(event) => handleImageLoad(item.id, event)}
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImageText}>画像</Text>
            </View>
          )}
          {/* ブックマークアイコン */}
          {item.isBookmarked && (
            <View style={styles.bookmarkContainer}>
              <Text style={styles.bookmarkIcon}>🔖</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>{getLocalizedText(item.name)}</Text>
            {getDifficultyIcon(item.difficulty, 24)}
          </View>
        </View>
      </TouchableOpacity>
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

  const getDifficultyIcon = (difficulty: string, size: number = 16) => {
    const iconProps = {
      width: size,
      height: size,
      strokeColor: '#57534D',
      strokeWidth: 1.5,
    };

    switch (difficulty) {
      case 'easy':
        return <EasyIcon {...iconProps} />;
      case 'medium':
        return <NormalIcon {...iconProps} />;
      case 'hard':
        return <HardIcon {...iconProps} />;
      default:
        return <EasyIcon {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>あやとり</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* フィルターボタン */}
        <FilterButtons 
          selectedFilters={selectedFilters}
          onToggleFilter={toggleFilter}
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
  card: {
    width: '100%',
    backgroundColor: 'white',
    padding: 0,
    elevation: 5,
    marginBottom: 15,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderRadius: 12,

  },
  cardImage: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  cardImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  cardImageText: {
    color: '#9E9E9E',
    fontSize: 16,
    fontFamily: 'KleeOne-Regular',
  },
  bookmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  cardContent: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    fontFamily: 'KleeOne-Regular',
  },
  difficultyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
