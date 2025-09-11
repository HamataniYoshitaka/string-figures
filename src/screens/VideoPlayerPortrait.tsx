import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { CloseIcon } from '../components/icons';
import LandScapeIcon from '../components/icons/LandScape';
import SpeedControlPortrait from '../components/SpeedControlPortrait';
import SpeedControlLandscape from '../components/SpeedControlLandscape';
import PreviousChapterButton from '../components/PreviousChapterButton';
import PreviousChapterLandscapeButton from '../components/PreviousChapterLandscapeButton';
import ReplayButton from '../components/ReplayButton';
import ReplayLandscapeButton from '../components/ReplayLandscapeButton';
import NextChapterButton from '../components/NextChapterButton';
import NextChapterLandscapeButton from '../components/NextChapterLandscapeButton';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import ProgressBars from '../components/ProgressBars';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const VideoPlayerPortrait: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  currentChapterIndex,
  playbackRate,
  videoRef,
  playbackPosition,
  isLastChapterCompleted,
  currentLanguage,
  isLandscapeMode,
  PLAYBACK_RATES,
  onPlaybackStatusUpdate,
  onVideoLoad,
  onGoBack,
  onNextChapter,
  onReplay,
  onPreviousChapter,
  onRestartFromBeginning,
  onSlowerSpeed,
  onFasterSpeed,
  onLandscapeToggle,
  getLocalizedText,
  getChapterProgress,
  getPlaybackRateDisplay,
}) => {
  // アニメーション用のスケール値
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const shareButtonScale = useRef(new Animated.Value(1)).current;

  // デバイス情報を取得
  const { isTablet, isDeviceLandscape } = useDeviceInfo();

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
    
  // stringFigureが未定義の場合の早期リターン
  if (!stringFigure || !stringFigure.chapters || !stringFigure.chapters[currentChapterIndex]) {
    console.error('VideoPlayerPortrait - Invalid stringFigure or chapter data');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>データを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMainButtonPress = () => {
    if (currentChapterIndex === stringFigure.chapters.length - 1) {
      onReplay();
    } else {
      onNextChapter();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー - タブレット（短辺600以上）でランドスケープの場合は非表示 */}
      {!(isTablet && isDeviceLandscape) && (
        <View style={styles.header}>
          <TouchableWithoutFeedback 
            onPress={async () => {
              // 音声認識を停止してから戻る
              await speechRecognition.stop();
              onGoBack();
            }}
            onPressIn={createPressInHandler(backButtonScale)}
            onPressOut={createPressOutHandler(backButtonScale)}
          >
            <Animated.View 
              style={[
                styles.backButton,
                { transform: [{ scale: backButtonScale }] }
              ]}
            >
              <CloseIcon width={24} height={24} fillColor="#79716B" />
            </Animated.View>
          </TouchableWithoutFeedback>
          <Text style={styles.title} numberOfLines={1}>
            {getLocalizedText({ja: stringFigure.name.ja, en: stringFigure.name.en})}
          </Text>
          {!isTablet && (
            <TouchableWithoutFeedback 
              onPress={onLandscapeToggle}
              onPressIn={createPressInHandler(shareButtonScale)}
              onPressOut={createPressOutHandler(shareButtonScale)}
            >
              <Animated.View 
                style={[
                  styles.shareButton,
                  { transform: [{ scale: shareButtonScale }] }
                ]}
              >
                <LandScapeIcon 
                  width={24} 
                  height={24} 
                  fillColor={isLandscapeMode ? "#1862cfff" : "#79716B"}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          )}
        </View>
      )}
      {/* タブレットかつランドスケープの場合のみ表示 閉じるボタン */}
      {(isTablet && isDeviceLandscape) && (
        <View style={styles.tabletLandscapeCloseButtonContainer}>
          <TouchableWithoutFeedback 
            onPress={async () => {
              // 音声認識を停止してから戻る
              await speechRecognition.stop();
              onGoBack();
            }}
            onPressIn={createPressInHandler(backButtonScale)}
            onPressOut={createPressOutHandler(backButtonScale)}
          >
            <Animated.View 
              style={[
                styles.tabletLandscapeCloseButton,
                { transform: [{ scale: backButtonScale }] }
              ]}
            >
              <CloseIcon width={32} height={32} fillColor="#ffffff" strokeColor="none" />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      )}
      {/* 動画エリア */}
      <View style={[
        styles.videoArea,
        (isTablet && isDeviceLandscape) && styles.videoAreaTabletLandscape
      ]}>
        <View style={[
          styles.videoPlayer,
          (isTablet && isDeviceLandscape) && { height: Dimensions.get('window').height * 0.73 }
        ]}>
          <Video
            key={`chapter-${currentChapterIndex}`}
            ref={videoRef}
            source={typeof stringFigure.chapters[currentChapterIndex].videoUrl === 'string' 
              ? { uri: stringFigure.chapters[currentChapterIndex].videoUrl } 
              : stringFigure.chapters[currentChapterIndex].videoUrl
            }
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            isMuted={true}
            useNativeControls={false}
            rate={playbackRate}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            onLoad={onVideoLoad}
          />
        </View>

        {/* 進捗バー */}
        <View style={[
          styles.progressContainer,
          isDeviceLandscape && styles.progressContainerLandscape
        ]}>
          <ProgressBars 
            chapters={stringFigure.chapters}
            currentChapterIndex={currentChapterIndex}
            getChapterProgress={getChapterProgress}
          />
        </View>

        {/* 再生速度コントロール - タブレットかつランドスケープの場合のみ非表示 */}
        {!(isTablet && isDeviceLandscape) && (
          <SpeedControlPortrait
            playbackRate={playbackRate}
            onSlowerSpeed={onSlowerSpeed}
            onFasterSpeed={onFasterSpeed}
            getPlaybackRateDisplay={getPlaybackRateDisplay}
          />
        )}
      </View>

      {/* 字幕エリア - デバイスがランドスケープの場合は非表示 */}
      {!isDeviceLandscape && (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>
            {getLocalizedText(stringFigure.chapters[currentChapterIndex].subtitle)}
          </Text>
        </View>
      )}

      {/* コントロールボタンエリア */}
      <View style={styles.controlsContainer}>
        <View style={styles.mainControls}>
          {/* まえボタン */}
          {isDeviceLandscape ? (
            <PreviousChapterLandscapeButton
              onPress={onPreviousChapter}
              currentChapterIndex={currentChapterIndex}
              getLocalizedText={getLocalizedText}
            />
          ) : (
            <PreviousChapterButton
              onPress={onPreviousChapter}
              disabled={currentChapterIndex === 0}
            />
          )}

          {/* もういちど */}
          {isDeviceLandscape ? (
            <ReplayLandscapeButton
              onPress={isLastChapterCompleted ? onRestartFromBeginning : onReplay}
              currentChapterIndex={currentChapterIndex}
              playbackPosition={playbackPosition}
              getLocalizedText={getLocalizedText}
            />
          ) : (
            <ReplayButton
              onPress={isLastChapterCompleted ? onRestartFromBeginning : onReplay}
              isLastChapterCompleted={isLastChapterCompleted}
            />
          )}

          {/* つぎボタン */}
          {isDeviceLandscape ? (
            <NextChapterLandscapeButton
              onPress={isLastChapterCompleted ? onRestartFromBeginning : handleMainButtonPress}
              stringFigure={stringFigure}
              currentChapterIndex={currentChapterIndex}
              getLocalizedText={getLocalizedText}
            />
          ) : (
            <NextChapterButton
              onPress={isLastChapterCompleted ? onRestartFromBeginning : handleMainButtonPress}
              isLastChapterCompleted={isLastChapterCompleted}
              getLocalizedText={getLocalizedText}
            />
          )}
          {/* 再生速度コントロール - タブレットかつランドスケープの場合のみ表示 */}
          {(isTablet && isDeviceLandscape) && (
            <SpeedControlLandscape
              playbackRate={playbackRate}
              PLAYBACK_RATES={PLAYBACK_RATES}
              currentLanguage={currentLanguage}
              onSlowerSpeed={onSlowerSpeed}
              onFasterSpeed={onFasterSpeed}
              getPlaybackRateDisplay={getPlaybackRateDisplay}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  videoArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  videoAreaTabletLandscape: {
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  videoPlayer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressContainerLandscape: {
    marginTop: 0,
  },
  speedButton: {
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
  },
  speedButtonTopLeft: {
    borderTopLeftRadius: 0,
  },
  subtitleContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
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

export default VideoPlayerPortrait;
