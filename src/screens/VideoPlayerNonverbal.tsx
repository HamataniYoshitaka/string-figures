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

/** 縦並び2枚のあいだ（フィルムストリップ行間の固定 16pt と揃える） */
const NONVERBAL_STILL_VERTICAL_GAP = 16;

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

/** フィルムストリップ: img01-1 ～ img04-1 のみ */
const NONVERBAL_STILL_PRIMARY_IMAGES = NONVERBAL_CHAPTER_STILL_PAIRS.map((p) => p.primary);

/** 先頭空2 + 4枚 + 末尾空2（ch1 初期 [空,空,01-1,02-1]、最終 ch [02-1,03-1,04-1,空] 等） */
const NONVERBAL_STRIP_SOURCES: readonly (number | null)[] = [
  null,
  null,
  ...NONVERBAL_STILL_PRIMARY_IMAGES,
  null,
  null,
];

/** visible 4行ウィンドウの先頭インデックスに対応する translateY=-index*stripRowSlotHeight の最大 index */
function getNonverbalMaxStripScrollIndex(stripLength: number): number {
  return Math.max(0, stripLength - 4);
}

/** *-01 終了のたびにストリップが +1 する前提でのナビ同期用インデックス */
function getStripScrollTargetForChapterSegment(chapterIndex: number, segment: 'primary' | 'secondary'): number {
  return chapterIndex + (segment === 'secondary' ? 1 : 0);
}

/**
 * 4行ビューポートで上下1行はフェードアウト、中央2行は不透明になる opacity を
 * translateY から補間（行中心が H/2〜7H/2 の帯で 0→1→0 に滑らかに変化）
 * rowStride: 行の高さ + 行間（スクロール1P分）
 * verticalOffset: ストリップ全体を画面縦中央に置くためのオフセット（marginTop と同じ値）
 */
function createStripRowOpacity(
  translateY: Animated.Value,
  rowIndex: number,
  rowHeight: number,
  rowStride: number,
  verticalOffset: number,
): Animated.AnimatedInterpolation<number> {
  const H = rowHeight;
  const centerY = Animated.add(translateY, verticalOffset + rowIndex * rowStride + H / 2);
  return centerY.interpolate({
    inputRange: [-2 * H, 0, H / 2, (3 * H) / 2, (5 * H) / 2, (7 * H) / 2, 4 * H, 6 * H],
    outputRange: [0, 0, 0, 1, 1, 0, 0, 0],
    extrapolate: 'clamp',
  });
}

const NONVERBAL_STRIP_CHAPTER_COUNT = NONVERBAL_CHAPTER_STILL_PAIRS.length;

const AnimatedStripImage = Animated.createAnimatedComponent(Image);

function applyStripChapterPrimaryOpacityTargets(
  values: Animated.Value[],
  chapterIndex: number,
  segment: 'primary' | 'secondary',
) {
  for (let c = 0; c < NONVERBAL_STRIP_CHAPTER_COUNT; c++) {
    const target =
      c < chapterIndex || (c === chapterIndex && segment === 'secondary') ? 0 : 1;
    values[c].setValue(target);
  }
}

