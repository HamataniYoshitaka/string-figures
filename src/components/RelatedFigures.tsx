import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { StringFigure } from '../types';
import { stringFigures } from '../data/index';
import StringFigureCard from './StringFigureCard';

interface Props {
  relatedFigures: string[];
  currentLanguage: 'ja' | 'en';
  onPress?: (item: StringFigure) => void;
  bookmarkedIds?: string[];
  onImageLoad?: (itemId: string, event: any) => void;
}

const RelatedFigures: React.FC<Props> = ({ 
  relatedFigures, 
  currentLanguage,
  onPress,
  bookmarkedIds = [],
  onImageLoad,
}) => {
  const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number; height: number } }>({});

  // relatedFiguresのIDからstringFiguresデータを検索
  const relatedItems = relatedFigures
    .map(id => stringFigures.find(figure => figure.id === id))
    .filter((item): item is StringFigure => item !== undefined);

  const handleImageLoad = (itemId: string, event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions(prev => ({
      ...prev,
      [itemId]: { width, height }
    }));
    if (onImageLoad) {
      onImageLoad(itemId, event);
    }
  };

  const handlePress = (item: StringFigure) => {
    if (onPress) {
      onPress(item);
    }
  };

  const renderCard = (item: StringFigure) => {
    const imageInfo = imageDimensions[item.id];
    let calculatedHeight = 200; // デフォルト高さ
    
    if (imageInfo) {
      // カードの幅を取得（画面幅を段組み数で割った値から余白を引く）
      // RelatedFiguresでは2カラムを想定
      const screenDimensions = Dimensions.get('window');
      // iPadかどうかを判定
      const isTablet = Math.max(screenDimensions.width, screenDimensions.height) >= 1024;
      const screenWidth = isTablet ? 420 : screenDimensions.width;
      const totalHorizontalPadding = 40; // 左右のpadding 20px × 2
      const gapBetweenColumns = 15; // カラム間のgap
      const cardWidth = (screenWidth - totalHorizontalPadding - gapBetweenColumns) / 2;
      calculatedHeight = (imageInfo.height / imageInfo.width) * cardWidth;
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
        onPress={handlePress}
        onImageLoad={handleImageLoad}
      />
    );
  };

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // 偶数番目を左カラム、奇数番目を右カラムに分割
  const leftColumnItems = relatedItems.filter((_, index) => index % 2 === 0);
  const rightColumnItems = relatedItems.filter((_, index) => index % 2 === 1);

  return (
    <View style={styles.sectionContainer}>
      <Text 
        maxFontSizeMultiplier={1.35}
        style={[
          styles.sectionHeader,
          { fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }
        ]}
      >
        {getLocalizedText({ ja: '関連するあやとり', en: 'Related String Figures' })}
      </Text>
      <View style={styles.container}>
        <View style={styles.column}>
          {leftColumnItems.map(item => renderCard(item))}
        </View>
        <View style={styles.column}>
          {rightColumnItems.map(item => renderCard(item))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 28,
  },
  sectionHeader: {
    fontSize: 18,
    color: '#57534D',
    marginBottom: 16,
    // paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    // paddingHorizontal: 20,
    gap: 15,
  },
  column: {
    flex: 1,
    gap: 15,
  },
});

export default RelatedFigures;
