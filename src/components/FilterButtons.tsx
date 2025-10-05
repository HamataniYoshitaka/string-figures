import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { EasyIcon, NormalIcon, HardIcon } from './icons';

interface FilterButtonsProps {
  selectedFilters: ('easy' | 'medium' | 'hard')[];
  onToggleFilter: (filter: 'easy' | 'medium' | 'hard') => void;
  currentLanguage: 'ja' | 'en';
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedFilters,
  onToggleFilter,
  currentLanguage,
}) => {
  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // 難易度テキストを取得
  const getDifficultyText = (difficulty: 'easy' | 'medium' | 'hard') => {
    const difficultyTexts = {
      easy: { ja: 'かんたん', en: 'Easy' },
      medium: { ja: 'ふつう', en: 'Normal' },
      hard: { ja: 'むずかしい', en: 'Hard' },
    };
    return getLocalizedText(difficultyTexts[difficulty]);
  };
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
      style={styles.filterScrollView}
    >
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('easy') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('easy')}
      >
        <EasyIcon 
          width={28} 
          height={28} 
          strokeColor={selectedFilters.includes('easy') ? '#F7F6F2' : '#57534D'} 
          strokeWidth={1}
        />
        <Text style={[
          styles.filterText, 
          selectedFilters.includes('easy') ? styles.filterTextSelected : styles.filterTextUnselected
        ]}>
          {getDifficultyText('easy')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('medium') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('medium')}
      >
        <NormalIcon
          width={28}
          height={28}
          strokeColor={selectedFilters.includes('medium') ? '#F7F6F2' : '#57534D'}
          strokeWidth={1}
        />
        <Text style={[
          styles.filterText, 
          selectedFilters.includes('medium') ? styles.filterTextSelected : styles.filterTextUnselected
        ]}>
          {getDifficultyText('medium')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('hard') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('hard')}
      >
        <HardIcon
          width={28}
          height={28}
          strokeColor={selectedFilters.includes('hard') ? '#F7F6F2' : '#57534D'}
          strokeWidth={1}
        />
        <Text style={[
          styles.filterText, 
          selectedFilters.includes('hard') ? styles.filterTextSelected : styles.filterTextUnselected
        ]}>
          {getDifficultyText('hard')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterScrollView: {
    paddingBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 10,
    paddingEnd: 14,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  filterButtonSelected: {
    backgroundColor: '#57534D',
    borderWidth: 1,
    borderColor: '#57534D',
  },
  filterButtonUnselected: {
    backgroundColor: '#F7F6F2',
    borderWidth: 1,
    borderColor: '#57534D',
  },
  filterText: {
    fontSize: 16,
  },
  filterTextSelected: {
    color: '#F7F6F2',
  },
  filterTextUnselected: {
    color: '#57534D',
  },
});

export default FilterButtons;
