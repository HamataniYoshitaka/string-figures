import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { CloseIcon, BookmarkIcon } from '../components/icons';
import ChapterNavigationBarNonverbal from '../components/ChapterNavigationBarNonverbal';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { CHAPTER_VIDEOS, NONVERBAL_CHAPTER_VIDEO_PAIRS } from '../data/chapterVideos';

/** 上下行で共通の左右パディング（旧アニメーション廃止後の固定値） */
const VIDEO_ROW_PADDING_HORIZONTAL = 8;

/** チャプター切り替え時の静止画帯スクロール時間（1Pぶん） */
const NONVERBAL_STILL_STRIP_SCROLL_MS = 500;

/** 縦並び2枚のあいだ */
const NONVERBAL_STILL_VERTICAL_GAP = 12;

/** チャプターごとの静止画2枚（*-1 が上、*-2 が下） */
const NONVERBAL_CHAPTER_STILL_PAIRS = [
  {
    primary: require('../../assets/string-figures/1_star/chapters/img01-1.jpg'),
    secondary: require('../../assets/string-figures/1_star/chapters/img01-2.jpg'),
  },
  {
    primary: require('../../assets/string-figures/1_star/chapters/img02-1.jpg'),
    secondary: require('../../assets/string-figures/1_star/chapters/img02-2.jpg'),
  },
  {
    primary: require('../../assets/string-figures/1_star/chapters/img03-1.jpg'),
    secondary: require('../../assets/string-figures/1_star/chapters/img03-2.jpg'),
  },
  {
    primary: require('../../assets/string-figures/1_star/chapters/img04-1.jpg'),
    secondary: require('../../assets/string-figures/1_star/chapters/img04-2.jpg'),
  },
] as const;

