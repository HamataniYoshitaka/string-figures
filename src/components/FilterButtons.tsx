import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BookmarkIcon, EasyIcon, NormalIcon, HardIcon, TutorialIcon, TwoPeopleIcon } from './icons';

interface FilterButtonsProps {
  selectedFilters: ('basic' | 'easy' | 'medium' | 'hard' | 'two_people')[];
  onToggleFilter: (filter: 'basic' | 'easy' | 'medium' | 'hard' | 'two_people') => void;
  currentLanguage: 'ja' | 'en';
  isBookmarkFilterActive: boolean;
  onToggleBookmarkFilter: () => void;
  showBookmarkButton: boolean;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedFilters,
  onToggleFilter,
  currentLanguage,
  isBookmarkFilterActive,
  onToggleBookmarkFilter,
  showBookmarkButton,
}) => {
  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // 難易度テキストを取得
  const getDifficultyText = (difficulty: 'basic' | 'easy' | 'medium' | 'hard' | 'two_people') => {
    const difficultyTexts = {
      basic: { ja: 'きほん', en: 'Basic' },
      easy: { ja: 'かんたん', en: 'Easy' },
      medium: { ja: 'ふつう', en: 'Normal' },
      hard: { ja: 'むずかしい', en: 'Hard' },
      two_people: { ja: 'ふたり', en: '2 People' },
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
      {showBookmarkButton && (
        <TouchableOpacity 
          style={[
            styles.bookmarkButton,
            isBookmarkFilterActive ? styles.bookmarkButtonSelected : styles.bookmarkButtonUnselected,
          ]}
          onPress={onToggleBookmarkFilter}
        >
          <BookmarkIcon 
            width={24} 
            height={24} 
            strokeColor={isBookmarkFilterActive ? '#F7F5F2' : '#57534D'} 
            fillColor={isBookmarkFilterActive ? '#57534D' : 'transparent'}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('basic') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('basic')}
      >
        <TutorialIcon 
          width={28} 
          height={28} 
          strokeColor={selectedFilters.includes('basic') ? '#F7F5F2' : '#57534D'} 
          strokeWidth={1}
        />
        <Text 
          maxFontSizeMultiplier={1.25}
          style={[
            styles.filterText, 
            selectedFilters.includes('basic') ? styles.filterTextSelected : styles.filterTextUnselected
          ]}
        >
          {getDifficultyText('basic')}
        </Text>
      </TouchableOpacity>
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
          strokeColor={selectedFilters.includes('easy') ? '#F7F5F2' : '#57534D'} 
          strokeWidth={1}
        />
        <Text 
          maxFontSizeMultiplier={1.25}
          style={[
            styles.filterText, 
            selectedFilters.includes('easy') ? styles.filterTextSelected : styles.filterTextUnselected
          ]}
        >
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
          strokeColor={selectedFilters.includes('medium') ? '#F7F5F2' : '#57534D'}
          strokeWidth={1}
        />
        <Text 
          maxFontSizeMultiplier={1.25}
          style={[
            styles.filterText, 
            selectedFilters.includes('medium') ? styles.filterTextSelected : styles.filterTextUnselected
          ]}
        >
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
          strokeColor={selectedFilters.includes('hard') ? '#F7F5F2' : '#57534D'}
          strokeWidth={1}
        />
        <Text 
          maxFontSizeMultiplier={1.25}
          style={[
            styles.filterText, 
            selectedFilters.includes('hard') ? styles.filterTextSelected : styles.filterTextUnselected
          ]}
        >
          {getDifficultyText('hard')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('two_people') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('two_people')}
      >
        <TwoPeopleIcon 
          width={24}
          height={24}
          strokeColor={selectedFilters.includes('two_people') ? '#F7F5F2' : '#57534D'}
          strokeWidth={1}
        />
        <Text 
          maxFontSizeMultiplier={1.25}
          style={[
            styles.filterText, 
            selectedFilters.includes('two_people') ? styles.filterTextSelected : styles.filterTextUnselected
          ]}
        >
          {getDifficultyText('two_people')}
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#57534D',
  },
  filterText: {
    fontSize: 16,
  },
  filterTextSelected: {
    color: '#fafafa',
  },
  filterTextUnselected: {
    color: '#57534D',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButtonSelected: {
    backgroundColor: '#57534D',
    borderWidth: 1,
    borderColor: '#57534D',
  },
  bookmarkButtonUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#57534D',
  },
});

export default FilterButtons;
