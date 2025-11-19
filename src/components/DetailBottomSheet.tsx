import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import { StringFigure } from '../types';
import { EasyIcon, NormalIcon, HardIcon, PlayIcon, BookmarkIcon, TutorialIcon } from './icons';
import { useOrientation } from '../hooks/useOrientation';

interface Props {
  isVisible: boolean;
  item: StringFigure | null;
  isBookmarked: boolean;
  onClose: () => void;
  onPlayVideo: (item: StringFigure) => void;
  onToggleBookmark: () => void;
  currentLanguage: 'ja' | 'en';
}

const DetailBottomSheet: React.FC<Props> = ({
  isVisible,
  item,
  isBookmarked,
  onClose,
  onPlayVideo,
  onToggleBookmark,
  currentLanguage,
}) => {
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const orientation = useOrientation();
  const isSmallScreen = screenDimensions.height <= 667; // iPhoneSE2の高さは667px (横向きなので高さが幅になる)
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Android landscape時の安全な高さを計算
  const getSafeHeight = () => {
    if (Platform.OS === 'android' && orientation === 'landscape') {
      // Androidのlandscapeモードでは画面全体の高さを使用
      return screenDimensions.height;
    }
    return screenDimensions.height;
  };

  const safeHeight = getSafeHeight();

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // 画面サイズ変更の監視
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // iPadかどうかを判定（より大きな画面サイズで判定）
  const isTablet = Math.max(screenDimensions.width, screenDimensions.height) >= 1024;
  
  // snapPointsを計算
  const snapPoints = useMemo(() => {
    const minHeight = orientation === 'landscape' 
      ? isTablet
        ? 540 // タブレットの場合は540
        : safeHeight * 0.8 // スマホの場合は80%
      : isTablet 
        ? 540 // タブレットの場合は540
        : isSmallScreen 
          ? safeHeight * 0.8 // 小さい画面(iPhoneSE2)の場合は80%
          : safeHeight * 0.65; // それ以外は65%
    
    return [minHeight];
  }, [orientation, isTablet, safeHeight, isSmallScreen]);

  // isVisibleの変化に応じてBottomSheetを開閉
  useEffect(() => {
    if (isVisible && item) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, item]);

  // BottomSheetの状態変化を処理
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // BottomSheetが閉じられた
      onClose();
    }
  }, [onClose]);

  // バックドロップのレンダリング
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handlePlayPress = () => {
    if (item) {
      onPlayVideo(item);
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return TutorialIcon;
      case 'easy': return EasyIcon;
      case 'medium': return NormalIcon;
      case 'hard': return HardIcon;
      default: return EasyIcon;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    const difficultyTexts = {
      basic: { ja: 'きほん', en: 'Basic' },
      easy: { ja: 'かんたん', en: 'Easy' },
      medium: { ja: 'ふつう', en: 'Normal' },
      hard: { ja: 'むずかしい', en: 'Hard' },
    };
    
    const textObj = difficultyTexts[difficulty as keyof typeof difficultyTexts];
    return textObj ? getLocalizedText(textObj) : '';
  };

  if (!item) return null;

  const dynamicBottomSheetStyle = {
    ...(isTablet ? { width: 420 } : { width: screenDimensions.width }),  // タブレットの場合のみwidthを420に設定
    // Androidのlandscapeモードでは下部のマージンを削除
    ...(Platform.OS === 'android' && orientation === 'landscape' && {
      marginBottom: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    }),
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheet}
      handleIndicatorStyle={styles.handleIndicator}
      style={dynamicBottomSheetStyle}
    >
      <BottomSheetView style={styles.content}>
        {/* ブックマークボタン */}
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={onToggleBookmark}
        >
          <BookmarkIcon
            width={32}
            height={32}
            strokeColor={isBookmarked ? '#DC2626' : '#ffffff'}
            fillColor={isBookmarked ? '#DC2626' : '#aaa'}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        {/* コンテンツ */}
        <View style={styles.contentInner}>
                {/* プレビュー動画エリア */}
                <View style={styles.imageContainer}>
                  {item.previewUrl ? (
                    <Video
                      source={typeof item.previewUrl === 'string' 
                        ? { uri: item.previewUrl } 
                        : item.previewUrl
                      }
                      style={styles.videoPreview}
                      shouldPlay={true}
                      isLooping={true}
                      isMuted={true}
                      resizeMode={ResizeMode.COVER}
                      useNativeControls={false}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imageText}>
                        {getLocalizedText({ ja: '動画プレビュー', en: 'Video Preview' })}
                      </Text>
                    </View>
                  )}
                  
                  {/* 白のグラデーション */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)','rgba(255,255,255,0.4)', 'rgba(255,255,255,1.0)']}
                    style={styles.gradientOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                  
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPress}
                  >
                    <PlayIcon width={24} height={28} strokeWidth={3} />
                  </TouchableOpacity>
                </View>

                {/* サムネイル - プレビュー動画エリアに重ねる */}
                <View style={styles.thumbnailContainer}>
                  <View style={styles.thumbnail}>
                    {item.patternImage ? (
                      <Image 
                        source={typeof item.patternImage === 'string' 
                          ? { uri: item.patternImage } 
                          : item.patternImage
                        } 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.thumbnailText}>
                        {getLocalizedText({ ja: '完成図', en: 'Pattern' })}
                      </Text>
                    )}
                  </View>
                </View>

                {/* 作品情報 */}
                <View style={styles.infoContainer}>
                  <Text style={[
                    styles.title,
                    { fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }
                  ]}>{getLocalizedText(item.name)}</Text>
                  <View style={styles.difficultyContainer}>
                    {(() => {
                      const IconComponent = getDifficultyIcon(item.difficulty);
                      return <IconComponent width={28} height={28} strokeColor="#666" />;
                    })()}
                    <Text style={styles.difficultyText}>
                      {getDifficultyText(item.difficulty)}
                    </Text>
                  </View>
                  <Text style={styles.description}>{getLocalizedText(item.description)}</Text>
                </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  handleIndicator: {
    width: 60,
    height: 5,
    backgroundColor: '#000000',
    opacity: 0.5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
    position: 'relative',
  },
  contentInner: {
    flex: 1,
  },
  contentLandscape: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    width: '100%',
  },
  imagePlaceholder: {
    height: 240,
    width: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderLandscape: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreview: {
    height: 240,
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  videoPreviewLandscape: {
    height: '100%',
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  gradientOverlayLandscape: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  imageText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingStart: 4,
  },
  playButtonLandscape: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingStart: 4,
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 180,
    alignSelf: 'center',
    zIndex: 10,
  },
  thumbnail: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#79716B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailLandscape: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#79716B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailText: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  infoAreaLandscape: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  infoTopSectionLandscape: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 24,
  },
  titleSectionLandscape: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
  },
  videoAreaLandscape: {
    width: 548,
    height: '100%',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'KleeOne-SemiBold',
  },
  titleLandscape: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#57534D',
    textAlign: 'left',
    fontFamily: 'KleeOne-SemiBold',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 6,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'center',
  },
  difficultyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'KleeOne-Regular',
  },
  bookmarkButton: {
    position: 'absolute',
    top: -12,
    right: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  },
});

export default DetailBottomSheet;
