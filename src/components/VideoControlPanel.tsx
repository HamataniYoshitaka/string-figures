import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

import { CloseIcon } from './icons';
import LandScapeIcon from './icons/LandScape';
import RestartButton from './RestartButton';
import NextChapterLandscapeButton from './NextChapterLandscapeButton';
import ReplayLandscapeButton from './ReplayLandscapeButton';
import PreviousChapterLandscapeButton from './PreviousChapterLandscapeButton';
import SpeedControlLandscape from './SpeedControlLandscape';
import { StringFigure } from '../types';

interface VideoControlPanelProps {
  stringFigure: StringFigure;
  currentChapterIndex: number;
  playbackPosition: number;
  isLastChapterCompleted: boolean;
  playbackRate: number;
  PLAYBACK_RATES: number[];
  isSmallScreen: boolean;
  isLargeScreen: boolean;
  isLandscapeMode: boolean;
  currentLanguage: 'ja' | 'en';
  recognizing: boolean;
  onGoBack: () => void;
  onNextChapter: () => void;
  onReplay: () => void;
  onPreviousChapter: () => void;
  onRestartFromBeginning: () => void;
  onSlowerSpeed: () => void;
  onFasterSpeed: () => void;
  onLandscapeToggle: () => Promise<void>;
  onStopRecognition: () => Promise<void>;
  getPlaybackRateDisplay: (rate: number) => string;
}

const VideoControlPanel: React.FC<VideoControlPanelProps> = ({
  stringFigure,
  currentChapterIndex,
  playbackPosition,
  isLastChapterCompleted,
  playbackRate,
  PLAYBACK_RATES,
  isSmallScreen,
  isLargeScreen,
  isLandscapeMode,
  currentLanguage,
  recognizing,
  onGoBack,
  onNextChapter,
  onReplay,
  onPreviousChapter,
  onRestartFromBeginning,
  onSlowerSpeed,
  onFasterSpeed,
  onLandscapeToggle,
  onStopRecognition,
  getPlaybackRateDisplay,
}) => {

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // アニメーション用のrefs
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const landscapeButtonScale = useRef(new Animated.Value(1)).current;

  // 戻るボタンのハンドラー（音声認識を停止してから戻る）
  const handleGoBack = async () => {
    // 音声認識を停止
    if (recognizing) {
      await onStopRecognition();
    }
    
    // 元の戻る処理を実行
    onGoBack();
  };

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

  return (
    <View style={[styles.leftPanel, { left: isSmallScreen ? 16 : isLargeScreen ? 52 : 36 }]}>
      {/* 上部ボタンコンテナ */}
      <View style={styles.topButtonsContainer}>
        {/* 戻るボタン */}
        <TouchableWithoutFeedback 
          onPress={handleGoBack}
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
              fillColor={isLandscapeMode ? "#1862cfff" : "#2d2b29ff"}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      {/* コントロールボタン */}
      <View style={styles.controlsContainer}>
        {isLastChapterCompleted ? (
          <RestartButton
            onPress={onRestartFromBeginning}
            getLocalizedText={getLocalizedText}
          />
        ) : (
          <NextChapterLandscapeButton
            onPress={onNextChapter}
            stringFigure={stringFigure}
            currentChapterIndex={currentChapterIndex}
            getLocalizedText={getLocalizedText}
          />
        )}

        <ReplayLandscapeButton
          onPress={onReplay}
          currentChapterIndex={currentChapterIndex}
          playbackPosition={playbackPosition}
          getLocalizedText={getLocalizedText}
        />

        <PreviousChapterLandscapeButton
          onPress={onPreviousChapter}
          currentChapterIndex={currentChapterIndex}
          getLocalizedText={getLocalizedText}
        />
      </View>

      {/* 再生速度 */}
      <SpeedControlLandscape
        playbackRate={playbackRate}
        PLAYBACK_RATES={PLAYBACK_RATES}
        currentLanguage={currentLanguage}
        onSlowerSpeed={onSlowerSpeed}
        onFasterSpeed={onFasterSpeed}
        getPlaybackRateDisplay={getPlaybackRateDisplay}
      />
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
    paddingVertical: 16,
    paddingHorizontal: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    marginLeft: 8,
    marginBottom: 20,
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
  },
});

export default VideoControlPanel;
