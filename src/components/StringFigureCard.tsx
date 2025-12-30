import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StringFigure } from '../types';
import { EasyIcon, NormalIcon, HardIcon, BookmarkIcon, TutorialIcon, TwoPeopleIcon, LockIcon, CheckSmallIcon } from './icons';

interface Props {
  item: StringFigure;
  bookmarked: boolean;
  calculatedHeight: number;
  currentLanguage: 'ja' | 'en';
  disabled?: boolean;
  hideTitle?: boolean;
  purchasedItems?: number[];
  onPress: (item: StringFigure) => void;
  onImageLoad: (itemId: string, event: any) => void;
}

const StringFigureCard: React.FC<Props> = ({
  item,
  bookmarked,
  calculatedHeight,
  currentLanguage,
  disabled = false,
  hideTitle = false,
  purchasedItems = [],
  onPress,
  onImageLoad,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isCompleted, setIsCompleted] = useState(false);

  // completeDatesからitem.idと一致するものがあるかチェック
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const savedCompleteDates = await AsyncStorage.getItem('completeDates');
        if (savedCompleteDates) {
          const completeDates: Array<{ id: string; dates: string[] }> = JSON.parse(savedCompleteDates);
          const entry = completeDates.find(entry => entry.id === item.id);
          setIsCompleted(!!entry && entry.dates && entry.dates.length > 0);
        } else {
          setIsCompleted(false);
        }
      } catch (error) {
        console.error('完了日付の読み込みに失敗しました:', error);
        setIsCompleted(false);
      }
    };

    checkCompletion();
  }, [item.id]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

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
      case 'basic':
        return <TutorialIcon {...iconProps} />;
      case 'easy':
        return <EasyIcon {...iconProps} />;
      case 'medium':
        return <NormalIcon {...iconProps} />;
      case 'hard':
        return <HardIcon {...iconProps} />;
      case 'two_people':
        return <TwoPeopleIcon {...iconProps} />;
      default:
        return <EasyIcon {...iconProps} />;
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.cardImageContainer,
            disabled && styles.cardImageContainerDisabled,
          ]}
        >
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
          {/* ブックマークアイコン - ブックマーク済みの場合のみ表示 */}
          {bookmarked && (
            <View style={styles.bookmarkContainer}>
              <BookmarkIcon
                width={24}
                height={24}
                strokeColor="#FB2C36"
                fillColor="#FB2C36"
                strokeWidth={1.5}
              />
            </View>
          )}
        </View>
        {!hideTitle && (
          <View style={styles.cardContent}>
            <View style={styles.titleContainer}>
              {item.premiumCourseId !== 0 && !purchasedItems.includes(item.premiumCourseId) && (
                <View style={[
                  styles.lockIconContainer,
                  {
                    backgroundColor: item.premiumCourseId === 1 
                      ? '#2B7FFF' 
                      : item.premiumCourseId === 2 
                        ? '#E17100' 
                        : item.premiumCourseId === 3
                          ? '#0d9488'
                        : undefined
                  }
                ]}>
                  <LockIcon 
                    width={16} 
                    height={16} 
                    fillColor="#FFFFFF"
                    strokeColor="#FFFFFF"
                    strokeWidth={0}
                  />
                </View>
              )}
              <Text 
                maxFontSizeMultiplier={1.35}
                style={styles.cardTitle}
              >
                {getLocalizedText(item.name)}
              </Text>
              {!item.directNavigationDestination && (
                <View style={styles.difficultyIconContainer}>
                  {getDifficultyIcon(item.difficulty, 24)}
                  {/* 完了アイコン */}
                  {isCompleted && (
                    <View style={styles.completeIconContainer}>
                      <CheckSmallIcon
                        width={10}
                        height={8}
                        strokeColor="#222"
                        strokeWidth={1.5}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 0,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImageContainerDisabled: {
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
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
    top: -6,
    right: 8,
    zIndex: 1,
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
    gap: 8,
  },
  lockIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#9E9E9E',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    fontFamily: 'KleeOne-SemiBold',
  },
  difficultyIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeIconContainer: {
    position: 'absolute',
    top: 14,
    right: -6,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StringFigureCard;
