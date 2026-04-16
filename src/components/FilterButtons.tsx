import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BookmarkIcon, EasyIcon, NormalIcon, HardIcon, TutorialIcon, TwoPeopleIcon } from './icons';

type HomePageKey = 'basic' | 'easy' | 'medium' | 'hard' | 'two_people' | 'bookmark';

interface FilterButtonsProps {
  pages: HomePageKey[];
  selectedPageKey: HomePageKey;
  onSelectPage: (page: HomePageKey) => void;
  currentLanguage: 'ja' | 'en';
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  pages,
  selectedPageKey,
  onSelectPage,
  currentLanguage,
}) => {
  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  const getPageText = (pageKey: HomePageKey) => {
    const pageTexts: Record<HomePageKey, { ja: string; en: string }> = {
      basic: { ja: 'きほん', en: 'Basic' },
      easy: { ja: 'かんたん', en: 'Easy' },
      medium: { ja: 'ふつう', en: 'Normal' },
      hard: { ja: 'むずかしい', en: 'Hard' },
      two_people: { ja: 'ふたり', en: '2 People' },
      bookmark: { ja: 'ブックマーク', en: 'Bookmark' },
    };
    return getLocalizedText(pageTexts[pageKey]);
  };

  const renderPageIcon = (pageKey: HomePageKey, selected: boolean) => {
    const strokeColor = selected ? '#F7F5F2' : '#57534D';
    if (pageKey === 'basic') {
      return <TutorialIcon width={28} height={28} strokeColor={strokeColor} strokeWidth={1} />;
    }
    if (pageKey === 'easy') {
      return <EasyIcon width={28} height={28} strokeColor={strokeColor} strokeWidth={1} />;
    }
    if (pageKey === 'medium') {
      return <NormalIcon width={28} height={28} strokeColor={strokeColor} strokeWidth={1} />;
    }
    if (pageKey === 'hard') {
      return <HardIcon width={28} height={28} strokeColor={strokeColor} strokeWidth={1} />;
    }
    if (pageKey === 'two_people') {
      return <TwoPeopleIcon width={24} height={24} strokeColor={strokeColor} strokeWidth={1} />;
    }
    return (
      <BookmarkIcon
        width={24}
        height={24}
        strokeColor={strokeColor}
        fillColor={selected ? '#F7F5F2' : 'transparent'}
      />
    );
  };

  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
      style={styles.filterScrollView}
    >
      {pages.map(pageKey => {
        const selected = selectedPageKey === pageKey;

        return (
        <TouchableOpacity 
          key={pageKey}
          style={[
            styles.filterButton, 
            selected ? styles.filterButtonSelected : styles.filterButtonUnselected
          ]}
          onPress={() => onSelectPage(pageKey)}
        >
          {renderPageIcon(pageKey, selected)}
          <Text 
            maxFontSizeMultiplier={1.25}
            style={[
              styles.filterText, 
              selected ? styles.filterTextSelected : styles.filterTextUnselected
            ]}
          >
            {getPageText(pageKey)}
          </Text>
        </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterScrollView: {
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 8,
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
    backgroundColor: '#ecececbb',
    borderWidth: 1,
    borderColor: '#57534D',
  },
  filterText: {
    fontSize: 16,
    lineHeight: 16,
  },
  filterTextSelected: {
    color: '#fafafa',
  },
  filterTextUnselected: {
    color: '#57534D',
  },
});

export default FilterButtons;
