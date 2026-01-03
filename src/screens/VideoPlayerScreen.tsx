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
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import VideoPlayerLandscape from './VideoPlayerLandscape';
import VideoPlayerPortrait from './VideoPlayerPortrait';
import { NextChapterButtonRef } from '../components/NextChapterButton';
import { ReplayButtonRef } from '../components/ReplayButton';
import { PreviousChapterButtonRef } from '../components/PreviousChapterButton';
import { RestartButtonRef } from '../components/RestartButton';
import { CHAPTERS_MAP } from '../data/chaptersMap';
import { getDifficultyPoints, addClearPoints } from '../utils/clearPoints';

type VideoPlayerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VideoPlayer'
>;
type VideoPlayerScreenRouteProp = RouteProp<RootStackParamList, 'VideoPlayer'>;

interface Props {
  navigation: VideoPlayerScreenNavigationProp;
  route: VideoPlayerScreenRouteProp;
}

// 再生速度の設定配列
const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

// 再生速度の表示文字列を取得する関数
const getPlaybackRateDisplay = (rate: number): string => {
  if (rate === 2.0) return '2.0';
  if (rate === 1.0) return '1.0';
  if (rate === 1.25) return '1.25';
  if (rate === 0.75) return '0.75';
  return rate.toString();
};

export interface VideoPlayerSharedProps {
  stringFigure: any;
  chapters: Chapter[];
  currentChapterIndex: number;
  shouldAutoPlay: boolean;
  currentLanguage: 'ja' | 'en';
  playbackPosition: number;
  videoDuration: number;
  isLastChapterCompleted: boolean;
  playbackRate: number;
  videoRef: React.RefObject<Video | null>;
  nextChapterButtonRef: React.RefObject<NextChapterButtonRef | null>;
  replayButtonRef: React.RefObject<ReplayButtonRef | null>;
  previousChapterButtonRef: React.RefObject<PreviousChapterButtonRef | null>;
  restartButtonRef: React.RefObject<RestartButtonRef | null>;
  isLandscapeMode: boolean;
  PLAYBACK_RATES: number[];
  recognizing: boolean;
  isRecognitionSupported: boolean;
  bookmarked: boolean;
  onPlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
  onVideoLoad: () => Promise<void>;
  onNextChapter: () => Promise<void>;
  onComplete: () => void;
  onGoBack: () => void;
  onReplay: () => Promise<void>;
  onPreviousChapter: () => Promise<void>;
  onRestartFromBeginning: () => Promise<void>;
  onLandscapeToggle: () => Promise<void>;
  onToggleBookmark: () => Promise<void>;
  getPlaybackRateDisplay: (rate: number) => string;
  getLocalizedText: (textObj: { ja: string; en: string }) => string;
  getChapterProgress: (chapterIndex: number) => number;
  isTemporarilyDisabled: boolean;
  backgroundColorAnim: Animated.AnimatedInterpolation<string>;
}

