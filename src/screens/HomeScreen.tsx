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
import IconButton from '../components/IconButton';
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

  const { leftColumn, rightColumn } = organizeIntoColumns(dummyStringFigures);

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
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.cardFooter}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {item.difficulty === 'easy' ? 'かんたん' :
                 item.difficulty === 'medium' ? 'ふつう' : 'むずかしい'}
              </Text>
            </View>
            <View style={[
              styles.difficultyIcon,
              { backgroundColor: getDifficultyColor(item.difficulty) }
            ]}>
              <Text style={styles.difficultyIconText}>
                {item.difficulty === 'easy' ? '易' :
                 item.difficulty === 'medium' ? '中' : '難'}
              </Text>
            </View>
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'hard': return '#FF9800';
      default: return '#9E9E9E';
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
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.filterText}>かんたん</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FFC107' }]}>
            <Text style={styles.filterText}>ふつう</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: '#FF9800' }]}>
            <Text style={styles.filterText}>むずかしい</Text>
          </TouchableOpacity>
        </View>

        {/* アイコンボタン例 */}
        <View style={styles.iconButtonContainer}>
          <IconButton 
            title="お気に入り" 
            onPress={() => console.log('お気に入りボタンが押されました')}
          />
        </View>

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
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#5D4037',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  iconButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyIconText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
