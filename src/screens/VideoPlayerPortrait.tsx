import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { CloseIcon, BookmarkIcon } from '../components/icons';
import LandScapeIcon from '../components/icons/LandScape';
import ChapterNavigationBar from '../components/ChapterNavigationBar';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
// import ProgressDots from '../components/ProgressDots';
import { CHAPTER_VIDEOS } from '../data/chapterVideos';

const VideoPlayerPortrait: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  chapters,
  currentChapterIndex,
  playbackRate,
  videoRef,
  nextChapterButtonRef,
  replayButtonRef,
  previousChapterButtonRef,
  restartButtonRef,
  playbackPosition,
  isLastChapterCompleted,
  isLandscapeMode,
  currentLanguage,
  onPlaybackStatusUpdate,
  onVideoLoad,
  onGoBack,
  onNextChapter,
  onReplay,
  onPreviousChapter,
  onRestartFromBeginning,
  // onSlowerSpeed,
  // onFasterSpeed,
  onLandscapeToggle,
  onToggleBookmark,
  bookmarked,
  getLocalizedText,
  getChapterProgress,
  isTemporarilyDisabled,
  // getPlaybackRateDisplay,
}) => {
  // アニメーション用のスケール値
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const bookmarkButtonScale = useRef(new Animated.Value(1)).current;
  const shareButtonScale = useRef(new Animated.Value(1)).current;

  // デバイス情報を取得
  const { isTablet, isDeviceLandscape } = useDeviceInfo();
  
  // セーフエリアインセットを取得
  const insets = useSafeAreaInsets();
  
  // Androidでシステムバーがある場合のpaddingBottomを計算
  const containerPaddingBottom = Platform.OS === 'android' && insets.bottom > 30 ? 40 : 0;
  
  // アニメーションヘルパー関数
  const createPressInHandler = (scale: Animated.Value) => () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const createPressOutHandler = (scale: Animated.Value) => () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };
    
  // stringFigureが未定義の場合の早期リターン
  if (!stringFigure || !chapters || !chapters[currentChapterIndex]) {
    // console.log('VideoPlayerPortrait - Invalid stringFigure or chapter data');
    return (
      <SafeAreaView style={[styles.container, { paddingBottom: containerPaddingBottom }]}>
        <View style={styles.header}>
          <TouchableWithoutFeedback 
            onPress={onGoBack}
            onPressIn={createPressInHandler(backButtonScale)}
            onPressOut={createPressOutHandler(backButtonScale)}
          >
            <Animated.View 
              style={[
                styles.backButton,
                { transform: [{ scale: backButtonScale }] }
              ]}
            >
              <CloseIcon width={24} height={24} fillColor="#79716B" />
            </Animated.View>
          </TouchableWithoutFeedback>
          <Text 
            maxFontSizeMultiplier={1.35}
            numberOfLines={1}
            style={[
              styles.title, 
              { 
                fontSize: isTablet ? 22 : 18,
                fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold'
              }
            ]}
          >
            {getLocalizedText({ja: stringFigure.name.ja, en: stringFigure.name.en})}
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Now Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMainButtonPress = () => {
    if (currentChapterIndex === chapters.length - 1) {
      onReplay();
    } else {
      onNextChapter();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: containerPaddingBottom }]}>
      <View style={styles.header}>
        <TouchableWithoutFeedback 
          onPress={onGoBack}
          onPressIn={createPressInHandler(backButtonScale)}
          onPressOut={createPressOutHandler(backButtonScale)}
        >
          <Animated.View 
            style={[
              styles.backButton,
              { transform: [{ scale: backButtonScale }] }
            ]}
          >
            <CloseIcon width={24} height={24} fillColor="#79716B" />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Text 
          maxFontSizeMultiplier={1.35}
          numberOfLines={1}
          style={[
            styles.title, 
            { 
              fontSize: isTablet ? 22 : 18,
              fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold'
            }
          ]}
        >
          {getLocalizedText({ja: stringFigure.name.ja, en: stringFigure.name.en})}
        </Text>
        <TouchableWithoutFeedback 
          onPress={onToggleBookmark}
          onPressIn={createPressInHandler(bookmarkButtonScale)}
          onPressOut={createPressOutHandler(bookmarkButtonScale)}
        >
          <Animated.View 
            style={[
              styles.bookmarkButton,
              { transform: [{ scale: bookmarkButtonScale }] }
            ]}
          >
            <BookmarkIcon 
              width={24} 
              height={24} 
              strokeColor="#ffffff"
              fillColor={bookmarked ? "#FB2C36" : "#aaa"}
              strokeWidth={1.5}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        {!isTablet && (
          <TouchableWithoutFeedback 
            onPress={onLandscapeToggle}
            onPressIn={createPressInHandler(shareButtonScale)}
            onPressOut={createPressOutHandler(shareButtonScale)}
          >
            <Animated.View 
              style={[
                styles.shareButton,
                { transform: [{ scale: shareButtonScale }] }
              ]}
            >
              <LandScapeIcon 
                width={24} 
                height={24} 
                fillColor={isLandscapeMode ? "#1862cfff" : "#79716B"}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        )}
      </View>
      
      {/* 動画エリア */}
      <View style={[
        styles.videoArea,
        !isTablet && { paddingHorizontal: 0 },
        (isTablet && isDeviceLandscape) && styles.videoAreaTabletLandscape
      ]}>
        <View style={[
          styles.videoPlayer,
          !isTablet && { borderRadius: 0 },
          (isTablet && isDeviceLandscape) && { height: Dimensions.get('window').height * 0.63 }
        ]}>
          <Video
            key={`chapter-${currentChapterIndex}`}
            ref={videoRef}
            source={CHAPTER_VIDEOS[stringFigure.directory]?.[currentChapterIndex + 1]}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            isMuted={true}
            useNativeControls={false}
            rate={playbackRate}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            onLoad={onVideoLoad}
          />
          {/* 字幕エリア - 動画の上に重ねて表示 */}
          {isTablet && isDeviceLandscape && (
            <View style={styles.subtitleContainerTabletLandscape}>
              <View style={styles.subtitleStackTabletLandscape} pointerEvents="none">
                {/* 影だけを同じ位置に重ねる（回数で濃さ調整） */}
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={[styles.subtitleTextTabletLandscape, styles.subtitleShadowTabletLandscape]}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>

                {/* 本体テキスト */}
                <Text 
                  maxFontSizeMultiplier={1.25}
                  style={styles.subtitleTextTabletLandscape}
                >
                  {getLocalizedText(chapters[currentChapterIndex].subtitle)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 字幕エリア - デバイスがランドスケープの場合は非表示 */}
      {!isDeviceLandscape && (
        <View style={styles.subtitleContainer}>
          <Text 
            maxFontSizeMultiplier={1.25}
            style={[
              { fontSize: isTablet ? 19 : 16 },
              styles.subtitleText
            ]}
          >
            {getLocalizedText(chapters[currentChapterIndex].subtitle)}
          </Text>
        </View>
      )}

      {/* チャプターナビゲーションバー */}
      <ChapterNavigationBar
        chapters={chapters}
        currentChapterIndex={currentChapterIndex}
        onPreviousChapter={onPreviousChapter}
        onReplay={onReplay}
        onNextChapter={handleMainButtonPress}
        getLocalizedText={getLocalizedText}
        previousChapterButtonRef={previousChapterButtonRef}
        replayButtonRef={replayButtonRef}
        nextChapterButtonRef={nextChapterButtonRef}
        restartButtonRef={restartButtonRef}
        onRestart={onRestartFromBeginning}
        playbackPosition={playbackPosition}
        isLastChapterCompleted={isLastChapterCompleted}
        getChapterProgress={getChapterProgress}
        isTemporarilyDisabled={isTemporarilyDisabled}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabletLandscapeCloseButtonContainer: {
    position: 'absolute',
    top: 16,
    left: 8,
    padding: 8,
  },
  tabletLandscapeCloseButton: {
    padding: 8,
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
    borderRadius: 24,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  bookmarkButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  title: {
    fontFamily: 'KleeOne-SemiBold',
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  videoArea: {
    paddingHorizontal: 16,
    // paddingTop: 16,
    paddingTop: Platform.OS === 'android' ? 0 : 8,
  },
  videoAreaTabletLandscape: {
    paddingTop: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    marginTop: 16,
    paddingLeft: 16,
  },
  progressContainerLandscape: {
    marginBottom: 16,
  },
  speedButton: {
    backgroundColor: 'rgba(209, 200, 194, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
  },
  speedButtonTopLeft: {
    borderTopLeftRadius: 0,
  },
  subtitleContainerTabletLandscape: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // 重ね描き用のコンテナ（重ねテキストの基準位置）
  subtitleStackTabletLandscape: {
    position: 'relative',
    alignItems: 'center',
  },
  subtitleTextTabletLandscape: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,  
    fontFamily: 'KleeOne-SemiBold',
  },
  // 影用テキスト（同じ位置に配置して影だけを重ねる）
  subtitleShadowTabletLandscape: {
    position: 'absolute',
    left: 0,
    right: 0,
    // color: 'transparent',
    textShadowColor: 'rgba(60, 60, 60, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  subtitleContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  subtitleText: {
    fontFamily: 'KleeOne-Regular',
    // fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default VideoPlayerPortrait;
