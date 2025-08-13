import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { StringFigure } from '../types';
import { EasyIcon, NormalIcon, HardIcon } from './icons';

interface Props {
  item: StringFigure;
  calculatedHeight: number;
  currentLanguage: 'ja' | 'en';
  onPress: (item: StringFigure) => void;
  onImageLoad: (itemId: string, event: any) => void;
}

const StringFigureCard: React.FC<Props> = ({
  item,
  calculatedHeight,
  currentLanguage,
  onPress,
  onImageLoad,
}) => {
  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
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
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() => onPress(item)}
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
            onLoad={(event) => onImageLoad(item.id, event)}
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

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: 'white',
    padding: 0,
    marginBottom: 15,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
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
    paddingVertical: 6,
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

export default StringFigureCard;
