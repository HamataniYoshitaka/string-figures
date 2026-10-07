import { Animated } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { Chapter } from '../types';
import type { NonverbalSegmentPlayback } from '../utils/nonverbalChapterPlayback';
import { NextChapterButtonRef } from '../components/NonverbalNextChapterButton';
import { ReplayButtonRef } from '../components/NonverbalReplayButton';
import { PreviousChapterButtonRef } from '../components/NonverbalPreviousChapterButton';
import { RestartButtonRef } from '../components/NonverbalRestartTopBalloon';

export interface VideoPlayerSharedProps {
  stringFigure: any;
  chapters: Chapter[];
  currentChapterIndex: number;
  shouldAutoPlay: boolean;
  currentLanguage: 'ja' | 'en';
  playbackPosition: number;
  videoDuration: number;
  nonverbalSegmentPlayback?: NonverbalSegmentPlayback;
  onNonverbalSegmentPlaybackUpdate?: (update: Partial<NonverbalSegmentPlayback>) => void;
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
  /** 直近の音声認識テキスト（デバッグオーバーレイ用） */
  lastSpeechTranscript: string;
  /** 前半/後半シーケンスをリセットするトリガー（リプレイ等で加算） */
  nonverbalPaddingResetKey?: number;
}
