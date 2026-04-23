import React, { useEffect, useRef, useState } from 'react';
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [buttonLayouts, setButtonLayouts] = useState<Record<HomePageKey, { x: number; width: number }>>({
    basic: { x: 0, width: 0 },
    easy: { x: 0, width: 0 },
    medium: { x: 0, width: 0 },
    hard: { x: 0, width: 0 },
    two_people: { x: 0, width: 0 },
    bookmark: { x: 0, width: 0 },
  });

  const scrollSelectedButtonToCenter = (pageKey: HomePageKey, animated = true) => {
    const layout = buttonLayouts[pageKey];
    if (!layout || containerWidth <= 0 || contentWidth <= 0) {
      return;
    }

    const buttonCenterX = layout.x + layout.width / 2;
    const maxOffset = Math.max(contentWidth - containerWidth, 0);
    const targetOffset = Math.max(0, Math.min(buttonCenterX - containerWidth / 2, maxOffset));

    scrollViewRef.current?.scrollTo({ x: targetOffset, y: 0, animated });
  };

  useEffect(() => {
    scrollSelectedButtonToCenter(selectedPageKey, true);
  }, [selectedPageKey, buttonLayouts, containerWidth, contentWidth]);

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

  const renderPageIcon = (pageKey: HomePageKey) => {
    const strokeColor = '#292524';
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
        fillColor="transparent"
      />
    );
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
      style={styles.filterScrollView}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      onContentSizeChange={(width) => setContentWidth(width)}
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
          onLayout={(event) => {
            const { x, width } = event.nativeEvent.layout;
            setButtonLayouts(prev => {
              const current = prev[pageKey];
              if (current && current.x === x && current.width === width) {
                return prev;
              }
              return {
                ...prev,
                [pageKey]: { x, width },
              };
            });
          }}
          onPress={() => {
            onSelectPage(pageKey);
            scrollSelectedButtonToCenter(pageKey);
          }}
        >
          {renderPageIcon(pageKey)}
          <Text 
            maxFontSizeMultiplier={1.25}
            style={[
              styles.filterText, 
              { fontFamily: currentLanguage === 'ja' ? 'LineSeed-Bold' : 'KronaOne-Regular' },
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
    backgroundColor: '#FFF9F0',
    borderWidth: 2,
    borderColor: '#292524',
  },
  filterButtonUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#292524',
  },
  filterText: {
    fontSize: 16,
    lineHeight: 16,
  },
  filterTextSelected: {
    color: '#292524',
  },
  filterTextUnselected: {
    color: '#292524',
  },
});

export default FilterButtons;