const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stringFigure } = route.params;
  const { currentLanguage } = route.params;
    
  const { isTablet, isDeviceLandscape } = useDeviceInfo();
  

  // ステート管理
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLastChapterCompleted, setIsLastChapterCompleted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.6);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const videoRef = useRef<Video>(null);
  const nextChapterButtonRef = useRef<NextChapterButtonRef>(null);
  const replayButtonRef = useRef<ReplayButtonRef>(null);
  const previousChapterButtonRef = useRef<PreviousChapterButtonRef>(null);
  const restartButtonRef = useRef<RestartButtonRef>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isTemporarilyDisabled, setIsTemporarilyDisabled] = useState(false);
  const disableTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enableTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  
  // 背景色アニメーション用
  const backgroundColorAnimValue = useRef(new Animated.Value(0)).current;
  
  // リスタートレイヤーアニメーション用
  const restartLayerOpacity = useRef(new Animated.Value(0)).current;

  // 音声認識フック
  const {
    recognizing,
    isSupported: isRecognitionSupported,
    start: startRecognition,
    stop: stopRecognition,
    cleanup: cleanupRecognition,
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
      
      // 300ms後にボタンを無効化
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

  // アプリ起動時に保存された言語設定を読み込む
  useEffect(() => {
    console.log('stringFigure.directory', stringFigure.directory);
    // chaptersを読み込み
    loadChapters();

    loadBookmarkedIds();
    // スマホの場合、VideoPlayerScreen表示時は向き判定を行う
    if (!isTablet) {
      loadOrientationSetting();
    }

    // 画面スリープを防止
    activateKeepAwakeAsync();

    // クリーンアップ: スマホの場合はアンマウント時に画面の向きをportraitに戻す
    return () => {
      if (!isTablet) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
      // 画面スリープ防止を解除
      deactivateKeepAwake();
      // タイマーをクリーンアップ
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

  const loadOrientationSetting = async () => {
    try {
      const savedIsLandscapeMode = await AsyncStorage.getItem('isLandscapeMode');
      if (savedIsLandscapeMode === 'true') {
        setIsLandscapeMode(true);
        // 横向きモードが有効な場合、画面を横向きに設定
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      } else {
        setIsLandscapeMode(false);
      }
    } catch (error) {
      console.error('画面向き設定の読み込みに失敗しました:', error);
    }
  };

  // ブックマークの切り替え処理
  const handleToggleBookmark = async () => {
    try {
      const isCurrentlyBookmarked = bookmarkedIds.includes(stringFigure.id);
      let newBookmarkedIds: string[];
      
      if (isCurrentlyBookmarked) {
        // ブックマークから削除
        newBookmarkedIds = bookmarkedIds.filter(id => id !== stringFigure.id);
      } else {
        // ブックマークに追加
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

  // 動画の再生状況を監視
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      setVideoDuration(status.durationMillis || 0);
      
      if (status.didJustFinish) {
        // 動画が終了した場合
        console.log('Video finished');
        
        // 最後のチャプターが完了した場合
        if (currentChapterIndex === chapters.length - 1) {
          setIsLastChapterCompleted(true);
          
          // クリアポイントを加算
          const points = getDifficultyPoints(stringFigure.difficulty);
          if (points > 0) {
            addClearPoints(points).catch(error => {
              console.error('クリアポイントの加算に失敗しました:', error);
            });
          }
        }
      }
    }
  };

  // 動画がロードされた時の処理
  const handleVideoLoad = async () => {
    setPlaybackPosition(0); // 新しい動画読み込み時は進捗をリセット
    setIsLastChapterCompleted(false); // 新しい動画読み込み時は完了状態をリセット
    
    if (shouldAutoPlay && videoRef.current) {
      try {
        // 動画を最初の位置（0秒）にセットしてから再生
        await videoRef.current.setPositionAsync(0);
        await videoRef.current.playAsync();
        setShouldAutoPlay(false);
      } catch (error) {
        console.error('Error auto-playing video:', error);
      }
    }
  };

  // つぎへボタンの処理
  const handleNextChapter = async () => {
    if (!videoRef.current) return;

    try {
      const status = await videoRef.current.getStatusAsync();

      if (status.isLoaded) {
        const currentPosition = status.positionMillis || 0;

        // chapter0で動画の再生時間が0秒の場合はそのまま再生
        if (currentChapterIndex === 0 && currentPosition === 0) {
          await videoRef.current.playAsync();
          // リップルエフェクトを発火
          nextChapterButtonRef.current?.triggerRipple();
        }
        // それ以外の場合は次のchapterへ進む
        else if (currentChapterIndex < chapters.length - 1) {
          setShouldAutoPlay(true);
          setCurrentChapterIndex(prev => prev + 1);
          setPlaybackPosition(0); // 新しいチャプターの開始時は進捗をリセット
          // リップルエフェクトを発火
          nextChapterButtonRef.current?.triggerRipple();
        }
      }
    } catch (error) {
      console.error('Error handling next chapter:', error);
    }
  };

  const handleGoBack = async () => {
    console.log('handleGoBack');
    
    // 音声認識を停止
    if (recognizing) {
      await stopRecognition();
    }
    // クリーンアップ
    cleanupRecognition();
    // 300ms待機してから戻る
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      // isLandscapeModeが有効な場合、明示的に縦向きに設定
      const isLandscapeMode = await AsyncStorage.getItem('isLandscapeMode');
      if (isLandscapeMode === 'true') {
        // 明示的に縦向きに設定（HomeScreenと同じ設定）
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        // 300ms待機してから戻る
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('画面向きの設定に失敗しました:', error);
    }
    navigation.goBack();
  };

  // もういちどボタンの処理
  const handleReplay = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.setPositionAsync(0);
      setPlaybackPosition(0);
      await videoRef.current.playAsync();
      // リップルエフェクトを発火
      replayButtonRef.current?.triggerRipple();
    } catch (error) {
      console.error('Error replaying video:', error);
    }
  };

  // まえボタンの処理
  const handlePreviousChapter = async () => {
    if (!videoRef.current || currentChapterIndex === 0) return;

    try {
      if (currentChapterIndex > 0) {
        setShouldAutoPlay(true);
        setCurrentChapterIndex(prev => prev - 1);
        setPlaybackPosition(0);
        // リップルエフェクトを発火
        previousChapterButtonRef.current?.triggerRipple();
      }
    } catch (error) {
      console.error('Error handling previous chapter:', error);
    }
  };

  // はじめからボタンの処理
  const handleRestartFromBeginning = async () => {
    try {
      setShouldAutoPlay(false);
      setCurrentChapterIndex(0);
      setPlaybackPosition(0);
      setIsLastChapterCompleted(false);
      
      // レイヤーアニメーション: 0s:0 → 0.3s: 1 → 1.0s: 0
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
    // isLastChapterCompletedがtrueでない場合は何もせず処理を返す
    if (isLastChapterCompleted !== true) return;
    
    try {
      // AsyncStorageからcompleteDatesを取得
      const savedCompleteDates = await AsyncStorage.getItem('completeDates');
      let completeDates: Array<{ id: string; dates: string[] }> = [];
      
      if (savedCompleteDates) {
        completeDates = JSON.parse(savedCompleteDates);
      }
      
      const todayDateString = getTodayDateString();
      
      // stringFigure.idと一致するエントリを検索
      const existingEntryIndex = completeDates.findIndex(
        entry => entry.id === stringFigure.id
      );
      
      if (existingEntryIndex === -1) {
        // 一致するものがない場合：新規エントリを追加
        completeDates.push({
          id: stringFigure.id,
          dates: [todayDateString],
        });
      } else {
        // 一致するものがある場合：dates配列を確認
        const existingEntry = completeDates[existingEntryIndex];
        if (!existingEntry.dates.includes(todayDateString)) {
          // 今日の日付が含まれていない場合：日付を追加
          existingEntry.dates.push(todayDateString);
          completeDates[existingEntryIndex] = existingEntry;
        }
        // 今日の日付が既に含まれている場合は何もしない
      }
      
      // 更新されたcompleteDatesをAsyncStorageに保存
      await AsyncStorage.setItem('completeDates', JSON.stringify(completeDates));
    } catch (error) {
      console.error('完了日付の保存に失敗しました:', error);
    }
    
    // 背景色アニメーション: 0.3秒で#FF8904に変化
    Animated.timing(backgroundColorAnimValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // 1.6秒で#F7F5F2に戻す
      Animated.timing(backgroundColorAnimValue, {
        toValue: 0,
        duration: 1600,
        useNativeDriver: false,
      }).start();
    });
    
    // 紙吹雪エフェクトを発火
    setConfettiKey(prev => prev + 1);
  };

  // 進捗計算のヘルパー関数
  const getChapterProgress = (chapterIndex: number) => {
    if (chapterIndex < currentChapterIndex) {
      // 完了したチャプター
      return 1;
    } else if (chapterIndex === currentChapterIndex) {
      // 現在のチャプター
      return videoDuration > 0 ? playbackPosition / videoDuration : 0;
    } else {
      // 未開始のチャプター
      return 0;
    }
  };

  // LandScapeボタンのハンドラー
  const handleLandscapeToggle = async () => {
    if (isTablet) return; // タブレットでは何もしない
    
    try {
      const newIsLandscapeMode = !isLandscapeMode;
      setIsLandscapeMode(newIsLandscapeMode);
      await AsyncStorage.setItem('isLandscapeMode', JSON.stringify(newIsLandscapeMode));
      
      // 画面の向きを変更
      if (newIsLandscapeMode) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    } catch (error) {
      console.error('AsyncStorageへのisLandscape保存に失敗:', error);
    }
  };

  // 背景色のアニメーション値を計算
  const backgroundColorAnim = backgroundColorAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F7F5F2', '#FF8904'],
  });

  // 共通プロパティ
  const sharedProps: VideoPlayerSharedProps = {
    stringFigure,
    chapters,
    currentChapterIndex,
    shouldAutoPlay,
    currentLanguage,
    playbackPosition,
    videoDuration,
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
  };

  // 画面向きに応じてコンポーネントを出し分け
  // タブレット以外でランドスケープの時はVideoPlayerLandscape（!isTablet && isDeviceLandscape）
  // それ以外はVideoPlayerPortrait
  const shouldUseLandscape = !isTablet && isDeviceLandscape;
  
  // ネットワークエラーメッセージ
  const networkErrorMessage = getLocalizedText({
    ja: 'ネットワーク接続がありません。音声認識機能を使用できません。',
    en: 'No network connection. Speech recognition is unavailable.',
  });
  
  // 画面サイズを取得（紙吹雪の発射位置を計算するため）
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  return (
    <PaperProvider>
      {shouldUseLandscape ? (
        <VideoPlayerLandscape {...sharedProps} />
      ) : (
        <VideoPlayerPortrait {...sharedProps} />
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

export default VideoPlayerScreen;
