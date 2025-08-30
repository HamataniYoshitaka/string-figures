import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CloseIcon } from './icons';
import PlaySpeedIcon from './icons/PlaySpeed';
import SpeedButtonTail from './icons/SpeedButtonTail';
import LandScapeIcon from './icons/LandScape';
import RestartButton from './RestartButton';
import NextChapterLandscapeButton from './NextChapterLandscapeButton';
import ReplayLandscapeButton from './ReplayLandscapeButton';
import PreviousChapterLandscapeButton from './PreviousChapterLandscapeButton';
import { StringFigure } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VideoControlPanelProps {
  stringFigure: StringFigure;
  currentChapterIndex: number;
  playbackPosition: number;
  isLastChapterCompleted: boolean;
  playbackRate: number;
  PLAYBACK_RATES: number[];
  isSmallScreen: boolean;
  isLargeScreen: boolean;
  currentLanguage: 'ja' | 'en';
  onGoBack: () => void;
  onNextChapter: () => void;
  onReplay: () => void;
  onPreviousChapter: () => void;
  onRestartFromBeginning: () => void;
  onSlowerSpeed: () => void;
  onFasterSpeed: () => void;
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
  currentLanguage,
  onGoBack,
  onNextChapter,
  onReplay,
  onPreviousChapter,
  onRestartFromBeginning,
  onSlowerSpeed,
  onFasterSpeed,
  getPlaybackRateDisplay,
}) => {
  // isLandscape状態の管理
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);

  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // コンポーネントマウント時にAsyncStorageからisLandscapeModeを読み込み
  useEffect(() => {
    const loadLandscapeState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('isLandscapeMode');
        if (storedValue !== null) {
          setIsLandscapeMode(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error('AsyncStorageからisLandscapeModeの読み込みに失敗:', error);
      }
    };
    
    loadLandscapeState();
  }, []);

  // LandScapeボタンのハンドラー
  const handleLandscapeToggle = async () => {
    try {
      const newIsLandscapeMode = !isLandscapeMode;
      setIsLandscapeMode(newIsLandscapeMode);
      await AsyncStorage.setItem('isLandscapeMode', JSON.stringify(newIsLandscapeMode));
    } catch (error) {
      console.error('AsyncStorageへのisLandscapeMode保存に失敗:', error);
    }
  };

  // 音声認識のカスタムフック
  const speechRecognition = useSpeechRecognition({
    onKeywordDetected: (keyword) => {
      console.log('キーワード検出:', keyword);
      // キーワードに応じてアクションを実行
      switch (keyword) {
        case 'つぎ':
        case '次':
          if (isLastChapterCompleted) {
            onRestartFromBeginning();
          } else if (currentChapterIndex < stringFigure.chapters.length - 1) {
            onNextChapter();
          }
          break;
        case 'まえ':
        case '前':
          if (currentChapterIndex > 0) {
            onPreviousChapter();
          }
          break;
        case 'もういちど':
        case 'もう一度':
          if (!(currentChapterIndex === 0 && playbackPosition === 0)) {
            onReplay();
          }
          break;
        case 'ゆっくり':
          if (PLAYBACK_RATES.indexOf(playbackRate) > 0) {
            onSlowerSpeed();
          }
          break;
        case 'はやく':
        case '早く':
        case '速く':
          if (PLAYBACK_RATES.indexOf(playbackRate) < PLAYBACK_RATES.length - 1) {
            onFasterSpeed();
          }
          break;
        case 'はじめから':
        case '初めから':
        case '始めから':
          onRestartFromBeginning();
          break;
      }
    },
  });
  
  // アニメーション用のrefs
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const landscapeButtonScale = useRef(new Animated.Value(1)).current;
  const slowerSpeedScale = useRef(new Animated.Value(1)).current;
  const fasterSpeedScale = useRef(new Animated.Value(1)).current;

  // 戻るボタンのハンドラー（音声認識を停止してから戻る）
  const handleGoBack = async () => {
    // 音声認識を停止
    await speechRecognition.stop();
    
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
          onPress={handleLandscapeToggle}
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
      <View style={styles.speedContainer}>
        <View style={styles.speedDisplay}>
          <PlaySpeedIcon width={24} height={24} fillColor="#292524" strokeColor="#57534D" />
          <Text style={styles.speedText}>{getPlaybackRateDisplay(playbackRate)}x</Text>
        </View>
        <View style={styles.speedButtons}>
          <TouchableWithoutFeedback 
            onPress={onSlowerSpeed}
            onPressIn={PLAYBACK_RATES.indexOf(playbackRate) === 0 ? undefined : createPressInHandler(slowerSpeedScale)}
            onPressOut={PLAYBACK_RATES.indexOf(playbackRate) === 0 ? undefined : createPressOutHandler(slowerSpeedScale)}
            disabled={PLAYBACK_RATES.indexOf(playbackRate) === 0}
          >
            <Animated.View 
              style={[
                styles.speedButton, 
                styles.speedButtonTop,
                PLAYBACK_RATES.indexOf(playbackRate) === 0 && styles.speedButtonDisabled,
                { transform: [{ scale: slowerSpeedScale }] }
              ]}
            >
              <Text style={[
                styles.speedButtonText,
                PLAYBACK_RATES.indexOf(playbackRate) === 0 && styles.speedButtonTextDisabled
              ]}>{getLocalizedText({ ja: 'ゆっくり', en: 'Slower' })}</Text>
              <SpeedButtonTail 
                fillColor={PLAYBACK_RATES.indexOf(playbackRate) === 0 ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
                isBottom={true}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback 
            onPress={onFasterSpeed}
            onPressIn={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 ? undefined : createPressInHandler(fasterSpeedScale)}
            onPressOut={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 ? undefined : createPressOutHandler(fasterSpeedScale)}
            disabled={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1}
          >
            <Animated.View 
              style={[
                styles.speedButton, 
                styles.speedButtonBottom,
                PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 && styles.speedButtonDisabled,
                { transform: [{ scale: fasterSpeedScale }] }
              ]}
            >
              <Text style={[
                styles.speedButtonText,
                PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 && styles.speedButtonTextDisabled
              ]}>{getLocalizedText({ ja: 'はやく', en: 'Faster' })}</Text>
              <SpeedButtonTail 
                fillColor={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
                isBottom={false}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
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
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  speedDisplay: {
    alignItems: 'center',
    width: 68,
  },
  speedButtons: {
    gap: 8,
  },
  speedButton: {
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    position: 'relative',
  },
  speedButtonTop: {
    borderBottomLeftRadius: 0,
  },
  speedButtonBottom: {
    borderTopLeftRadius: 0,
  },
  speedButtonText: {
    fontSize: 12,
    color: '#57534D',
    fontWeight: '400',
  },
  speedButtonTextDisabled: {
    color: '#999',
  },
  speedButtonDisabled: {
    backgroundColor: 'rgba(208, 205, 205, 0.3)',
  },
  speedText: {
    fontSize: 16,
    color: '#292524',
    fontWeight: '400',
    marginTop: 2,
  },
});

export default VideoControlPanel;
