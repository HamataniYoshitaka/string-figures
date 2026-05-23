import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import VideoPlayerNonverbalControlPanel from '../components/VideoPlayerNonverbalControlPanel';
import { BookmarkIcon, CloseIcon } from '../components/icons';
import { CHAPTER_VIDEOS, NONVERBAL_CHAPTER_VIDEO_PAIRS } from '../data/chapterVideos';

/** 前半（*-1）終了後、1枚目 Video レイヤーをフェードアウトする時間 */
const NONVERBAL_PRIMARY_FADE_OUT_MS = 300;

/** 動画エリアの上下・右余白（天地と右を揃える） */
const VIDEO_AREA_EDGE_INSET = 20;
const VIDEO_ASPECT_RATIO = 16 / 9;

const VideoPlayerNonverbalLandscape: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  chapters,
  currentChapterIndex,
  playbackRate,
  videoRef,
  onPlaybackStatusUpdate,
  onNonverbalSegmentPlaybackUpdate,
  onVideoLoad,
  getLocalizedText,
  bookmarked,
  onToggleBookmark,
  backgroundColorAnim,
  nonverbalPaddingResetKey = 0,
  ...restProps
}) => {
  const insets = useSafeAreaInsets();
  const containerPaddingRight = Platform.OS === 'android' && insets.right > 30 ? 30 : 0;

  const [videoAreaSize, setVideoAreaSize] = useState({ width: 0, height: 0 });
  const videoContentHeight = Math.max(0, videoAreaSize.height - VIDEO_AREA_EDGE_INSET * 2);
  const maxVideoWidth = Math.max(0, videoAreaSize.width - VIDEO_AREA_EDGE_INSET);
  let videoPlayerHeight = videoContentHeight;
  let videoPlayerWidth = videoContentHeight * VIDEO_ASPECT_RATIO;
  if (videoPlayerWidth > maxVideoWidth && maxVideoWidth > 0) {
    videoPlayerWidth = maxVideoWidth;
    videoPlayerHeight = maxVideoWidth / VIDEO_ASPECT_RATIO;
  }

  const handleVideoAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setVideoAreaSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  const videoPlayerSizeStyle =
    videoPlayerWidth > 0 && videoPlayerHeight > 0
      ? { width: videoPlayerWidth, height: videoPlayerHeight }
      : null;

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

  const pushSegmentPlayback = useCallback(
    (update: Partial<{
      primaryDurationMs: number;
      primaryPlaybackPositionMs: number;
      secondaryDurationMs: number;
      secondaryPlaybackPositionMs: number;
    }>) => {
      if (!hasVideoPair) return;
      onNonverbalSegmentPlaybackUpdate?.({
        primaryDurationMs: primaryDurationMsRef.current,
        primaryPlaybackPositionMs: 0,
        secondaryDurationMs: secondaryDurationMsRef.current,
        secondaryPlaybackPositionMs: 0,
        ...update,
      });
    },
    [hasVideoPair, onNonverbalSegmentPlaybackUpdate],
  );

  const resetDualVideoState = useCallback(
    async (options?: { resetDurations?: boolean }) => {
      primaryFadeAnimationRef.current?.stop();
      primaryFadeAnimationRef.current = null;
      segmentPhaseRef.current = 'idle';

      if (options?.resetDurations) {
        primaryDurationMsRef.current = 0;
        secondaryDurationMsRef.current = 0;
      }

      // 終了フレームが見えないよう、先頭に戻してから primary を表示する
      primaryLayerOpacity.setValue(0);

      try {
        await secondaryVideoRef.current?.pauseAsync();
        await secondaryVideoRef.current?.setPositionAsync(0);
        await videoRef.current?.pauseAsync();
        await videoRef.current?.setPositionAsync(0);
      } catch {
        /* noop */
      }

      primaryLayerOpacity.setValue(1);
    },
    [primaryLayerOpacity, videoRef],
  );

  useEffect(() => {
    if (!hasVideoPair) return;
    void resetDualVideoState({ resetDurations: true });
  }, [currentChapterIndex, hasVideoPair, resetDualVideoState]);

  useEffect(() => {
    if (!hasVideoPair || !nonverbalPaddingResetKey) return;
    void resetDualVideoState({ resetDurations: false });
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
        pushSegmentPlayback({
          primaryDurationMs: status.durationMillis,
          primaryPlaybackPositionMs: 0,
          secondaryPlaybackPositionMs: 0,
        });
      }
      await onVideoLoad();
    },
    [onVideoLoad, pushSegmentPlayback],
  );

  const handlePrimaryPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (!hasVideoPair) {
          onPlaybackStatusUpdate(status);
        }
        return;
      }

      if (!hasVideoPair) {
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
      const d2 = secondaryDurationMsRef.current;

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

        pushSegmentPlayback({
          primaryDurationMs: d1,
          primaryPlaybackPositionMs: d1,
          secondaryDurationMs: d2,
          secondaryPlaybackPositionMs: 0,
        });
        return;
      }

      pushSegmentPlayback({
        primaryDurationMs: status.durationMillis ?? d1,
        primaryPlaybackPositionMs: status.positionMillis ?? 0,
        secondaryDurationMs: d2,
        secondaryPlaybackPositionMs: 0,
      });
    },
    [hasVideoPair, onPlaybackStatusUpdate, primaryLayerOpacity, pushSegmentPlayback],
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
          pushSegmentPlayback({ secondaryDurationMs: status.durationMillis });
        }
        return;
      }

      if (segmentPhaseRef.current === 'ended' && !status.isPlaying) {
        return;
      }

      if (segmentPhaseRef.current === 'ended') {
        return;
      }

      if (status.durationMillis != null && status.durationMillis > 0) {
        secondaryDurationMsRef.current = status.durationMillis;
      }

      const d1 = primaryDurationMsRef.current;
      const d2 = secondaryDurationMsRef.current;

      if (status.didJustFinish) {
        segmentPhaseRef.current = 'ended';
        void secondaryVideoRef.current?.pauseAsync();
        pushSegmentPlayback({
          primaryDurationMs: d1,
          primaryPlaybackPositionMs: d1,
          secondaryDurationMs: d2,
          secondaryPlaybackPositionMs: d2,
        });
        onPlaybackStatusUpdate({
          ...status,
          isLoaded: true,
          didJustFinish: true,
        } as AVPlaybackStatus);
        return;
      }

      const secondaryPosition = status.positionMillis ?? 0;
      pushSegmentPlayback({
        primaryDurationMs: d1,
        primaryPlaybackPositionMs: d1,
        secondaryDurationMs:
          status.durationMillis != null && status.durationMillis > 0
            ? status.durationMillis
            : d2,
        secondaryPlaybackPositionMs: secondaryPosition,
      });
    },
    [onPlaybackStatusUpdate, pushSegmentPlayback],
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
                <CloseIcon width={24} height={24} fillColor="#292524" />
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
            strokeColor='#292524'
            fillColor={bookmarked ? '#FB2C36' : '#aaa'}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        <View style={styles.videoArea} onLayout={handleVideoAreaLayout}>
          <View style={[styles.videoPlayer, videoPlayerSizeStyle]}>
            {hasVideoPair && nonverbalVideoPair ? (
              <>
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
                style={styles.videoFill}
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
            nonverbalSegmentPlayback={restProps.nonverbalSegmentPlayback}
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
    justifyContent: 'center',
    paddingTop: VIDEO_AREA_EDGE_INSET,
    paddingBottom: VIDEO_AREA_EDGE_INSET,
    paddingRight: VIDEO_AREA_EDGE_INSET,
  },
  videoPlayer: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#292524',
  },
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoFill: {
    ...StyleSheet.absoluteFillObject,
  },
  progressContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
});

export default VideoPlayerNonverbalLandscape;
