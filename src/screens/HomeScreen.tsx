import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, StringFigure, BottomSheetState } from '../types';
import DetailBottomSheet from '../components/DetailBottomSheet';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

// ダミーデータ
const dummyStringFigures: StringFigure[] = [
  {
    id: '1',
    name: 'アムワンキョ',
    difficulty: 'medium',
    thumbnail: '',
    image: '',
    videoUrl: '',
    description: 'アムワンキョの説明文です。',
    isBookmarked: false,
  },
  {
    id: '2', 
    name: 'ふたつの星',
    difficulty: 'easy',
    thumbnail: '',
    image: '',
    videoUrl: '',
    description: 'ふたつの星の説明文です。',
    isBookmarked: true,
  },
  {
    id: '3',
    name: 'シベリアの家',
    difficulty: 'hard',
    thumbnail: '',
    image: '',
    videoUrl: '',
    description: 'シベリアの家の説明文です。',
    isBookmarked: false,
  },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [bottomSheet, setBottomSheet] = useState<BottomSheetState>({
    isVisible: false,
    selectedItem: null,
  });



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

      {/* あやとり一覧 */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.gridContainer}>
          {dummyStringFigures.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardImageText}>画像</Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) }
              ]}>
                <Text style={styles.difficultyText}>
                  {item.difficulty === 'easy' ? 'かんたん' :
                   item.difficulty === 'medium' ? 'ふつう' : 'むずかしい'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
    backgroundColor: '#FFF8E7',
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
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
  },
  card: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImagePlaceholder: {
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardImageText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;
