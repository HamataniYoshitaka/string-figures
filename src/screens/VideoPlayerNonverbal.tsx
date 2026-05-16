import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
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
import LandScapeIcon from '../components/icons/LandScape';
import ChapterNavigationBarNonverbal from '../components/ChapterNavigationBarNonverbal';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import {
  CHAPTER_VIDEOS,
  NONVERBAL_CHAPTER_STILL_PAIRS,
  NONVERBAL_CHAPTER_VIDEO_PAIRS,
} from '../data/chapterVideos';

/** 上下行で共通の左右パディング（旧アニメーション廃止後の固定値） */
const VIDEO_ROW_PADDING_HORIZONTAL = 8;

/** チャプター切り替え時の静止画帯スクロール時間（1Pぶん）。前半終了後のスクロールもこの長さで完了する */
const NONVERBAL_STILL_STRIP_SCROLL_MS = 500;

/** 前半終了直後からストリップ縦スクロール（クロスフェード）を始めるまでの待機 */
const NONVERBAL_STRIP_SCROLL_AFTER_PRIMARY_END_DELAY_MS = 500;

/** 再生指示から実際の再生開始まで（NonverbalVideoPlayerScreen の play 遅延と同値） */
export const NONVERBAL_PLAY_START_DELAY_MS = 500;

/** 前半終了から後半（*-2）の Video をマウントしてロードを開始するまでの遅延 */
const NONVERBAL_SECONDARY_MOUNT_DELAY_MS = 300;

/** 前半終了から後半をフェードイン開始するまでの時間（この時点まで opacity は 0） */
const NONVERBAL_SECONDARY_FADE_IN_START_MS = 1200;

/** 後半フェードイン開始から再生開始までの追加遅延 */
const NONVERBAL_SECONDARY_PLAY_DELAY_MS = 500;

/** 前半終了から後半の playAsync まで（= FADE_IN_START + PLAY_DELAY） */
const NONVERBAL_SECONDARY_PLAY_START_MS =
  NONVERBAL_SECONDARY_FADE_IN_START_MS + NONVERBAL_SECONDARY_PLAY_DELAY_MS;

/** 縦並び2枚のあいだ（フィルムストリップ行間の固定 16pt と揃える） */
const NONVERBAL_STILL_VERTICAL_GAP = 16;

/** 動画レイヤーの不透明度 0↔1 のフェード時間（前半終了〜0、1.2s〜1 のフェードに使用） */
const NONVERBAL_VIDEO_LAYER_OPACITY_MS = 300;

type NonverbalStripSource = number | null | 'leadingPreview';

/**
 * ストリップ各行: null=空行、number=静止画スロットインデックス（0..スロット数-1）、leadingPreview=先頭プレビュー行。
 * 先頭空1 + 先頭プレビュー1 + 全スロット行 + 末尾空2。
 * スロット数は NONVERBAL_CHAPTER_STILL_PAIRS[directory].length（再生章数 + 末尾プレビュー1）。
 */
function buildNonverbalStripSources(stripSlotCount: number): readonly NonverbalStripSource[] {
  if (stripSlotCount <= 0) {
    return [null, null, null, null];
  }
  return [null, 'leadingPreview', ...Array.from({ length: stripSlotCount }, (_, i) => i), null, null];
}

/** visible 4行ウィンドウの先頭インデックスに対応する translateY=-index*stripRowSlotHeight の最大 index */
function getNonverbalMaxStripScrollIndex(stripLength: number): number {
  return Math.max(0, stripLength - 4);
}

/** *-01 終了のたびにストリップが +1 する前提でのナビ同期用インデックス */
function getStripScrollTargetForChapterSegment(chapterIndex: number, segment: 'primary' | 'secondary'): number {
  return chapterIndex + (segment === 'secondary' ? 1 : 0);
}

/**
 * 可視4行のうち上1・下1は不透明に近づけ、中央2行は 1（translateY に同期して滑らかに変化）
 * vp = rowIndex + translateY/rowSlotHeight が 0→1→2→3 と動く境界で線形フェード
 */
function createStripRowOpacityFromTranslateY(
  translateY: Animated.Value,
  rowIndex: number,
  rowSlotHeight: number,
): Animated.AnimatedInterpolation<number> {
  const S = rowSlotHeight;
  const t0 = -rowIndex * S;
  const t1 = -(rowIndex - 1) * S;
  const t2 = -(rowIndex - 2) * S;
  const t3 = -(rowIndex - 3) * S;
  const pad = 100000;
  return translateY.interpolate({
    inputRange: [-pad, t0, t1, t2, t3, pad],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });
}

