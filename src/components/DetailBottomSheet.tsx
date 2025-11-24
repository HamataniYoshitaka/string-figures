import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import { StringFigure } from '../types';
import { EasyIcon, NormalIcon, HardIcon, PlayIcon, BookmarkIcon, TutorialIcon, ExternalLinkIcon } from './icons';
import { useOrientation } from '../hooks/useOrientation';

interface Props {
  item: StringFigure | null;
  isBookmarked: boolean;
  onClose: () => void;
  onPlayVideo: (item: StringFigure) => void;
  onToggleBookmark: () => void;
  currentLanguage: 'ja' | 'en';
}

export interface DetailBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const DetailBottomSheet = forwardRef<DetailBottomSheetRef, Props>(({
  item,
  isBookmarked,
  onClose,
  onPlayVideo,
  onToggleBookmark,
  currentLanguage,
}, ref) => {
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const orientation = useOrientation();
  const isSmallScreen = screenDimensions.height <= 667;
  
  // iPadかどうかを判定
  const isTablet = Math.max(screenDimensions.width, screenDimensions.height) >= 1024;

  // 動的スナップポイントを計算
  const getSnapPoints = useCallback(() => {
    const safeHeight = screenDimensions.height;
    if (orientation === 'landscape') {
      if (isTablet) {
        return [540];
      }
      return [safeHeight * 0.8];
    }
    if (isTablet) {
      return [540];
    }
    if (isSmallScreen) {
      return [safeHeight * 0.8];
    }
    return [safeHeight * 0.65];
  }, [screenDimensions.height, orientation, isTablet, isSmallScreen]);

  const snapPoints = getSnapPoints();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  // タブレット時の動的スタイルを計算
  const getTabletStyle = useCallback(() => {
    if (!isTablet) return undefined;
    const sheetWidth = 420;
    const marginHorizontal = (screenDimensions.width - sheetWidth) / 2;
    return {
      width: sheetWidth,
      alignSelf: 'center' as const,
      marginHorizontal: Math.max(0, marginHorizontal), // 負の値にならないように
    };
  }, [isTablet, screenDimensions.width]);

  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  // 画面サイズ変更の監視
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  const handlePlayPress = () => {
    if (item) {
      onPlayVideo(item);
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (!item) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      style={getTabletStyle()}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
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
        <View style={styles.content}>
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
              colors={['rgba(255,255,255,1.0)','rgba(255,255,255,0.4)', 'rgba(255,255,255,0.4)']}
              style={styles.gradientOverlayTop}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            {/* 白のグラデーション */}
            <LinearGradient
              colors={['rgba(255,255,255,0.4)','rgba(255,255,255,0.4)', 'rgba(255,255,255,1.0)']}
              style={styles.gradientOverlayBottom}
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
            
            {/* 参考情報セクション */}
            {item.data && (
              <View style={styles.referenceContainer}>
                {item.data.region && (
                <View style={styles.referenceRow}>
                  <Text style={styles.referenceLabel}>
                    {getLocalizedText({ ja: '地域', en: 'Region' })}
                  </Text>
                  <Text style={styles.referenceValue}>
                    {getLocalizedText(item.data.region)}
                  </Text>
                </View>
                )}
                {/* <View style={styles.referenceDivider} /> */}
                {item.data.author && (
                  <View style={styles.referenceRow}>
                    <Text style={styles.referenceLabel}>
                      {getLocalizedText({ ja: '作者', en: 'Author' })}
                    </Text>
                    <Text style={styles.referenceValue}>
                      {getLocalizedText(item.data.author)}
                    </Text>
                  </View>
                )}
                
                {/* 出典 */}
                {item.data.source && (
                  <View style={styles.referenceRow}>
                    <Text style={styles.referenceLabel}>
                      {getLocalizedText({ ja: '出典', en: 'Source' })}
                    </Text>
                    <Text style={[styles.referenceValue, styles.referenceValueItalic]}>
                      {item.data.source && (
                        <Text>
                          {item.data.source.split(/(<i>.*?<\/i>)/g).map((part, idx) => {
                            if (part.startsWith('<i>') && part.endsWith('</i>')) {
                              return (
                                <Text key={idx} style={{ fontStyle: 'italic' }}>
                                  {part.replace('<i>', '').replace('</i>', '')}
                                </Text>
                              );
                            }
                            return part;
                          })}
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
                {/* <View style={styles.referenceDivider} /> */}
                
                {item.data.references && (
                  <View style={styles.referenceRow}>
                    <Text style={styles.referenceLabel}>
                      {getLocalizedText({ ja: '参考', en: 'Reference' })}
                    </Text>
                    <View style={styles.referenceValueContainer}>
                      <Text style={[styles.referenceValue, styles.referenceValueItalic]}>
                        World of String figures
                      </Text>
                      <View style={styles.externalLinkIconContainer}>
                        <ExternalLinkIcon width={18} height={18} strokeColor="#57534D" />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

DetailBottomSheet.displayName = 'DetailBottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    position: 'relative',
    paddingBottom: 20,
    marginTop: 0,
    // zIndex: 100,
  },
  handleIndicator: {
    backgroundColor: '#000000',
    opacity: 0.5,
  },
  content: {
    // flex: 1 を削除（スクロール可能なコンテンツでは不要）
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
  videoPreview: {
    height: 240,
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  gradientOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  gradientOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
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
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailText: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
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
    zIndex: 1001,
  },
  referenceContainer: {
    backgroundColor: '#D6D3D1',
    borderRadius: 16,
    marginTop: 20,
    overflow: 'hidden',
    flexDirection: 'column',
    gap: 1,
  },
  referenceRow: {
    backgroundColor: '#F5F5F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  referenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57534D',
    width: 80,
  },
  referenceValue: {
    flex: 1,
    fontSize: 13,
    color: '#57534D',
    textAlign: 'right',
  },
  referenceValueItalic: {
    fontStyle: 'italic',
  },
  referenceValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  externalLinkIconContainer: {
    marginLeft: 10,
  },
  referenceDivider: {
    height: 1,
    backgroundColor: '#D6D3D1',
    marginLeft: 16,
  },
});

export default DetailBottomSheet;
