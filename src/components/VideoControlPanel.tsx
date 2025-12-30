import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

import { CloseIcon } from './icons';
import LandScapeIcon from './icons/LandScape';
import NextChapterLandscapeButton, { NextChapterLandscapeButtonRef } from './NextChapterLandscapeButton';
import ReplayLandscapeButton, { ReplayLandscapeButtonRef } from './ReplayLandscapeButton';
import PreviousChapterLandscapeButton, { PreviousChapterLandscapeButtonRef } from './PreviousChapterLandscapeButton';
import ChapterNavigationVerticalBar from './ChapterNavigationVerticalBar';
// import SpeedControlLandscape from './SpeedControlLandscape';
import { Chapter, StringFigure } from '../types';

interface VideoControlPanelProps {
  stringFigure: StringFigure;
  chapters: Chapter[];
  currentChapterIndex: number;
  playbackPosition: number;
  isLastChapterCompleted: boolean;
  playbackRate: number;
  PLAYBACK_RATES: number[];
  isLandscapeMode: boolean;
  currentLanguage: 'ja' | 'en';
  recognizing: boolean;
  nextChapterButtonRef: React.RefObject<NextChapterLandscapeButtonRef | null>;
  replayButtonRef: React.RefObject<ReplayLandscapeButtonRef | null>;
  previousChapterButtonRef: React.RefObject<PreviousChapterLandscapeButtonRef | null>;
  onGoBack: () => void;
  onNextChapter: () => void;
  onReplay: () => void;
  onPreviousChapter: () => void;
  onRestartFromBeginning: () => void;
  // onSlowerSpeed: () => void;
  // onFasterSpeed: () => void;
  onLandscapeToggle: () => Promise<void>;
  getPlaybackRateDisplay: (rate: number) => string;
  getChapterProgress: (chapterIndex: number) => number;
  isTemporarilyDisabled: boolean;
}

const VideoControlPanel: React.FC<VideoControlPanelProps> = ({
  stringFigure,
  chapters,
  currentChapterIndex,
  playbackPosition,
  isLastChapterCompleted,
  playbackRate,
  PLAYBACK_RATES,
  isLandscapeMode,
  currentLanguage,
  recognizing,
  nextChapterButtonRef,
  replayButtonRef,
  previousChapterButtonRef,
  onGoBack,
  onNextChapter,
  onReplay,
  onPreviousChapter,
  onRestartFromBeginning,
  // onSlowerSpeed,
  // onFasterSpeed,
  onLandscapeToggle,
  getPlaybackRateDisplay,
  getChapterProgress,
  isTemporarilyDisabled,
}) => {

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // アニメーション用のrefs
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const landscapeButtonScale = useRef(new Animated.Value(1)).current;

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
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // 画面サイズ判定
  const isSmallScreen = screenWidth <= 667; // iPhoneSE2の高さは667px
  const isLargeScreen = screenWidth >= 852;
  

  return (
    <View style={[styles.leftPanel, { left: isSmallScreen ? 16 : isLargeScreen ? 60 : 48 }]}>
      {/* 上部ボタンコンテナ */}
      <View style={styles.topButtonsContainer}>
        {/* 戻るボタン */}
        <TouchableWithoutFeedback 
          onPress={onGoBack}
          onPressIn={createPressInHandler(backButtonScale)}
          onPressOut={createPressOutHandler(backButtonScale)}
        >
          <Animated.View 
            style={[
              styles.backButton,
              { transform: [{ scale: backButtonScale }] }
            ]}
          >
            <CloseIcon width={32} height={32} fillColor="#79716B" />
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* LandScapeボタン */}
        <TouchableWithoutFeedback 
          onPress={onLandscapeToggle}
          onPressIn={createPressInHandler(landscapeButtonScale)}
          onPressOut={createPressOutHandler(landscapeButtonScale)}
        >
          <Animated.View 
            style={[
              styles.landscapeButton,
              { transform: [{ scale: landscapeButtonScale }] }
            ]}
          >
            <LandScapeIcon 
              width={32} 
              height={32} 
              fillColor={isLandscapeMode ? "#c2410c" : "#2d2b29ff"}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      {/* コントロールボタン */}
      <View style={styles.controlsContainer}>
        <ChapterNavigationVerticalBar
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onPreviousChapter={onPreviousChapter}
          onReplay={onReplay}
          onNextChapter={onNextChapter}
          onRestartFromBeginning={onRestartFromBeginning}
          playbackPosition={playbackPosition}
          isLastChapterCompleted={isLastChapterCompleted}
          stringFigure={stringFigure}
          getLocalizedText={getLocalizedText}
          previousChapterButtonRef={previousChapterButtonRef}
          replayButtonRef={replayButtonRef}
          nextChapterButtonRef={nextChapterButtonRef}
          getChapterProgress={getChapterProgress}
          isTemporarilyDisabled={isTemporarilyDisabled}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  leftPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 150,
    zIndex: 10,
    paddingVertical: 12,
    paddingHorizontal: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    marginLeft: 0,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  landscapeButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  controlsContainer: {
    flex: 1,
    gap: 4,
    justifyContent: 'space-between',
  },
});

export default VideoControlPanel;