function resetStripChapterPrimaryOpacitiesToOne(values: Animated.Value[]) {
  for (let c = 0; c < NONVERBAL_STRIP_CHAPTER_COUNT; c++) {
    values[c].setValue(1);
  }
}

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
  /** 各チャプター行の *-01 静止画の不透明度（1→0 で *-02 へクロスフェード） */
  const stillChapterPrimaryOpacity = useRef(
    Array.from({ length: NONVERBAL_STRIP_CHAPTER_COUNT }, () => new Animated.Value(1)),
  ).current;

  /** secondary レイヤー用: primary が 0 のとき 1 */
  const stillChapterSecondaryOpacity = useMemo(
    () =>
      stillChapterPrimaryOpacity.map((v) =>
        v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
      ),
    [stillChapterPrimaryOpacity],
  );

  /** フィルムストリップ先頭空き含むウィンドウ先頭行インデックス */
  const scrollIndexRef = useRef(0);
  const prevChapterIndexForNavRef = useRef<number | undefined>(undefined);
  const prevNonverbalPaddingKeyRef = useRef(nonverbalPaddingResetKey);

  const maxStripScrollIndex = useMemo(
    () => getNonverbalMaxStripScrollIndex(NONVERBAL_STRIP_SOURCES.length),
    [],
  );

  // デバイス情報を取得
  const { isTablet, isDeviceLandscape } = useDeviceInfo();

  // セーフエリアインセットを取得
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  /**
   * 動画と同じく videoArea の左右パディング + videoRow の VIDEO_ROW_PADDING を反映した内側幅。
   * 静止画・フィルムストリップもこれに合わせる。
   */
  const videoAreaHorizontalPadding = isTablet ? 16 : 0;
  const videoContentWidth =
    windowWidth - videoAreaHorizontalPadding * 2 - VIDEO_ROW_PADDING_HORIZONTAL * 2;

  /** 動画 View と同じ 16:9 の高さ（画面高に合わせて縮めない） */
  const stillCardHeight = videoContentWidth * (9 / 16);
  const stripRowSlotHeight = stillCardHeight + NONVERBAL_STILL_VERTICAL_GAP;
  const totalStripHeight =
    NONVERBAL_STRIP_SOURCES.length * stillCardHeight +
    (NONVERBAL_STRIP_SOURCES.length - 1) * NONVERBAL_STILL_VERTICAL_GAP;
  /** ストリップ全体の縦中央を画面中央に合わせる（はみ出し可。負の値で上にシフト） */
  const stripCenteringOffset = (windowHeight - totalStripHeight) / 2;

  const nonverbalStillPageIndex = Math.min(
    currentChapterIndex,
    NONVERBAL_CHAPTER_STILL_PAIRS.length - 1,
  );

  const stripRowOpacities = useMemo(
    () =>
      NONVERBAL_STRIP_SOURCES.map((_, i) =>
        createStripRowOpacity(
          stillStripTranslateY,
          i,
          stillCardHeight,
          stripRowSlotHeight,
          stripCenteringOffset,
        ),
      ),
    [stillStripTranslateY, stillCardHeight, stripRowSlotHeight, stripCenteringOffset],
  );

  const setStripTranslateToIndex = (index: number, animated: boolean) => {
    const clamped = Math.max(0, Math.min(index, maxStripScrollIndex));
    scrollIndexRef.current = clamped;
    const y = -clamped * stripRowSlotHeight;
    if (animated) {
      Animated.timing(stillStripTranslateY, {
        toValue: y,
        duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
        useNativeDriver: true,
      }).start();
    } else {
      stillStripTranslateY.setValue(y);
    }
  };

  /** window 高さ変化時は現在 index を維持して即時反映 */
  useEffect(() => {
    setStripTranslateToIndex(scrollIndexRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- strip 寸法・ストライド変化時に translate を再適用するだけ
  }, [stillCardHeight, stripRowSlotHeight, stripCenteringOffset, maxStripScrollIndex]);

  /** 戻る・ジャンプ・リセット時はチャプター/セグメントに同期（次へで連続進行した場合は再生側でスクロール） */
  useEffect(() => {
    const prevCh = prevChapterIndexForNavRef.current;
    const paddingBumped = prevNonverbalPaddingKeyRef.current !== nonverbalPaddingResetKey;
    prevNonverbalPaddingKeyRef.current = nonverbalPaddingResetKey;

    if (paddingBumped) {
      setStripTranslateToIndex(getStripScrollTargetForChapterSegment(currentChapterIndex, 'primary'), false);
      resetStripChapterPrimaryOpacitiesToOne(stillChapterPrimaryOpacity);
      prevChapterIndexForNavRef.current = currentChapterIndex;
      return;
    }

    if (prevCh === undefined) {
      prevChapterIndexForNavRef.current = currentChapterIndex;
      setStripTranslateToIndex(getStripScrollTargetForChapterSegment(currentChapterIndex, 'primary'), false);
      applyStripChapterPrimaryOpacityTargets(stillChapterPrimaryOpacity, currentChapterIndex, 'primary');
      return;
    }

    if (currentChapterIndex !== prevCh) {
      const wentBack = currentChapterIndex < prevCh;
      const forwardJump = currentChapterIndex > prevCh + 1;
      if (wentBack || forwardJump) {
        setStripTranslateToIndex(getStripScrollTargetForChapterSegment(currentChapterIndex, 'primary'), false);
        applyStripChapterPrimaryOpacityTargets(stillChapterPrimaryOpacity, currentChapterIndex, 'primary');
      } else if (currentChapterIndex === prevCh + 1) {
        /** 次章へ（連続）: スクロールは *-01 終了まで維持、静止画は章先頭＝primary に合わせる */
        applyStripChapterPrimaryOpacityTargets(stillChapterPrimaryOpacity, currentChapterIndex, 'primary');
      }
      prevChapterIndexForNavRef.current = currentChapterIndex;
      return;
    }
  }, [currentChapterIndex, nonverbalPaddingResetKey, maxStripScrollIndex]);

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
        const nextScrollIndex = Math.min(scrollIndexRef.current + 1, maxStripScrollIndex);
        const nextY = -nextScrollIndex * stripRowSlotHeight;
        scrollIndexRef.current = nextScrollIndex;
        const ch = currentChapterIndex;
        Animated.parallel([
          Animated.timing(stillStripTranslateY, {
            toValue: nextY,
            duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
            useNativeDriver: true,
          }),
          Animated.timing(stillChapterPrimaryOpacity[ch], {
            toValue: 0,
            duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
            useNativeDriver: true,
          }),
        ]).start();

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
        <Animated.View
          style={{
            marginTop: stripCenteringOffset,
            transform: [{ translateY: stillStripTranslateY }],
          }}
        >
          {NONVERBAL_STRIP_SOURCES.map((src, i) => {
            const stripChapterIndex =
              src != null && i >= 2 && i < 2 + NONVERBAL_STRIP_CHAPTER_COUNT ? i - 2 : null;
            return (
              <Animated.View
                key={i}
                style={{
                  width: '100%',
                  height: stillCardHeight,
                  marginBottom: i < NONVERBAL_STRIP_SOURCES.length - 1 ? NONVERBAL_STILL_VERTICAL_GAP : 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: stripRowOpacities[i],
                }}
              >
                {src == null || stripChapterIndex === null ? (
                  <View style={[styles.nonverbalStripEmptySlot, { width: videoContentWidth }]} />
                ) : (
                  <View style={[styles.videoPlayer, { width: videoContentWidth }]}>
                    <AnimatedStripImage
                      source={NONVERBAL_CHAPTER_STILL_PAIRS[stripChapterIndex].secondary}
                      style={[
                        StyleSheet.absoluteFillObject,
                        styles.video,
                        { opacity: stillChapterSecondaryOpacity[stripChapterIndex] },
                      ]}
                      resizeMode="cover"
                    />
                    <AnimatedStripImage
                      source={NONVERBAL_CHAPTER_STILL_PAIRS[stripChapterIndex].primary}
                      style={[
                        StyleSheet.absoluteFillObject,
                        styles.video,
                        { opacity: stillChapterPrimaryOpacity[stripChapterIndex] },
                      ]}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </Animated.View>
            );
          })}
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
                <View style={[styles.videoPlayer, { width: videoContentWidth }]}>
                  <Image
                    source={NONVERBAL_CHAPTER_STILL_PAIRS[nonverbalStillPageIndex].primary}
                    style={styles.video}
                    resizeMode="cover"
                  />
                </View>
                <View
                  style={[
                    styles.videoPlayer,
                    { marginTop: NONVERBAL_STILL_VERTICAL_GAP, width: videoContentWidth },
                  ]}
                >
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
              <View style={[styles.videoPlayer, { width: videoContentWidth }]}>
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
  nonverbalStripEmptySlot: {
    aspectRatio: 16 / 9,
    backgroundColor: 'transparent',
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
