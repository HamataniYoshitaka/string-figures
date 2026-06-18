import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
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
  hideTitle?: boolean;
  purchasedItems?: number[];
  refreshKey?: number;
  imageEpoch?: number;
  onPress: (item: StringFigure) => void;
  onImageLoad: (itemId: string, event: any) => void;
}

const StringFigureCard: React.FC<Props> = ({
  item,
  bookmarked,
  calculatedHeight,
  currentLanguage,
  hideTitle = false,
  purchasedItems = [],
  refreshKey,
  imageEpoch = 0,
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
  }, [item.id, refreshKey]);

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
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.cardImageWrapper,
            item.thumbnail ? { height: calculatedHeight } : styles.cardImageWrapperAutoHeight,
          ]}
        >
          {/* シャドウのみ（背面に重ねる） */}
          <View style={styles.cardImageShadow} pointerEvents="none" />
          {/* 枠線・コンテンツ */}
          <View style={styles.cardImageBordered}>
            {item.thumbnail ? (
              <Image
                key={`${item.id}-${imageEpoch}`}
                source={typeof item.thumbnail === 'string' ? { uri: item.thumbnail } : item.thumbnail}
                style={styles.cardImage}
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
                style={[
                  styles.cardTitle,
                  { fontFamily: currentLanguage === 'ja' ? 'LineSeed-Bold' : 'KronaOne-Regular' },
                ]}
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
    overflow: 'visible',
  },
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
    /** translate(4) 分、下方向のはみ出しでタイトルと被らないようにする */
    marginBottom: 4,
  },
  cardImageWrapperAutoHeight: {
    aspectRatio: 1,
  },
  /** ぼかしシャドウは使わず、枠と同色のソリッドをずらして重ねる（背面レイヤー） */
  cardImageShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    backgroundColor: '#292524',
    zIndex: 0,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  cardImageBordered: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#292524',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: '#FFF9F0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    mixBlendMode: 'multiply',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF9F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageText: {
    color: '#9E9E9E',
    fontSize: 16,
    fontFamily: 'LineSeed-Regular',
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
    color: '#292524',
    flex: 1,
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
