import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

import { SkipNextIcon, SkipPreviousIcon, ReplayIcon, CloseIcon, SkipBackwardIcon } from './icons';
import PlaySpeedIcon from './icons/PlaySpeed';
import SpeedButtonTail from './icons/SpeedButtonTail';
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
  onGoBack,
  onNextChapter,
  onReplay,
  onPreviousChapter,
  onRestartFromBeginning,
  onSlowerSpeed,
  onFasterSpeed,
  getPlaybackRateDisplay,
}) => {
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
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const replayButtonScale = useRef(new Animated.Value(1)).current;
  const previousButtonScale = useRef(new Animated.Value(1)).current;
  const restartButtonScale = useRef(new Animated.Value(1)).current;
  const backButtonScale = useRef(new Animated.Value(1)).current;
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

      {/* コントロールボタン */}
      <View style={styles.controlsContainer}>
        {isLastChapterCompleted ? (
          <TouchableWithoutFeedback 
            onPress={onRestartFromBeginning}
            onPressIn={createPressInHandler(restartButtonScale)}
            onPressOut={createPressOutHandler(restartButtonScale)}
          >
            <Animated.View 
              style={[
                styles.controlButton,
                { transform: [{ scale: restartButtonScale }] }
              ]}
            >
              <View style={styles.floatingButton}>
                <SkipBackwardIcon width={24} height={24} fillColor="white" />
              </View>
              <View style={[
                styles.chapterBalloon,
                styles.speedButtonTop
              ]}>
                <Text>はじめから</Text>
                <SpeedButtonTail 
                  fillColor={'rgba(208, 205, 205, 0.5)'}
                  isBottom={true}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        ) : (
          <TouchableWithoutFeedback 
            onPress={currentChapterIndex < stringFigure.chapters.length - 1 ? onNextChapter : undefined}
            onPressIn={currentChapterIndex < stringFigure.chapters.length - 1 ? createPressInHandler(nextButtonScale) : undefined}
            onPressOut={currentChapterIndex < stringFigure.chapters.length - 1 ? createPressOutHandler(nextButtonScale) : undefined}
            disabled={currentChapterIndex === stringFigure.chapters.length - 1}
          >
            <Animated.View 
              style={[
                styles.controlButton,
                { transform: [{ scale: nextButtonScale }] }
              ]}
            >
              <View style={[
                styles.floatingButton,
                currentChapterIndex === stringFigure.chapters.length - 1 && styles.disabledButton
              ]}>
                <SkipNextIcon width={24} height={24} fillColor="white" strokeColor='transparent' />
              </View>
              <View style={[
                styles.chapterBalloon,
                styles.speedButtonTop,
                currentChapterIndex === stringFigure.chapters.length - 1 && styles.speedButtonDisabled
              ]}>
                <Text style={[
                  currentChapterIndex === stringFigure.chapters.length - 1 && styles.speedButtonTextDisabled
                ]}>つぎ</Text>
                <SpeedButtonTail 
                  fillColor={currentChapterIndex === stringFigure.chapters.length - 1 ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
                  isBottom={true}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        )}

        <TouchableWithoutFeedback 
          onPress={currentChapterIndex === 0 && playbackPosition === 0 ? undefined : onReplay}
          onPressIn={currentChapterIndex === 0 && playbackPosition === 0 ? undefined : createPressInHandler(replayButtonScale)}
          onPressOut={currentChapterIndex === 0 && playbackPosition === 0 ? undefined : createPressOutHandler(replayButtonScale)}
          disabled={currentChapterIndex === 0 && playbackPosition === 0}
        >
          <Animated.View 
            style={[
              styles.controlButton,
              { transform: [{ scale: replayButtonScale }] }
            ]}
          >
            <View style={[
              styles.floatingButton,
              currentChapterIndex === 0 && playbackPosition === 0 && styles.disabledButton
            ]}>
              <ReplayIcon 
                width={24} 
                height={24} 
                fillColor={"white"}
                strokeColor='transparent'
              />
            </View>
            <View style={[
              styles.chapterBalloon,
              styles.speedButtonTop,
              currentChapterIndex === 0 && playbackPosition === 0 && styles.speedButtonDisabled
            ]}>
              <Text style={[
                currentChapterIndex === 0 && playbackPosition === 0 && styles.speedButtonTextDisabled
              ]}>もういちど</Text>
              <SpeedButtonTail 
                fillColor={currentChapterIndex === 0 && playbackPosition === 0 ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
                isBottom={true}
              />
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback 
          onPress={currentChapterIndex > 0 ? onPreviousChapter : undefined}
          onPressIn={currentChapterIndex > 0 ? createPressInHandler(previousButtonScale) : undefined}
          onPressOut={currentChapterIndex > 0 ? createPressOutHandler(previousButtonScale) : undefined}
          disabled={currentChapterIndex === 0}
        >
          <Animated.View 
            style={[
              styles.controlButton,
              { transform: [{ scale: previousButtonScale }] }
            ]}
          >
            <View style={[
              styles.floatingButton,
              currentChapterIndex === 0 && styles.disabledButton
            ]}>
              <SkipPreviousIcon 
                width={24} 
                height={24} 
                fillColor={"white"}
                strokeColor='transparent'
              />
            </View>
            <View style={[
              styles.chapterBalloon,
              styles.speedButtonTop,
              currentChapterIndex === 0 && styles.speedButtonDisabled
            ]}>
              <Text style={[
                currentChapterIndex === 0 && styles.speedButtonTextDisabled
              ]}>まえ</Text>
              <SpeedButtonTail 
                fillColor={currentChapterIndex === 0 ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
                isBottom={true}
              />
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
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
              ]}>ゆっくり</Text>
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
              ]}>はやく</Text>
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
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
    marginLeft: 8,
    marginBottom: 20,
  },
  controlsContainer: {
    flex: 1,
    gap: 4,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 12,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#57534D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.1,
    elevation: 0,
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
  chapterBalloon: {
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
    color: '#57534D',
    fontWeight: '400',
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
