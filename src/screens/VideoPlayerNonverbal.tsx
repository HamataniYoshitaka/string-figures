import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { CloseIcon, BookmarkIcon } from '../components/icons';
import ChapterNavigationBarNonverbal from '../components/ChapterNavigationBarNonverbal';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { CHAPTER_VIDEOS, NONVERBAL_CHAPTER_VIDEO_PAIRS } from '../data/chapterVideos';

const VIDEO_PADDING_LARGE = 8;
const VIDEO_PADDING_COMPACT = 36;
/** primary 終了後に secondary を再生するまでの間隔（ms） */
const SECONDARY_AFTER_PRIMARY_GAP_MS = 500;

const VideoPlayerNonverbal: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  chapters,
  currentChapterIndex,
  playbackRate,
  videoRef,
  secondaryVideoRef: secondaryVideoRefProp,
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
}) => {
  const [speechDebugVisible, setSpeechDebugVisible] = useState(false);
  // scale ではなく左右パディングで見た目サイズを切り替える
  const [topVideoCompact] = useState(false);
  const [bottomVideoCompact] = useState(true);
  const internalSecondaryVideoRef = useRef<Video>(null);
  const secondaryVideoRef = secondaryVideoRefProp ?? internalSecondaryVideoRef;

  /** idle → primary → secondary → ended（チャプター内の前半・後半の進行） */
  const segmentPhaseRef = useRef<'idle' | 'primary' | 'secondary' | 'ended'>('idle');
  const primaryDurationMsRef = useRef(0);
  const secondaryDurationMsRef = useRef(0);
  /** primary の didJustFinish から secondary 再生開始を一度だけ行う */
  const secondaryStartedFromPrimaryRef = useRef(false);
  const secondaryPlayDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
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

  const chapterNumber = currentChapterIndex + 1;
  const fallbackVideoSource = stringFigure
    ? CHAPTER_VIDEOS[stringFigure.directory]?.[chapterNumber]
    : undefined;
  const nonverbalVideoPair = stringFigure?.nonverbalFormat
    ? NONVERBAL_CHAPTER_VIDEO_PAIRS[stringFigure.directory]?.[chapterNumber]
    : undefined;
  const primaryVideoSource = nonverbalVideoPair?.primary ?? fallbackVideoSource;
  const secondaryVideoSource = nonverbalVideoPair?.secondary ?? fallbackVideoSource;

  const getTotalDurationMs = () => {
    const d1 = primaryDurationMsRef.current;
    const d2 = secondaryDurationMsRef.current;
    if (d1 > 0 && d2 > 0) return d1 + d2;
    if (d1 > 0) return d1;
    if (d2 > 0) return d2;
    return 0;
  };

  useEffect(() => {
    if (secondaryPlayDelayTimerRef.current) {
      clearTimeout(secondaryPlayDelayTimerRef.current);
      secondaryPlayDelayTimerRef.current = null;
    }
    segmentPhaseRef.current = 'idle';
    secondaryStartedFromPrimaryRef.current = false;
    primaryDurationMsRef.current = 0;
    secondaryDurationMsRef.current = 0;
  }, [currentChapterIndex]);

  useEffect(() => {
    return () => {
      if (secondaryPlayDelayTimerRef.current) {
        clearTimeout(secondaryPlayDelayTimerRef.current);
        secondaryPlayDelayTimerRef.current = null;
      }
    };
  }, []);

  const handlePrimaryLoad = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.durationMillis != null && status.durationMillis > 0) {
      primaryDurationMsRef.current = status.durationMillis;
    }
    void onVideoLoad();
  };

  const handleSecondaryLoad = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.durationMillis != null && status.durationMillis > 0) {
      secondaryDurationMsRef.current = status.durationMillis;
    }
  };

  const handlePrimaryPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      onPlaybackStatusUpdate(status);
      return;
    }

    const phase = segmentPhaseRef.current;
    if (phase === 'secondary') {
      return;
    }
    if (phase === 'ended' && !status.isPlaying) {
      return;
    }

    if (status.durationMillis != null && status.durationMillis > 0) {
      primaryDurationMsRef.current = status.durationMillis;
    }

    if (status.isPlaying) {
      segmentPhaseRef.current = 'primary';
      if ((status.positionMillis ?? 0) < 80) {
        secondaryStartedFromPrimaryRef.current = false;
      }
    }

    const d1 = primaryDurationMsRef.current;
    const total = getTotalDurationMs();

    if (status.didJustFinish) {
      if (!secondaryStartedFromPrimaryRef.current) {
        secondaryStartedFromPrimaryRef.current = true;
        segmentPhaseRef.current = 'secondary';
        if (secondaryPlayDelayTimerRef.current) {
          clearTimeout(secondaryPlayDelayTimerRef.current);
        }
        secondaryPlayDelayTimerRef.current = setTimeout(() => {
          secondaryPlayDelayTimerRef.current = null;
          queueMicrotask(() => {
            void (async () => {
              try {
                await secondaryVideoRef.current?.setPositionAsync(0);
                await secondaryVideoRef.current?.playAsync();
              } catch {
                /* noop */
              }
            })();
          });
        }, SECONDARY_AFTER_PRIMARY_GAP_MS);
      }
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
  };

  const handleSecondaryPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (segmentPhaseRef.current !== 'secondary') {
      return;
    }

    if (status.durationMillis != null && status.durationMillis > 0) {
      secondaryDurationMsRef.current = status.durationMillis;
    }

    const d1 = primaryDurationMsRef.current;
    const total = getTotalDurationMs();

    if (status.didJustFinish) {
      segmentPhaseRef.current = 'ended';
      void secondaryVideoRef.current?.pauseAsync();
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
          {/* 動画エリア（上下2枚・同一ソース。paddingHorizontal をフラグ連動で切替） */}
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
                {
                  paddingHorizontal: topVideoCompact ? VIDEO_PADDING_COMPACT : VIDEO_PADDING_LARGE,
                },
              ]}
            >
              <View
                style={[
                  styles.videoPlayer,
                ]}
              >
                <Video
                  key={`chapter-${currentChapterIndex}-primary`}
                  ref={videoRef}
                  source={primaryVideoSource}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isLooping={false}
                  isMuted={true}
                  useNativeControls={false}
                  rate={playbackRate}
                  onPlaybackStatusUpdate={handlePrimaryPlaybackStatusUpdate}
                  onLoad={handlePrimaryLoad}
                />
              </View>
            </View>
            <View
              style={[
                styles.videoRow,
                {
                  paddingHorizontal: bottomVideoCompact ? VIDEO_PADDING_COMPACT : VIDEO_PADDING_LARGE,
                },
              ]}
            >
              <View
                style={[
                  styles.videoPlayer,
                ]}
              >
                <Video
                  key={`chapter-${currentChapterIndex}-secondary`}
                  ref={secondaryVideoRef}
                  source={secondaryVideoSource}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isLooping={false}
                  isMuted={true}
                  useNativeControls={false}
                  rate={playbackRate}
                  onPlaybackStatusUpdate={handleSecondaryPlaybackStatusUpdate}
                  onLoad={handleSecondaryLoad}
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
