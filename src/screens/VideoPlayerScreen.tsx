import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Video, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import VideoPlayerLandscape from './VideoPlayerLandscape';
import VideoPlayerPortrait from './VideoPlayerPortrait';
import { NextChapterButtonRef } from '../components/NextChapterButton';
import { ReplayButtonRef } from '../components/ReplayButton';

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
  isLandscapeMode: boolean;
  PLAYBACK_RATES: number[];
  recognizing: boolean;
  isRecognitionSupported: boolean;
  bookmarked: boolean;
  onPlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
  onVideoLoad: () => Promise<void>;
  onNextChapter: () => Promise<void>;
  onGoBack: () => void;
  onReplay: () => Promise<void>;
  onPreviousChapter: () => Promise<void>;
  onRestartFromBeginning: () => Promise<void>;
  onSlowerSpeed: () => Promise<void>;
  onFasterSpeed: () => Promise<void>;
  onLandscapeToggle: () => Promise<void>;
  onToggleBookmark: () => Promise<void>;
  getPlaybackRateDisplay: (rate: number) => string;
  getLocalizedText: (textObj: { ja: string; en: string }) => string;
  getChapterProgress: (chapterIndex: number) => number;
}

const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stringFigure } = route.params;
    
  const { isTablet, isDeviceLandscape } = useDeviceInfo();
  

  // ステート管理
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLastChapterCompleted, setIsLastChapterCompleted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const videoRef = useRef<Video>(null);
  const nextChapterButtonRef = useRef<NextChapterButtonRef>(null);
  const replayButtonRef = useRef<ReplayButtonRef>(null);

  // 音声認識フック
  const {
    recognizing,
    isSupported: isRecognitionSupported,
    start: startRecognition,
    stop: stopRecognition,
  } = useSpeechRecognition({
    language: currentLanguage,
    onKeywordDetected: async (keyword) => {
      // キーワードに応じたアクションを実行
      if (keyword === 'つぎ' || keyword === 'next') {
        await handleNextChapter();
      } else if (keyword === 'まえ' || keyword === 'previous') {
        await handlePreviousChapter();
      } else if (keyword === 'もういちど' || keyword === 'replay') {
        await handleReplay();
      } else if (keyword === 'ゆっくり' || keyword === 'slower') {
        await handleSlowerSpeed();
      } else if (keyword === 'はやく' || keyword === 'faster') {
        await handleFasterSpeed();
      } else if (keyword === 'はじめから' || keyword === 'restart') {
        await handleRestartFromBeginning();
      }
    },
  });

  // アプリ起動時に保存された言語設定を読み込む
  useEffect(() => {
    loadLanguageSetting();
    loadBookmarkedIds();
    // スマホの場合、VideoPlayerScreen表示時は向き判定を行う
    if (!isTablet) {
      loadOrientationSetting();
    }
    
    // クリーンアップ: スマホの場合はアンマウント時に画面の向きをportraitに戻す
    return () => {
      if (!isTablet) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
  }, []);

  const loadLanguageSetting = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('言語設定の読み込みに失敗しました:', error);
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

  // 動画の再生状況を監視
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      setVideoDuration(status.durationMillis || 0);
      
      if (status.didJustFinish) {
        // 動画が終了した場合
        console.log('Video finished');
        
        // 最後のチャプターが完了した場合
        if (currentChapterIndex === stringFigure.chapters.length - 1) {
          setIsLastChapterCompleted(true);
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
        else if (currentChapterIndex < stringFigure.chapters.length - 1) {
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
    } catch (error) {
      console.error('Error restarting from beginning:', error);
    }
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

  // 再生速度を遅くする関数
  const handleSlowerSpeed = async () => {
    if (!videoRef.current) return;
    
    try {
      const status = await videoRef.current.getStatusAsync();
      // 動画が再生中の場合は何もしない
      if (status.isLoaded && status.isPlaying) {
        return;
      }
      
      const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
      if (currentIndex > 0) {
        const newRate = PLAYBACK_RATES[currentIndex - 1];
        setPlaybackRate(newRate);
        await videoRef.current.setRateAsync(newRate, true);
      }
    } catch (error) {
      console.error('Error setting playback rate:', error);
    }
  };

  // 再生速度を速くする関数
  const handleFasterSpeed = async () => {
    if (!videoRef.current) return;
    
    try {
      const status = await videoRef.current.getStatusAsync();
      // 動画が再生中の場合は何もしない
      if (status.isLoaded && status.isPlaying) {
        return;
      }
      
      const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
      if (currentIndex < PLAYBACK_RATES.length - 1) {
        const newRate = PLAYBACK_RATES[currentIndex + 1];
        setPlaybackRate(newRate);
        await videoRef.current.setRateAsync(newRate, true);
      }
    } catch (error) {
      console.error('Error setting playback rate:', error);
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

  // 共通プロパティ
  const sharedProps: VideoPlayerSharedProps = {
    stringFigure,
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
    isLandscapeMode,
    PLAYBACK_RATES,
    recognizing,
    isRecognitionSupported,
    bookmarked: bookmarkedIds.includes(stringFigure.id),
    onPlaybackStatusUpdate: handlePlaybackStatusUpdate,
    onVideoLoad: handleVideoLoad,
    onNextChapter: handleNextChapter,
    onGoBack: handleGoBack,
    onReplay: handleReplay,
    onPreviousChapter: handlePreviousChapter,
    onRestartFromBeginning: handleRestartFromBeginning,
    onSlowerSpeed: handleSlowerSpeed,
    onFasterSpeed: handleFasterSpeed,
    onLandscapeToggle: handleLandscapeToggle,
    onToggleBookmark: handleToggleBookmark,
    getPlaybackRateDisplay,
    getLocalizedText,
    getChapterProgress,
  };

  // 画面向きに応じてコンポーネントを出し分け
  // タブレット以外でランドスケープの時はVideoPlayerLandscape（!isTablet && isDeviceLandscape）
  // それ以外はVideoPlayerPortrait
  const shouldUseLandscape = !isTablet && isDeviceLandscape;
  
  return shouldUseLandscape ? (
    <VideoPlayerLandscape {...sharedProps} />
  ) : (
    <VideoPlayerPortrait {...sharedProps} />
  );
};

export default VideoPlayerScreen;