const VideoPlayerNonverbal: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  chapters,
  currentChapterIndex,
  playbackRate,
  videoRef,
  nextChapterButtonRef,
  replayButtonRef,
  previousChapterButtonRef,
  playbackPosition,
  isLastChapterCompleted,
  currentLanguage,
  onPlaybackStatusUpdate,
  onVideoLoad,
  onGoBack,
  onNextChapter,
  onComplete,
  onReplay,
  onPreviousChapter,
  onToggleBookmark,
  bookmarked,
  getLocalizedText,
  getChapterProgress,
  isTemporarilyDisabled,
  backgroundColorAnim,
  lastSpeechTranscript,
  nonverbalPaddingResetKey = 0,
}) => {
  const [speechDebugVisible, setSpeechDebugVisible] = useState(false);
  /** 単一 Video のソース: 前半 *-1.mp4 / 後半 *-2.mp4 */
  const [activeSegment, setActiveSegment] = useState<'primary' | 'secondary'>('primary');

  /** idle → primary → secondary → ended（チャプター内の前半・後半の進行） */
  const segmentPhaseRef = useRef<'idle' | 'primary' | 'secondary' | 'ended'>('idle');
  const primaryDurationMsRef = useRef(0);
  const secondaryDurationMsRef = useRef(0);
  const activeSegmentRef = useRef<'primary' | 'secondary'>('primary');

  const titleSecretTapCountRef = useRef(0);
  const titleSecretTapResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const TITLE_SECRET_TAP_WINDOW_MS = 2000;
  const TITLE_SECRET_TAP_COUNT = 5;

  const handleTitleSecretTap = () => {
    titleSecretTapCountRef.current += 1;
    if (titleSecretTapResetTimerRef.current) {
      clearTimeout(titleSecretTapResetTimerRef.current);
    }
    titleSecretTapResetTimerRef.current = setTimeout(() => {
      titleSecretTapCountRef.current = 0;
      titleSecretTapResetTimerRef.current = null;
    }, TITLE_SECRET_TAP_WINDOW_MS);
    if (titleSecretTapCountRef.current >= TITLE_SECRET_TAP_COUNT) {
      titleSecretTapCountRef.current = 0;
      if (titleSecretTapResetTimerRef.current) {
        clearTimeout(titleSecretTapResetTimerRef.current);
        titleSecretTapResetTimerRef.current = null;
      }
      setSpeechDebugVisible((v) => !v);
    }
  };

  // アニメーション用のスケール値
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const bookmarkButtonScale = useRef(new Animated.Value(1)).current;

  const stillStripTranslateY = useRef(new Animated.Value(0)).current;
  const prevNonverbalStillPageIndexRef = useRef<number | undefined>(undefined);

  // デバイス情報を取得
  const { isTablet, isDeviceLandscape } = useDeviceInfo();

  // セーフエリアインセットを取得
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const nonverbalStillStripImageWidth = windowWidth - VIDEO_ROW_PADDING_HORIZONTAL * 2;
  const nonverbalStillPageIndex = Math.min(
    currentChapterIndex,
    NONVERBAL_CHAPTER_STILL_PAIRS.length - 1,
  );

  const stillPairStackScale = useMemo(() => {
    const W = nonverbalStillStripImageWidth;
    const hOne = (W * 9) / 16;
    const total = hOne * 2 + NONVERBAL_STILL_VERTICAL_GAP;
    return total > windowHeight * 0.92 ? (windowHeight * 0.92) / total : 1;
  }, [nonverbalStillStripImageWidth, windowHeight]);

  useEffect(() => {
    const targetY = -nonverbalStillPageIndex * windowHeight;

    if (prevNonverbalStillPageIndexRef.current === undefined) {
      prevNonverbalStillPageIndexRef.current = nonverbalStillPageIndex;
      stillStripTranslateY.setValue(targetY);
      return;
    }

    if (prevNonverbalStillPageIndexRef.current !== nonverbalStillPageIndex) {
      prevNonverbalStillPageIndexRef.current = nonverbalStillPageIndex;
      Animated.timing(stillStripTranslateY, {
        toValue: targetY,
        duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
        useNativeDriver: true,
      }).start();
      return;
    }

    stillStripTranslateY.setValue(targetY);
  }, [nonverbalStillPageIndex, windowHeight, stillStripTranslateY]);

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

  const chapterNumber = currentChapterIndex + 1;
  const fallbackVideoSource = stringFigure
    ? CHAPTER_VIDEOS[stringFigure.directory]?.[chapterNumber]
    : undefined;
  const nonverbalVideoPair = stringFigure?.nonverbalFormat
    ? NONVERBAL_CHAPTER_VIDEO_PAIRS[stringFigure.directory]?.[chapterNumber]
    : undefined;
  const primaryVideoSource = nonverbalVideoPair?.primary ?? fallbackVideoSource;
  const secondaryVideoSource = nonverbalVideoPair?.secondary ?? fallbackVideoSource;
  const currentVideoSource = activeSegment === 'primary' ? primaryVideoSource : secondaryVideoSource;

  const getTotalDurationMs = () => {
    const d1 = primaryDurationMsRef.current;
    const d2 = secondaryDurationMsRef.current;
    if (d1 > 0 && d2 > 0) return d1 + d2;
    if (d1 > 0) return d1;
    if (d2 > 0) return d2;
    return 0;
  };

  useEffect(() => {
    segmentPhaseRef.current = 'idle';
    primaryDurationMsRef.current = 0;
    secondaryDurationMsRef.current = 0;
    activeSegmentRef.current = 'primary';
    setActiveSegment('primary');
  }, [currentChapterIndex]);

  useEffect(() => {
    if (!nonverbalPaddingResetKey) return;
    segmentPhaseRef.current = 'idle';
    activeSegmentRef.current = 'primary';
    setActiveSegment('primary');
  }, [nonverbalPaddingResetKey]);

  const handleVideoLoad = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    const seg = activeSegmentRef.current;
    if (status.durationMillis != null && status.durationMillis > 0) {
      if (seg === 'primary') {
        primaryDurationMsRef.current = status.durationMillis;
      } else {
        secondaryDurationMsRef.current = status.durationMillis;
      }
    }
    if (seg === 'primary') {
      void onVideoLoad();
    } else {
      void (async () => {
        try {
          await videoRef.current?.playAsync();
        } catch {
          /* noop */
        }
      })();
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      onPlaybackStatusUpdate(status);
      return;
    }

    if (segmentPhaseRef.current === 'ended' && !status.isPlaying) {
      return;
    }

    const seg = activeSegmentRef.current;

    if (seg === 'primary') {
      if (status.durationMillis != null && status.durationMillis > 0) {
        primaryDurationMsRef.current = status.durationMillis;
      }

      if (status.isPlaying) {
        segmentPhaseRef.current = 'primary';
      }

      const d1 = primaryDurationMsRef.current;
      const total = getTotalDurationMs();

      if (status.didJustFinish) {
        segmentPhaseRef.current = 'secondary';
        activeSegmentRef.current = 'secondary';
        setActiveSegment('secondary');
        onPlaybackStatusUpdate({
          ...status,
          isLoaded: true,
          positionMillis: d1,
          durationMillis: total,
          didJustFinish: false,
        } as AVPlaybackStatus);
        return;
      }

      const pos = status.positionMillis ?? 0;
      onPlaybackStatusUpdate({
        ...status,
        positionMillis: pos,
        durationMillis: total,
        didJustFinish: false,
      } as AVPlaybackStatus);
      return;
    }

    // secondary
    if (status.durationMillis != null && status.durationMillis > 0) {
      secondaryDurationMsRef.current = status.durationMillis;
    }

    const d1 = primaryDurationMsRef.current;
    const total = getTotalDurationMs();

    if (status.didJustFinish) {
      segmentPhaseRef.current = 'ended';
      void videoRef.current?.pauseAsync();
      onPlaybackStatusUpdate({
        ...status,
        isLoaded: true,
        positionMillis: total,
        durationMillis: total,
        didJustFinish: true,
      } as AVPlaybackStatus);
      return;
    }

    const pos = d1 + (status.positionMillis ?? 0);
    onPlaybackStatusUpdate({
      ...status,
      positionMillis: pos,
      durationMillis: total,
      didJustFinish: false,
    } as AVPlaybackStatus);
  };

  // stringFigureが未定義の場合の早期リターン
  if (!stringFigure || !chapters || !chapters[currentChapterIndex]) {
    const fixedHeaderBackgroundHeight = insets.top + (isTablet ? 92 : 84);
    return (
      <Animated.View style={{ flex: 1, backgroundColor: backgroundColorAnim }}>
        <View pointerEvents="none" style={styles.fixedHeaderBackground}>
          <Svg width="100%" height={fixedHeaderBackgroundHeight} viewBox="0 0 428 86" preserveAspectRatio="none">
            <Path d="M0 0H428V86C302.976 63.1349 123.158 63.4762 0 86V0Z" fill="#9BB262" />
          </Svg>
        </View>
        <SafeAreaView style={[styles.container, { paddingBottom: containerPaddingBottom, backgroundColor: 'transparent' }]}>
          <View style={styles.header}>
            <TouchableWithoutFeedback
              onPress={onGoBack}
              onPressIn={createPressInHandler(backButtonScale)}
              onPressOut={createPressOutHandler(backButtonScale)}
            >
              <Animated.View
                style={[
                  styles.backButton,
                  { transform: [{ scale: backButtonScale }] },
                ]}
              >
                <CloseIcon width={24} height={24} fillColor="#79716B" />
              </Animated.View>
            </TouchableWithoutFeedback>
            <Pressable
              style={styles.titlePressable}
              onPress={handleTitleSecretTap}
              android_ripple={null}
            >
              <Text
                maxFontSizeMultiplier={1.35}
                numberOfLines={1}
                style={[
                  styles.title,
                  {
                    fontSize: isTablet ? 22 : 18,
                    fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold',
                  },
                ]}
              >
                {getLocalizedText({ ja: stringFigure.name.ja, en: stringFigure.name.en })}
              </Text>
            </Pressable>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Now Loading...</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  const fixedHeaderBackgroundHeight = insets.top + (isTablet ? 92 : 84);

  return (
    <Animated.View style={{ flex: 1, backgroundColor: backgroundColorAnim }}>
      <View pointerEvents="none" style={styles.fixedHeaderBackground}>
        <Svg width="100%" height={fixedHeaderBackgroundHeight} viewBox="0 0 428 86" preserveAspectRatio="none">
          <Path d="M0 0H428V86C302.976 63.1349 123.158 63.4762 0 86V0Z" fill="#9BB262" />
        </Svg>
      </View>
      <View pointerEvents="none" style={[styles.nonverbalStillStripViewport, { height: windowHeight }]}>
        <Animated.View style={{ transform: [{ translateY: stillStripTranslateY }] }}>
          {NONVERBAL_CHAPTER_STILL_PAIRS.map((pair, i) => (
            <View
              key={i}
              style={{
                width: '100%',
                height: windowHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  transform: [{ scale: stillPairStackScale }],
                  alignItems: 'center',
                }}
              >
                <View style={[styles.videoPlayer, { width: nonverbalStillStripImageWidth }]}>
                  <Image source={pair.primary} style={styles.video} resizeMode="cover" />
                </View>
                <View
                  style={[
                    styles.videoPlayer,
                    {
                      width: nonverbalStillStripImageWidth,
                      marginTop: NONVERBAL_STILL_VERTICAL_GAP,
                    },
                  ]}
                >
                  <Image source={pair.secondary} style={styles.video} resizeMode="cover" />
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
      <SafeAreaView style={[styles.container, { paddingBottom: containerPaddingBottom, backgroundColor: 'transparent' }]}>
        <View style={styles.header}>
          <TouchableWithoutFeedback
            onPress={onGoBack}
            onPressIn={createPressInHandler(backButtonScale)}
            onPressOut={createPressOutHandler(backButtonScale)}
          >
            <Animated.View
              style={[
                styles.backButton,
                { transform: [{ scale: backButtonScale }] },
              ]}
            >
              <CloseIcon width={24} height={24} fillColor="#79716B" />
            </Animated.View>
          </TouchableWithoutFeedback>
          <Pressable
            style={styles.titlePressable}
            onPress={handleTitleSecretTap}
            android_ripple={null}
          >
            <Text
              maxFontSizeMultiplier={1.35}
              numberOfLines={1}
              style={[
                styles.title,
                {
                  fontSize: isTablet ? 22 : 18,
                  fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold',
                },
              ]}
            >
              {getLocalizedText({ ja: stringFigure.name.ja, en: stringFigure.name.en })}
            </Text>
          </Pressable>
          <TouchableWithoutFeedback
            onPress={onToggleBookmark}
            onPressIn={createPressInHandler(bookmarkButtonScale)}
            onPressOut={createPressOutHandler(bookmarkButtonScale)}
          >
            <Animated.View
              style={[
                styles.bookmarkButton,
                { transform: [{ scale: bookmarkButtonScale }] },
              ]}
            >
              <BookmarkIcon
                width={24}
                height={24}
                strokeColor="#ffffff"
                fillColor={bookmarked ? '#FB2C36' : '#aaa'}
                strokeWidth={1.5}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.videoCenterContainer}>
          <View
            style={[
              styles.videoArea,
              !isTablet && { paddingHorizontal: 0 },
              (isTablet && isDeviceLandscape) && styles.videoAreaTabletLandscape,
              (isTablet && isDeviceLandscape) && {
                maxHeight: Dimensions.get('window').height * 0.63,
              },
            ]}
          >
            <View
              style={[
                styles.videoRow,
                { paddingHorizontal: VIDEO_ROW_PADDING_HORIZONTAL, opacity: 0 },
              ]}
            >
              <View>
                <View style={styles.videoPlayer}>
                  <Image
                    source={NONVERBAL_CHAPTER_STILL_PAIRS[nonverbalStillPageIndex].primary}
                    style={styles.video}
                    resizeMode="cover"
                  />
                </View>
                <View style={[styles.videoPlayer, { marginTop: NONVERBAL_STILL_VERTICAL_GAP }]}>
                  <Image
                    source={NONVERBAL_CHAPTER_STILL_PAIRS[nonverbalStillPageIndex].secondary}
                    style={styles.video}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
            <View
              style={[
                styles.videoRow,
                { paddingHorizontal: VIDEO_ROW_PADDING_HORIZONTAL },
              ]}
            >
              <View style={styles.videoPlayer}>
                <Video
                  key={`ch${currentChapterIndex}-${activeSegment}`}
                  ref={videoRef}
                  source={currentVideoSource}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isLooping={false}
                  isMuted={true}
                  useNativeControls={false}
                  rate={playbackRate}
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                  onLoad={handleVideoLoad}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 音声認識デバッグ（タイトル5連タップで表示） */}
        {speechDebugVisible && !isDeviceLandscape && (
          <View style={styles.speechDebugOuter}>
            <ScrollView
              nestedScrollEnabled
              style={styles.speechDebugScroll}
              contentContainerStyle={styles.speechDebugScrollContent}
            >
              <Text
                maxFontSizeMultiplier={1.2}
                selectable
                style={styles.speechDebugText}
              >
                {lastSpeechTranscript || '（音声入力待ち）'}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* チャプターナビゲーションバー */}
        <ChapterNavigationBarNonverbal
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onPreviousChapter={onPreviousChapter}
          onReplay={onReplay}
          onNextChapter={onNextChapter}
          onComplete={onComplete}
          getLocalizedText={getLocalizedText}
          previousChapterButtonRef={previousChapterButtonRef}
          replayButtonRef={replayButtonRef}
          nextChapterButtonRef={nextChapterButtonRef}
          playbackPosition={playbackPosition}
          isLastChapterCompleted={isLastChapterCompleted}
          getChapterProgress={getChapterProgress}
          isTemporarilyDisabled={isTemporarilyDisabled}
        />
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    backgroundColor: '#FFF9F0',
    zIndex: 1,
  },
  fixedHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  nonverbalStillStripViewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: 'hidden',
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
  titlePressable: {
    flex: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'KleeOne-SemiBold',
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  speechDebugOuter: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    maxHeight: 96,
  },
  speechDebugScroll: {
    maxHeight: 96,
  },
  speechDebugScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(100, 100, 100, 0.08)',
    borderRadius: 8,
  },
  speechDebugText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  videoArea: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 0 : 8,
    gap: 40,
  },
  videoCenterContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  videoRow: {
    minHeight: 0,
    justifyContent: 'center',
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
    borderWidth: 2,
    borderColor: '#292524',
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

export default VideoPlayerNonverbal;
