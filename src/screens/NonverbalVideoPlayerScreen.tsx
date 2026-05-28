import React, { useState, useRef, useEffect } from 'react';
import { Platform, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Video, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Provider as PaperProvider, Snackbar } from 'react-native-paper';
import ConfettiCannon from 'react-native-confetti-cannon';

import { RootStackParamList, Chapter } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import VideoPlayerNonverbalPortrait, { NONVERBAL_PLAY_START_DELAY_MS } from './VideoPlayerNonverbalPortrait';
import VideoPlayerNonverbalLandscape from './VideoPlayerNonverbalLandscape';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { NextChapterButtonRef } from '../components/NextChapterButton';
import { ReplayButtonRef } from '../components/ReplayButton';
import { PreviousChapterButtonRef } from '../components/PreviousChapterButton';
import { RestartButtonRef } from '../components/RestartButton';
import { CHAPTERS_MAP } from '../data/chaptersMap';
import { NONVERBAL_TOTAL_CHAPTERS } from '../data/chapterVideos';
import { getDifficultyPoints, addClearPoints } from '../utils/clearPoints';
import {
  EMPTY_NONVERBAL_SEGMENT_PLAYBACK,
  getNonverbalChapterTotalDurationMs,
  getNonverbalCompositePlaybackPositionMs,
  getNonverbalCurrentChapterProgress,
  type NonverbalSegmentPlayback,
} from '../utils/nonverbalChapterPlayback';

type NonverbalVideoPlayerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NonverbalVideoPlayer'
>;
type NonverbalVideoPlayerScreenRouteProp = RouteProp<
  RootStackParamList,
  'NonverbalVideoPlayer'
>;

interface Props {
  navigation: NonverbalVideoPlayerScreenNavigationProp;
  route: NonverbalVideoPlayerScreenRouteProp;
}

// 再生速度の設定配列
const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const CHAPTER_ACTION_COOLDOWN_MS = 500;

// 再生速度の表示文字列を取得する関数
const getPlaybackRateDisplay = (rate: number): string => {
  if (rate === 2.0) return '2.0';
  if (rate === 1.0) return '1.0';
  if (rate === 1.25) return '1.25';
  if (rate === 0.75) return '0.75';
  return rate.toString();
};

const createPlaceholderChapters = (totalChapters: number): Chapter[] => {
  return Array.from({ length: totalChapters }, () => ({
    subtitle: { ja: '', en: '' },
  }));
};

const NonverbalVideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stringFigure } = route.params;
  const { currentLanguage } = route.params;
  const { isTablet, isDeviceLandscape } = useDeviceInfo();

  // ステート管理
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [nonverbalSegmentPlayback, setNonverbalSegmentPlayback] = useState<NonverbalSegmentPlayback>(
    EMPTY_NONVERBAL_SEGMENT_PLAYBACK,
  );
  const [isLastChapterCompleted, setIsLastChapterCompleted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const videoRef = useRef<Video>(null);
  const nextChapterButtonRef = useRef<NextChapterButtonRef>(null);
  const replayButtonRef = useRef<ReplayButtonRef>(null);
  const previousChapterButtonRef = useRef<PreviousChapterButtonRef>(null);
  const restartButtonRef = useRef<RestartButtonRef>(null);
  const nextChapterLastAcceptedAtRef = useRef(0);
  const replayLastAcceptedAtRef = useRef(0);
  const previousChapterLastAcceptedAtRef = useRef(0);
  const restartFromBeginningLastAcceptedAtRef = useRef(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isTemporarilyDisabled, setIsTemporarilyDisabled] = useState(false);
  const disableTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enableTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [nonverbalPaddingResetKey, setNonverbalPaddingResetKey] = useState(0);

  const [isLandscapeMode, setIsLandscapeMode] = useState(false);

  // 背景色アニメーション用
  const backgroundColorAnimValue = useRef(new Animated.Value(0)).current;

  // リスタートレイヤーアニメーション用
  const restartLayerOpacity = useRef(new Animated.Value(0)).current;

  // 音声認識フック
  const {
    recognizing,
    isSupported: isRecognitionSupported,
    stop: stopRecognition,
    cleanup: cleanupRecognition,
    lastTranscript: lastSpeechTranscript,
  } = useSpeechRecognition({
    language: currentLanguage,
    onKeywordDetected: async (keyword) => {
      // 既存のタイマーをクリア
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
        disableTimerRef.current = null;
      }
      if (enableTimerRef.current) {
        clearTimeout(enableTimerRef.current);
        enableTimerRef.current = null;
      }

      // キーワードに応じたアクションを実行
      if (keyword === 'つぎ' || keyword === 'next') {
        await handleNextChapter();
      } else if (keyword === 'まえ' || keyword === 'previous') {
        await handlePreviousChapter();
      } else if (keyword === 'もういちど' || keyword === 'replay') {
        await handleReplay();
      } else if (keyword === 'はじめから' || keyword === 'restart') {
        await handleRestartFromBeginning();
      } else if (keyword === 'できた' || keyword === 'done') {
        await handleComplete();
      }

      // 400ms後にボタンを無効化
      disableTimerRef.current = setTimeout(() => {
        setIsTemporarilyDisabled(true);
        disableTimerRef.current = null;
      }, 400);

      // 1500ms後に無効化を解除
      enableTimerRef.current = setTimeout(() => {
        setIsTemporarilyDisabled(false);
        enableTimerRef.current = null;
      }, 1500);
    },
    onNetworkError: () => {
      // ネットワークエラー時にSnackbarを表示（iOSでは表示しない）
      if (Platform.OS !== 'ios') {
        setSnackbarVisible(true);
      }
    },
  });

  const loadOrientationSetting = async () => {
    try {
      const savedIsLandscapeMode = await AsyncStorage.getItem('isLandscapeMode');
      if (savedIsLandscapeMode === 'true') {
        setIsLandscapeMode(true);
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      } else {
        setIsLandscapeMode(false);
      }
    } catch (error) {
      console.error('画面向き設定の読み込みに失敗しました:', error);
    }
  };

  // 初期化
  useEffect(() => {
    console.log('stringFigure.directory', stringFigure.directory);
    loadChapters();
    loadBookmarkedIds();

    if (!isTablet) {
      void loadOrientationSetting();
    } else {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }

    // 画面スリープを防止
    activateKeepAwakeAsync();

    // クリーンアップ
    return () => {
      if (!isTablet) {
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
      deactivateKeepAwake();
      if (disableTimerRef.current) {
        clearTimeout(disableTimerRef.current);
      }
      if (enableTimerRef.current) {
        clearTimeout(enableTimerRef.current);
      }
    };
  }, []);

  const loadChapters = () => {
    try {
      if (stringFigure.nonverbalFormat) {
        const totalChapters = NONVERBAL_TOTAL_CHAPTERS[stringFigure.directory];
        if (typeof totalChapters === 'number' && totalChapters > 0) {
          setChapters(createPlaceholderChapters(totalChapters));
          return;
        }
      }

      const chaptersData = CHAPTERS_MAP[stringFigure.directory];
      if (chaptersData) {
        setChapters(chaptersData);
      }
    } catch (error) {
      console.error('チャプターの読み込みに失敗しました:', error);
    }
  };

  const loadBookmarkedIds = async () => {
    try {
      const savedBookmarkedIds = await AsyncStorage.getItem('bookmarkedIds');
      if (savedBookmarkedIds) {
        setBookmarkedIds(JSON.parse(savedBookmarkedIds));
      }
    } catch (error) {
      console.error('ブックマーク設定の読み込みに失敗しました:', error);
    }
  };

  // ブックマークの切り替え処理
  const handleToggleBookmark = async () => {
    try {
      const isCurrentlyBookmarked = bookmarkedIds.includes(stringFigure.id);
      let newBookmarkedIds: string[];

      if (isCurrentlyBookmarked) {
        newBookmarkedIds = bookmarkedIds.filter(id => id !== stringFigure.id);
      } else {
        newBookmarkedIds = [...bookmarkedIds, stringFigure.id];
      }

      setBookmarkedIds(newBookmarkedIds);
      await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(newBookmarkedIds));
    } catch (error) {
      console.error('ブックマークの更新に失敗しました:', error);
    }
  };

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // 今日の日付をYYYY-MM-DD形式で取得するヘルパー関数
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const resetNonverbalSegmentPlayback = () => {
    setNonverbalSegmentPlayback(EMPTY_NONVERBAL_SEGMENT_PLAYBACK);
    setPlaybackPosition(0);
    setVideoDuration(0);
  };

  const handleNonverbalSegmentPlaybackUpdate = (update: Partial<NonverbalSegmentPlayback>) => {
    setNonverbalSegmentPlayback((prev) => {
      const next = { ...prev, ...update };
      const total = getNonverbalChapterTotalDurationMs(
        next.primaryDurationMs,
        next.secondaryDurationMs,
      );
      setPlaybackPosition(getNonverbalCompositePlaybackPositionMs(next));
      if (total > 0) {
        setVideoDuration(total);
      }
      return next;
    });
  };

  // 単一動画フォールバック用（非言語デュアル再生では segment 更新のみ使う）
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    if (stringFigure?.nonverbalFormat) {
      if (status.didJustFinish && currentChapterIndex === chapters.length - 1) {
        setIsLastChapterCompleted(true);
      }
      return;
    }

    const fallback: NonverbalSegmentPlayback = {
      primaryDurationMs: status.durationMillis || 0,
      primaryPlaybackPositionMs: status.positionMillis || 0,
      secondaryDurationMs: 0,
      secondaryPlaybackPositionMs: 0,
    };
    setNonverbalSegmentPlayback(fallback);
    setPlaybackPosition(status.positionMillis || 0);
    setVideoDuration(status.durationMillis || 0);

    if (status.didJustFinish && currentChapterIndex === chapters.length - 1) {
      setIsLastChapterCompleted(true);
    }
  };

  useEffect(() => {
    resetNonverbalSegmentPlayback();
  }, [currentChapterIndex]);

  // 動画がロードされた時の処理
  const handleVideoLoad = async () => {
    resetNonverbalSegmentPlayback();
    setIsLastChapterCompleted(false);

    if (shouldAutoPlay && videoRef.current) {
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, NONVERBAL_PLAY_START_DELAY_MS));
        await videoRef.current.setPositionAsync(0);
        await videoRef.current.playAsync();
        setShouldAutoPlay(false);
      } catch (error) {
        console.error('Error auto-playing video:', error);
      }
    }
  };

  // つぎへボタンの処理（playbackPosition はデュアル動画の合成位置）
  const handleNextChapter = async () => {
    if (!videoRef.current) return;
    const now = Date.now();
    if (now - nextChapterLastAcceptedAtRef.current < CHAPTER_ACTION_COOLDOWN_MS) {
      return;
    }
    nextChapterLastAcceptedAtRef.current = now;

    try {
      if (
        currentChapterIndex === 0 &&
        getNonverbalCompositePlaybackPositionMs(nonverbalSegmentPlayback) === 0
      ) {
        await new Promise<void>((resolve) => setTimeout(resolve, NONVERBAL_PLAY_START_DELAY_MS));
        await videoRef.current.playAsync();
        nextChapterButtonRef.current?.triggerRipple();
      } else if (currentChapterIndex < chapters.length - 1) {
        setShouldAutoPlay(true);
        setCurrentChapterIndex(prev => prev + 1);
        resetNonverbalSegmentPlayback();
        nextChapterButtonRef.current?.triggerRipple();
      }
    } catch (error) {
      console.error('Error handling next chapter:', error);
    }
  };

  const handleGoBack = async () => {
    if (recognizing) {
      await stopRecognition();
    }
    cleanupRecognition();
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('画面向きの設定に失敗しました:', error);
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  // もういちどボタンの処理（前半・後半とも 0 に戻して前半から再生）
  const handleReplay = async () => {
    if (!videoRef.current) return;
    const now = Date.now();
    if (now - replayLastAcceptedAtRef.current < CHAPTER_ACTION_COOLDOWN_MS) {
      return;
    }
    replayLastAcceptedAtRef.current = now;

    try {
      setNonverbalPaddingResetKey((k) => k + 1);
      resetNonverbalSegmentPlayback();
      await new Promise<void>((resolve) => setTimeout(resolve, NONVERBAL_PLAY_START_DELAY_MS));
      await videoRef.current.setPositionAsync(0);
      await videoRef.current.playAsync();
      replayButtonRef.current?.triggerRipple();
    } catch (error) {
      console.error('Error replaying video:', error);
    }
  };

  // まえボタンの処理
  const handlePreviousChapter = async () => {
    if (!videoRef.current || currentChapterIndex === 0) return;
    const now = Date.now();
    if (now - previousChapterLastAcceptedAtRef.current < CHAPTER_ACTION_COOLDOWN_MS) {
      return;
    }
    previousChapterLastAcceptedAtRef.current = now;

    try {
      if (currentChapterIndex > 0) {
        setShouldAutoPlay(true);
        setCurrentChapterIndex(prev => prev - 1);
        resetNonverbalSegmentPlayback();
        previousChapterButtonRef.current?.triggerRipple();
      }
    } catch (error) {
      console.error('Error handling previous chapter:', error);
    }
  };

  // はじめからボタンの処理
  const handleRestartFromBeginning = async () => {
    const now = Date.now();
    if (now - restartFromBeginningLastAcceptedAtRef.current < CHAPTER_ACTION_COOLDOWN_MS) {
      return;
    }
    restartFromBeginningLastAcceptedAtRef.current = now;

    try {
      setNonverbalPaddingResetKey((k) => k + 1);
      setShouldAutoPlay(false);
      setCurrentChapterIndex(0);
      resetNonverbalSegmentPlayback();
      setIsLastChapterCompleted(false);

      restartLayerOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(restartLayerOpacity, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(restartLayerOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error restarting from beginning:', error);
    }
  };

  // できた!ボタンの処理
  const handleComplete = async () => {
    if (isLastChapterCompleted !== true) return;

    try {
      const savedCompleteDates = await AsyncStorage.getItem('completeDates');
      let completeDates: Array<{ id: string; dates: string[] }> = [];

      if (savedCompleteDates) {
        completeDates = JSON.parse(savedCompleteDates);
      }

      const todayDateString = getTodayDateString();

      const existingEntryIndex = completeDates.findIndex(entry => entry.id === stringFigure.id);

      if (existingEntryIndex === -1) {
        completeDates.push({
          id: stringFigure.id,
          dates: [todayDateString],
        });
        const points = getDifficultyPoints(stringFigure.difficulty);
        if (points > 0) {
          addClearPoints(points).catch(error => {
            console.error('クリアポイントの加算に失敗しました:', error);
          });
        }
      } else {
        const existingEntry = completeDates[existingEntryIndex];
        if (!existingEntry.dates.includes(todayDateString)) {
          existingEntry.dates.push(todayDateString);
          completeDates[existingEntryIndex] = existingEntry;
          const points = getDifficultyPoints(stringFigure.difficulty);
          if (points > 0) {
            addClearPoints(points).catch(error => {
              console.error('クリアポイントの加算に失敗しました:', error);
            });
          }
        }
      }

      await AsyncStorage.setItem('completeDates', JSON.stringify(completeDates));
    } catch (error) {
      console.error('完了日付の保存に失敗しました:', error);
    }

    Animated.timing(backgroundColorAnimValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(backgroundColorAnimValue, {
        toValue: 0,
        duration: 1600,
        useNativeDriver: false,
      }).start();
    });

    setConfettiKey(prev => prev + 1);
  };

  // 進捗計算のヘルパー関数
  const getChapterProgress = (chapterIndex: number) => {
    if (chapterIndex < currentChapterIndex) {
      return 1;
    } else if (chapterIndex === currentChapterIndex) {
      return getNonverbalCurrentChapterProgress(nonverbalSegmentPlayback);
    } else {
      return 0;
    }
  };

  const handleLandscapeToggle = async () => {
    if (isTablet) return;

    try {
      const newIsLandscapeMode = !isLandscapeMode;
      setIsLandscapeMode(newIsLandscapeMode);
      await AsyncStorage.setItem('isLandscapeMode', JSON.stringify(newIsLandscapeMode));

      if (newIsLandscapeMode) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    } catch (error) {
      console.error('AsyncStorageへのisLandscape保存に失敗:', error);
    }
  };

  const shouldUseNonverbalLandscape = !isTablet && isDeviceLandscape;

  // 背景色のアニメーション値を計算
  const backgroundColorAnim = backgroundColorAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F7F5F2', '#FF8904'],
  });

  const sharedProps = {
    stringFigure,
    chapters,
    currentChapterIndex,
    shouldAutoPlay,
    currentLanguage,
    playbackPosition,
    videoDuration,
    nonverbalSegmentPlayback,
    onNonverbalSegmentPlaybackUpdate: handleNonverbalSegmentPlaybackUpdate,
    isLastChapterCompleted,
    playbackRate,
    videoRef,
    nextChapterButtonRef,
    replayButtonRef,
    previousChapterButtonRef,
    restartButtonRef,
    isLandscapeMode,
    PLAYBACK_RATES,
    recognizing,
    isRecognitionSupported,
    bookmarked: bookmarkedIds.includes(stringFigure.id),
    onPlaybackStatusUpdate: handlePlaybackStatusUpdate,
    onVideoLoad: handleVideoLoad,
    onNextChapter: handleNextChapter,
    onComplete: handleComplete,
    onGoBack: handleGoBack,
    onReplay: handleReplay,
    onPreviousChapter: handlePreviousChapter,
    onRestartFromBeginning: handleRestartFromBeginning,
    onLandscapeToggle: handleLandscapeToggle,
    onToggleBookmark: handleToggleBookmark,
    getPlaybackRateDisplay,
    getLocalizedText,
    getChapterProgress,
    isTemporarilyDisabled,
    backgroundColorAnim,
    lastSpeechTranscript,
    nonverbalPaddingResetKey,
  };

  // ネットワークエラーメッセージ
  const networkErrorMessage = getLocalizedText({
    ja: 'ネットワーク接続がありません。音声認識機能を使用できません。',
    en: 'No network connection. Speech recognition is unavailable.',
  });

  // 画面サイズを取得（紙吹雪の発射位置を計算するため）
  const screenWidth = Dimensions.get('window').width;

  return (
    <PaperProvider>
      {shouldUseNonverbalLandscape ? (
        <VideoPlayerNonverbalLandscape {...sharedProps} />
      ) : (
        <VideoPlayerNonverbalPortrait {...sharedProps} />
      )}
      {confettiKey > 0 && (
        <ConfettiCannon
          key={confettiKey}
          count={80}
          origin={{ x: screenWidth / 2, y: 0 }}
          explosionSpeed={350}
          fallSpeed={5000}
          fadeOut={true}
          autoStart={true}
        />
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ position: 'absolute', top: -200, left: 0, right: 0 }}
      >
        {networkErrorMessage}
      </Snackbar>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f5f5f4',
          opacity: restartLayerOpacity,
          pointerEvents: 'none',
        }}
      />
    </PaperProvider>
  );
};

export default NonverbalVideoPlayerScreen;
