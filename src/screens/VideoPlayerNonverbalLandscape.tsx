import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import VideoPlayerNonverbalControlPanel from '../components/VideoPlayerNonverbalControlPanel';
import { BookmarkIcon, CloseIcon } from '../components/icons';
import { CHAPTER_VIDEOS, NONVERBAL_CHAPTER_VIDEO_PAIRS } from '../data/chapterVideos';

/** 前半（*-1）終了後、1枚目 Video レイヤーをフェードアウトする時間 */
const NONVERBAL_PRIMARY_FADE_OUT_MS = 300;

const VideoPlayerNonverbalLandscape: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  chapters,
  currentChapterIndex,
  playbackRate,
  videoRef,
  onPlaybackStatusUpdate,
  onVideoLoad,
  getLocalizedText,
  getChapterProgress,
  bookmarked,
  onToggleBookmark,
  backgroundColorAnim,
  nonverbalPaddingResetKey = 0,
  ...restProps
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const containerPaddingRight = Platform.OS === 'android' && insets.right > 30 ? 30 : 0;
  const isSmallScreen = screenWidth <= 667;

  const backButtonScale = useRef(new Animated.Value(1)).current;
  const secondaryVideoRef = useRef<Video>(null);
  const primaryLayerOpacity = useRef(new Animated.Value(1)).current;
  const primaryDurationMsRef = useRef(0);
  const secondaryDurationMsRef = useRef(0);
  const segmentPhaseRef = useRef<'idle' | 'primary' | 'secondary' | 'ended'>('idle');
  const primaryFadeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const chapterNumber = currentChapterIndex + 1;
  const fallbackVideoSource = stringFigure
    ? CHAPTER_VIDEOS[stringFigure.directory]?.[chapterNumber]
    : undefined;
  const nonverbalVideoPair =
    stringFigure?.nonverbalFormat && stringFigure.directory
      ? NONVERBAL_CHAPTER_VIDEO_PAIRS[stringFigure.directory]?.[chapterNumber]
      : undefined;
  const hasVideoPair = Boolean(nonverbalVideoPair);

  const getTotalDurationMs = useCallback(() => {
    const d1 = primaryDurationMsRef.current;
    const d2 = secondaryDurationMsRef.current;
    if (d1 > 0 && d2 > 0) return d1 + d2;
    if (d1 > 0) return d1;
    if (d2 > 0) return d2;
    return 0;
  }, []);

  const resetDualVideoState = useCallback(async () => {
    primaryFadeAnimationRef.current?.stop();
    primaryFadeAnimationRef.current = null;
    primaryLayerOpacity.setValue(1);
    segmentPhaseRef.current = 'idle';
    primaryDurationMsRef.current = 0;
    secondaryDurationMsRef.current = 0;
    try {
      await secondaryVideoRef.current?.pauseAsync();
      await secondaryVideoRef.current?.setPositionAsync(0);
    } catch {
      /* noop */
    }
  }, [primaryLayerOpacity]);

  useEffect(() => {
    if (!hasVideoPair) return;
    void resetDualVideoState();
  }, [currentChapterIndex, hasVideoPair, resetDualVideoState]);

  useEffect(() => {
    if (!hasVideoPair || !nonverbalPaddingResetKey) return;
    void resetDualVideoState();
  }, [nonverbalPaddingResetKey, hasVideoPair, resetDualVideoState]);

  useEffect(() => {
    if (!hasVideoPair) return;
    void (async () => {
      try {
        await videoRef.current?.setRateAsync(playbackRate, true);
        await secondaryVideoRef.current?.setRateAsync(playbackRate, true);
      } catch {
        /* noop */
      }
    })();
  }, [playbackRate, hasVideoPair, currentChapterIndex, videoRef]);

  useEffect(
    () => () => {
      primaryFadeAnimationRef.current?.stop();
    },
    [],
  );

  const handlePrimaryVideoLoad = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      if (status.durationMillis != null && status.durationMillis > 0) {
        primaryDurationMsRef.current = status.durationMillis;
      }
      await onVideoLoad();
    },
    [onVideoLoad],
  );

  const handlePrimaryPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        onPlaybackStatusUpdate(status);
        return;
      }

      if (segmentPhaseRef.current === 'ended' && !status.isPlaying) {
        return;
      }

      if (segmentPhaseRef.current === 'secondary') {
        return;
      }

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
        const anim = Animated.timing(primaryLayerOpacity, {
          toValue: 0,
          duration: NONVERBAL_PRIMARY_FADE_OUT_MS,
          useNativeDriver: true,
        });
        primaryFadeAnimationRef.current = anim;
        anim.start(({ finished }) => {
          primaryFadeAnimationRef.current = null;
          if (finished) {
            void (async () => {
              try {
                await secondaryVideoRef.current?.playAsync();
              } catch {
                /* noop */
              }
            })();
          }
        });

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
    },
    [getTotalDurationMs, onPlaybackStatusUpdate, primaryLayerOpacity],
  );

  const handleSecondaryPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return;
      }

      if (
        segmentPhaseRef.current === 'idle' ||
        segmentPhaseRef.current === 'primary'
      ) {
        if (status.durationMillis != null && status.durationMillis > 0) {
          secondaryDurationMsRef.current = status.durationMillis;
        }
        return;
      }

      if (segmentPhaseRef.current === 'ended' && !status.isPlaying) {
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
    },
    [getTotalDurationMs, onPlaybackStatusUpdate],
  );

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

  const sharedVideoProps = {
    resizeMode: ResizeMode.COVER as const,
    shouldPlay: false,
    isLooping: false,
    isMuted: true,
    useNativeControls: false,
    rate: playbackRate,
  };

  if (!stringFigure || !chapters || !chapters[currentChapterIndex]) {
    const fallbackTitle = stringFigure
      ? getLocalizedText({
          ja: stringFigure.name.ja,
          en: stringFigure.name.en,
        })
      : 'Now Loading...';

    return (
      <Animated.View style={{ flex: 1, backgroundColor: backgroundColorAnim }}>
        <View style={[styles.fallbackContainer, { backgroundColor: 'transparent' }]}>
          <View style={styles.header}>
            <TouchableWithoutFeedback
              onPress={restProps.onGoBack}
              onPressIn={createPressInHandler(backButtonScale)}
              onPressOut={createPressOutHandler(backButtonScale)}
            >
              <Animated.View
                style={[styles.backButton, { transform: [{ scale: backButtonScale }] }]}
              >
                <CloseIcon width={24} height={24} fillColor="#79716B" />
              </Animated.View>
            </TouchableWithoutFeedback>
            <Text style={styles.title} numberOfLines={1}>
              {fallbackTitle}
            </Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Now Loading...</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, backgroundColor: backgroundColorAnim }}>
      <View
        style={[styles.container, { paddingRight: containerPaddingRight, backgroundColor: 'transparent' }]}
      >
        <TouchableOpacity style={styles.bookmarkButton} onPress={onToggleBookmark}>
          <BookmarkIcon
            width={40}
            height={40}
            strokeColor={bookmarked ? 'transparent' : '#ffffff'}
            fillColor={bookmarked ? '#FB2C36' : '#aaa'}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.videoArea,
            isSmallScreen && {
              paddingTop: 40,
              paddingBottom: 40,
            },
          ]}
        >
          <View style={styles.videoPlayer}>
            {hasVideoPair && nonverbalVideoPair ? (
              <>
                {/* absolute のみだと alignItems:flex-end で幅が 0 になるため、レイアウト用の in-flow プレースホルダ */}
                <View style={styles.videoSizer} pointerEvents="none" />
                <View style={styles.videoLayer}>
                  <Video
                    key={`ch${currentChapterIndex}-secondary`}
                    ref={secondaryVideoRef}
                    source={nonverbalVideoPair.secondary}
                    style={styles.videoFill}
                    {...sharedVideoProps}
                    onPlaybackStatusUpdate={handleSecondaryPlaybackStatusUpdate}
                  />
                </View>
                <Animated.View
                  style={[styles.videoLayer, { opacity: primaryLayerOpacity }]}
                  needsOffscreenAlphaCompositing={Platform.OS === 'android'}
                  renderToHardwareTextureAndroid={Platform.OS === 'android'}
                >
                  <Video
                    key={`ch${currentChapterIndex}-primary`}
                    ref={videoRef}
                    source={nonverbalVideoPair.primary}
                    style={styles.videoFill}
                    {...sharedVideoProps}
                    onPlaybackStatusUpdate={handlePrimaryPlaybackStatusUpdate}
                    onLoad={handlePrimaryVideoLoad}
                  />
                </Animated.View>
              </>
            ) : (
              <Video
                key={`chapter-${currentChapterIndex}`}
                ref={videoRef}
                source={fallbackVideoSource}
                style={styles.video}
                {...sharedVideoProps}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                onLoad={onVideoLoad}
              />
            )}
          </View>
        </View>

        {chapters.length > 0 && (
          <VideoPlayerNonverbalControlPanel
            stringFigure={stringFigure}
            chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            playbackPosition={restProps.playbackPosition}
            isLastChapterCompleted={restProps.isLastChapterCompleted}
            playbackRate={playbackRate}
            PLAYBACK_RATES={restProps.PLAYBACK_RATES}
            isLandscapeMode={restProps.isLandscapeMode}
            currentLanguage={restProps.currentLanguage}
            recognizing={restProps.recognizing}
            nextChapterButtonRef={restProps.nextChapterButtonRef as React.RefObject<any>}
            replayButtonRef={restProps.replayButtonRef as React.RefObject<any>}
            previousChapterButtonRef={restProps.previousChapterButtonRef as React.RefObject<any>}
            onGoBack={restProps.onGoBack}
            onNextChapter={restProps.onNextChapter}
            onComplete={restProps.onComplete}
            onReplay={restProps.onReplay}
            onPreviousChapter={restProps.onPreviousChapter}
            onRestartFromBeginning={restProps.onRestartFromBeginning}
            onLandscapeToggle={restProps.onLandscapeToggle}
            getPlaybackRateDisplay={restProps.getPlaybackRateDisplay}
            getChapterProgress={getChapterProgress}
            isTemporarilyDisabled={restProps.isTemporarilyDisabled}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'relative',
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  fallbackContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  title: {
    fontFamily: 'LineSeed-Bold',
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
    color: '#2c2c2c',
  },
  bookmarkButton: {
    position: 'absolute',
    top: -8,
    right: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
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
  videoArea: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 20,
    paddingBottom: 20,
    paddingRight: 20,
  },
  videoPlayer: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
  },
  /** デュアル Video 用: 親の flex 領域いっぱいに広がる in-flow サイザー */
  videoSizer: {
    width: '100%',
    flex: 1,
    minHeight: 0,
  },
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoFill: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    width: '100%',
    height: '100%',
    aspectRatio: 16 / 9,
  },
  progressContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
});

export default VideoPlayerNonverbalLandscape;