const AnimatedStripImage = Animated.createAnimatedComponent(Image);

function applyStripChapterSecondaryOpacityTargets(
  values: Animated.Value[],
  chapterIndex: number,
  segment: 'primary' | 'secondary',
  stripSlotCount: number,
) {
  for (let c = 0; c < stripSlotCount; c++) {
    const target =
      c < chapterIndex || (c === chapterIndex && segment === 'secondary') ? 1 : 0;
    values[c].setValue(target);
  }
}

function resetStripChapterSecondaryOpacitiesToZero(values: Animated.Value[], stripSlotCount: number) {
  for (let c = 0; c < stripSlotCount; c++) {
    values[c].setValue(0);
  }
}

/** スロット3＝次章 standby、スロット2＝前半中は次章 standby／ブリッジでは次々章 standby（表 A/B/C） */
function getStripChapterStandbyOpacityTargets(
  chapterIndex: number,
  segment: 'primary' | 'secondary',
  stripSlotCount: number,
): number[] {
  return Array.from({ length: stripSlotCount }, (_, c) => {
    if (segment === 'primary') {
      return c === chapterIndex + 1 && c < stripSlotCount ? 1 : 0;
    }
    if (c < stripSlotCount && (c === chapterIndex + 1 || c === chapterIndex + 2)) {
      return 1;
    }
    return 0;
  });
}

function applyStripChapterStandbyOpacityTargets(
  values: Animated.Value[],
  chapterIndex: number,
  segment: 'primary' | 'secondary',
  stripSlotCount: number,
) {
  const targets = getStripChapterStandbyOpacityTargets(chapterIndex, segment, stripSlotCount);
  for (let c = 0; c < stripSlotCount; c++) {
    values[c].setValue(targets[c]);
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
  const nonverbalFigureDirectory = stringFigure?.directory ?? '';
  const nonverbalChapterStillPairs = useMemo(
    () => NONVERBAL_CHAPTER_STILL_PAIRS[nonverbalFigureDirectory] ?? [],
    [nonverbalFigureDirectory],
  );
  const nonverbalStripSlotCount = nonverbalChapterStillPairs.length;
  const nonverbalLeadingPreviewSource =
    nonverbalChapterStillPairs[nonverbalStripSlotCount - 1]?.secondary ?? null;
  const nonverbalStripSources = useMemo(
    () => buildNonverbalStripSources(nonverbalStripSlotCount),
    [nonverbalStripSlotCount],
  );

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
  /** 動画プレイヤー枠: 前半終了後 0.3s で 0 → 1.2s でフェードイン → 1.5s で opacity 1、再生は +0.5s */
  const videoLayerOpacity = useRef(new Animated.Value(1)).current;
  const fadeVideoLayerOpacityTo = (toValue: number) => {
    Animated.timing(videoLayerOpacity, {
      toValue,
      duration: NONVERBAL_VIDEO_LAYER_OPACITY_MS,
      useNativeDriver: true,
    }).start();
  };
  /** 各チャプター行の *-02（上層）の不透明度。primary は常に 1 のまま、ここだけ 0→1 で重ねる */
  const stillChapterSecondaryOpacity = useMemo(
    () => Array.from({ length: nonverbalStripSlotCount }, () => new Animated.Value(0)),
    [nonverbalFigureDirectory, nonverbalStripSlotCount],
  );
  /** スタンバイ静止画（最上層）。可視スロット2・3だけで primary/secondary と切り替え */
  const stillChapterStandbyOpacity = useMemo(
    () => Array.from({ length: nonverbalStripSlotCount }, () => new Animated.Value(0)),
    [nonverbalFigureDirectory, nonverbalStripSlotCount],
  );

  /** フィルムストリップ先頭空き含むウィンドウ先頭行インデックス */
  const scrollIndexRef = useRef(0);
  const prevChapterIndexForNavRef = useRef<number | undefined>(undefined);
  const prevNonverbalPaddingKeyRef = useRef(nonverbalPaddingResetKey);
  /** 前半終了から後半レイヤーをフェードインするタイマー */
  const secondaryFadeInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 前半終了から後半 playAsync するタイマー */
  const secondaryPlayDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 前半終了から後半マウントまでの遅延用 */
  const secondaryMountAfterPrimaryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 前半が終了した時刻（epoch ms）。後半の固定タイムラインに使用 */
  const primarySegmentEndedAtRef = useRef<number | null>(null);
  const stripScrollAfterPrimaryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSecondaryPlayDelayTimeout = () => {
    if (secondaryFadeInTimeoutRef.current != null) {
      clearTimeout(secondaryFadeInTimeoutRef.current);
      secondaryFadeInTimeoutRef.current = null;
    }
    if (secondaryPlayDelayTimeoutRef.current != null) {
      clearTimeout(secondaryPlayDelayTimeoutRef.current);
      secondaryPlayDelayTimeoutRef.current = null;
    }
    if (secondaryMountAfterPrimaryTimeoutRef.current != null) {
      clearTimeout(secondaryMountAfterPrimaryTimeoutRef.current);
      secondaryMountAfterPrimaryTimeoutRef.current = null;
    }
  };

  const clearStripScrollAfterPrimaryTimeout = () => {
    if (stripScrollAfterPrimaryTimeoutRef.current != null) {
      clearTimeout(stripScrollAfterPrimaryTimeoutRef.current);
      stripScrollAfterPrimaryTimeoutRef.current = null;
    }
  };

  const maxStripScrollIndex = useMemo(
    () => getNonverbalMaxStripScrollIndex(nonverbalStripSources.length),
    [nonverbalStripSources.length],
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
  /** 可視4行（＋行間3つ）の高さ。ストリップ全体ではなくこの帯の中央を画面中央に合わせる */
  const visibleFourStripRowsHeight =
    4 * stillCardHeight + 3 * NONVERBAL_STILL_VERTICAL_GAP;
  const stripCenteringOffset = windowHeight / 2 - visibleFourStripRowsHeight / 2;
  /** 動画上端: 画面中央 + 8pt（端末共通。親は画面いっぱいの Animated.View） */
  const videoTopFromScreenTop = windowHeight / 2 + 8;

  const stripRowOpacities = useMemo(
    () =>
      nonverbalStripSources.map((_, i) =>
        createStripRowOpacityFromTranslateY(stillStripTranslateY, i, stripRowSlotHeight),
      ),
    [stillStripTranslateY, stripRowSlotHeight, nonverbalStripSlotCount],
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

  /** チャプター移動（戻る/次へ/ジャンプ）・リセット時はチャプター先頭（primary）に即時同期 */
  useEffect(() => {
    const prevCh = prevChapterIndexForNavRef.current;
    const paddingBumped = prevNonverbalPaddingKeyRef.current !== nonverbalPaddingResetKey;
    prevNonverbalPaddingKeyRef.current = nonverbalPaddingResetKey;

    if (paddingBumped) {
      setStripTranslateToIndex(getStripScrollTargetForChapterSegment(currentChapterIndex, 'primary'), false);
      resetStripChapterSecondaryOpacitiesToZero(stillChapterSecondaryOpacity, nonverbalStripSlotCount);
      applyStripChapterStandbyOpacityTargets(
        stillChapterStandbyOpacity,
        currentChapterIndex,
        'primary',
        nonverbalStripSlotCount,
      );
      prevChapterIndexForNavRef.current = currentChapterIndex;
      return;
    }

    if (prevCh === undefined) {
      prevChapterIndexForNavRef.current = currentChapterIndex;
      setStripTranslateToIndex(getStripScrollTargetForChapterSegment(currentChapterIndex, 'primary'), false);
      applyStripChapterSecondaryOpacityTargets(
        stillChapterSecondaryOpacity,
        currentChapterIndex,
        'primary',
        nonverbalStripSlotCount,
      );
      applyStripChapterStandbyOpacityTargets(
        stillChapterStandbyOpacity,
        currentChapterIndex,
        'primary',
        nonverbalStripSlotCount,
      );
      return;
    }

    if (currentChapterIndex !== prevCh) {
      setStripTranslateToIndex(getStripScrollTargetForChapterSegment(currentChapterIndex, 'primary'), false);
      applyStripChapterSecondaryOpacityTargets(
        stillChapterSecondaryOpacity,
        currentChapterIndex,
        'primary',
        nonverbalStripSlotCount,
      );
      applyStripChapterStandbyOpacityTargets(
        stillChapterStandbyOpacity,
        currentChapterIndex,
        'primary',
        nonverbalStripSlotCount,
      );
      prevChapterIndexForNavRef.current = currentChapterIndex;
      return;
    }
  }, [currentChapterIndex, nonverbalPaddingResetKey, maxStripScrollIndex, nonverbalStripSlotCount]);

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
    clearSecondaryPlayDelayTimeout();
    clearStripScrollAfterPrimaryTimeout();
    primarySegmentEndedAtRef.current = null;
    videoLayerOpacity.setValue(1);
    segmentPhaseRef.current = 'idle';
    primaryDurationMsRef.current = 0;
    secondaryDurationMsRef.current = 0;
    activeSegmentRef.current = 'primary';
    setActiveSegment('primary');
  }, [currentChapterIndex]);

  useEffect(() => {
    if (!nonverbalPaddingResetKey) return;
    clearSecondaryPlayDelayTimeout();
    clearStripScrollAfterPrimaryTimeout();
    primarySegmentEndedAtRef.current = null;
    videoLayerOpacity.setValue(1);
    segmentPhaseRef.current = 'idle';
    activeSegmentRef.current = 'primary';
    setActiveSegment('primary');
  }, [nonverbalPaddingResetKey]);

  useEffect(() => () => {
    clearSecondaryPlayDelayTimeout();
    clearStripScrollAfterPrimaryTimeout();
  }, []);

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
      clearSecondaryPlayDelayTimeout();
      clearStripScrollAfterPrimaryTimeout();
      primarySegmentEndedAtRef.current = null;
      fadeVideoLayerOpacityTo(1);
      void onVideoLoad();
    } else {
      const startedAt = primarySegmentEndedAtRef.current;
      if (startedAt != null && Date.now() >= startedAt + NONVERBAL_SECONDARY_PLAY_START_MS) {
        void (async () => {
          try {
            await videoRef.current?.playAsync();
          } catch {
            /* noop */
          }
        })();
      }
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
        clearSecondaryPlayDelayTimeout();
        primarySegmentEndedAtRef.current = Date.now();
        fadeVideoLayerOpacityTo(0);
        secondaryMountAfterPrimaryTimeoutRef.current = setTimeout(() => {
          secondaryMountAfterPrimaryTimeoutRef.current = null;
          activeSegmentRef.current = 'secondary';
          setActiveSegment('secondary');
        }, NONVERBAL_SECONDARY_MOUNT_DELAY_MS);
        secondaryFadeInTimeoutRef.current = setTimeout(() => {
          secondaryFadeInTimeoutRef.current = null;
          fadeVideoLayerOpacityTo(1);
        }, NONVERBAL_SECONDARY_FADE_IN_START_MS);
        secondaryPlayDelayTimeoutRef.current = setTimeout(() => {
          secondaryPlayDelayTimeoutRef.current = null;
          void (async () => {
            try {
              await videoRef.current?.playAsync();
            } catch {
              /* noop */
            }
          })();
        }, NONVERBAL_SECONDARY_PLAY_START_MS);
        const nextScrollIndex = Math.min(scrollIndexRef.current + 1, maxStripScrollIndex);
        const nextY = -nextScrollIndex * stripRowSlotHeight;
        scrollIndexRef.current = nextScrollIndex;
        const ch = currentChapterIndex;
        clearStripScrollAfterPrimaryTimeout();
        stripScrollAfterPrimaryTimeoutRef.current = setTimeout(() => {
          stripScrollAfterPrimaryTimeoutRef.current = null;
          if (nonverbalStripSlotCount <= 0) {
            Animated.timing(stillStripTranslateY, {
              toValue: nextY,
              duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
              useNativeDriver: true,
            }).start();
            return;
          }
          const standbyTargets = getStripChapterStandbyOpacityTargets(ch, 'secondary', nonverbalStripSlotCount);
          const secondaryLayer = stillChapterSecondaryOpacity[ch];
          if (!secondaryLayer) {
            Animated.timing(stillStripTranslateY, {
              toValue: nextY,
              duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
              useNativeDriver: true,
            }).start();
            return;
          }
          Animated.parallel([
            Animated.timing(stillStripTranslateY, {
              toValue: nextY,
              duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
              useNativeDriver: true,
            }),
            Animated.timing(secondaryLayer, {
              toValue: 1,
              duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
              useNativeDriver: true,
            }),
            ...stillChapterStandbyOpacity.map((v, c) =>
              Animated.timing(v, {
                toValue: standbyTargets[c],
                duration: NONVERBAL_STILL_STRIP_SCROLL_MS,
                useNativeDriver: true,
              }),
            ),
          ]).start();
        }, NONVERBAL_STRIP_SCROLL_AFTER_PRIMARY_END_DELAY_MS);

        segmentPhaseRef.current = 'secondary';
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
                <CloseIcon width={28} height={28} fillColor="#000000" />
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
                    fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold',
                  },
                ]}
              >
                {getLocalizedText({ ja: stringFigure.name.ja, en: stringFigure.name.en })}
              </Text>
            </Pressable>
          </View>
          <View
            style={styles.landscapeButtonPlaceholder}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <LandScapeIcon width={24} height={24} fillColor="#79716B" />
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
          {nonverbalStripSources.map((src, i) => {
            const stripChapterIndex = typeof src === 'number' ? src : null;
            const isLeadingPreview = src === 'leadingPreview';
            let stripSlotContent: React.ReactNode;

            if (stripChapterIndex === null && !isLeadingPreview) {
              stripSlotContent = (
                <View style={[styles.nonverbalStripEmptySlot, { width: videoContentWidth }]} />
              );
            } else if (isLeadingPreview) {
              stripSlotContent = (
                <View style={[styles.videoPlayer, { width: videoContentWidth }]}>
                  {nonverbalLeadingPreviewSource ? (
                    <AnimatedStripImage
                      source={nonverbalLeadingPreviewSource}
                      style={[StyleSheet.absoluteFillObject, styles.video]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.nonverbalStripEmptySlot, { width: videoContentWidth }]} />
                  )}
                </View>
              );
            } else {
              const chapterIndex = stripChapterIndex as number;
              stripSlotContent = (
                <View style={[styles.videoPlayer, { width: videoContentWidth }]}>
                  <AnimatedStripImage
                    source={nonverbalChapterStillPairs[chapterIndex].primary}
                    style={[StyleSheet.absoluteFillObject, styles.video]}
                    resizeMode="cover"
                  />
                  <AnimatedStripImage
                    source={nonverbalChapterStillPairs[chapterIndex].secondary}
                    style={[
                      StyleSheet.absoluteFillObject,
                      styles.video,
                      { opacity: stillChapterSecondaryOpacity[chapterIndex] },
                    ]}
                    resizeMode="cover"
                  />
                  <AnimatedStripImage
                    source={nonverbalChapterStillPairs[chapterIndex].standby}
                    style={[
                      StyleSheet.absoluteFillObject,
                      styles.video,
                      { opacity: stillChapterStandbyOpacity[chapterIndex] },
                    ]}
                    resizeMode="cover"
                  />
                </View>
              );
            }

            return (
              <Animated.View
                key={i}
                style={{
                  width: '100%',
                  height: stillCardHeight,
                  marginBottom: i < nonverbalStripSources.length - 1 ? NONVERBAL_STILL_VERTICAL_GAP : 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: stripRowOpacities[i],
                }}
              >
                {stripSlotContent}
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
      <SafeAreaView
        pointerEvents="box-none"
        style={[
          styles.container,
          { paddingBottom: containerPaddingBottom, backgroundColor: 'transparent', zIndex: 2 },
        ]}
      >
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
              <CloseIcon width={28} height={28} fillColor="#000000" />
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
                  fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold',
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

        <View
          style={styles.landscapeButtonPlaceholder}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <LandScapeIcon width={24} height={24} fillColor="#79716B" />
        </View>

        <View style={styles.videoCenterSpacer} pointerEvents="none" />

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

      <View
        pointerEvents="box-none"
        style={[
          styles.videoAbsoluteLayer,
          {
            top: videoTopFromScreenTop,
            zIndex: 1,
            ...(isTablet &&
              isDeviceLandscape && {
                maxHeight: windowHeight * 0.63,
              }),
          },
        ]}
      >
        <View
          style={[
            styles.videoRow,
            { paddingHorizontal: VIDEO_ROW_PADDING_HORIZONTAL },
          ]}
        >
          <Animated.View
            style={[styles.videoPlayer, { width: videoContentWidth, opacity: videoLayerOpacity }]}
            // Android: Video 子要素と opacity アニメーションの合成で黒一色になるのを避ける（Surface のアルファ扱い）
            needsOffscreenAlphaCompositing={Platform.OS === 'android'}
            renderToHardwareTextureAndroid={Platform.OS === 'android'}
          >
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
          </Animated.View>
        </View>
      </View>
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
  /** Close 直下（機能は未配線）。ヘッダー行の閉じるボタン高さに合わせた top */
  landscapeButtonPlaceholder: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'android' ? 68 : 52,
    padding: 8,
    borderRadius: 20,
    zIndex: 3,
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
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  bookmarkButton: {
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  titlePressable: {
    flex: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'LineSeed-Bold',
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
  videoCenterSpacer: {
    flex: 1,
  },
  videoAbsoluteLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  videoRow: {
    minHeight: 0,
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
