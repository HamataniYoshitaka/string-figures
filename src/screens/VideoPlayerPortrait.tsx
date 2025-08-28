import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CloseIcon, SkipPreviousIcon, SkipNextIcon, SkipBackwardIcon, ReplayIcon } from '../components/icons';
import LandScapeIcon from '../components/icons/LandScape';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import ProgressBars from '../components/ProgressBars';

const VideoPlayerPortrait: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  currentChapterIndex,
  playbackRate,
  videoRef,
  playbackPosition,
  isLastChapterCompleted,
  onPlaybackStatusUpdate,
  onVideoLoad,
  onGoBack,
  onNextChapter,
  onReplay,
  onPreviousChapter,
  onRestartFromBeginning,
  onSlowerSpeed,
  onFasterSpeed,
  getLocalizedText,
  getChapterProgress,
  getPlaybackRateDisplay,
}) => {
  // アニメーション用のスケール値
  const backButtonScale = useRef(new Animated.Value(1)).current;
  const shareButtonScale = useRef(new Animated.Value(1)).current;
  
  // isLandscape状態の管理
  const [isLandscape, setIsLandscape] = useState(false);
  
  // コンポーネントマウント時にAsyncStorageからisLandscapeを読み込み
  useEffect(() => {
    const loadLandscapeState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('isLandscape');
        if (storedValue !== null) {
          setIsLandscape(JSON.parse(storedValue));
        }
      } catch (error) {
        console.error('AsyncStorageからisLandscapeの読み込みに失敗:', error);
      }
    };
    
    loadLandscapeState();
  }, []);
  
  // LandScapeボタンのハンドラー
  const handleLandscapeToggle = async () => {
    try {
      const newIsLandscape = !isLandscape;
      setIsLandscape(newIsLandscape);
      await AsyncStorage.setItem('isLandscape', JSON.stringify(newIsLandscape));
    } catch (error) {
      console.error('AsyncStorageへのisLandscape保存に失敗:', error);
    }
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
      {/* ヘッダー */}
      <View style={styles.header}>
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
            <CloseIcon width={24} height={24} fillColor="#79716B" />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Text style={styles.title} numberOfLines={1}>
          {getLocalizedText({ja: stringFigure.name.ja, en: stringFigure.name.en})}
        </Text>
        <TouchableWithoutFeedback 
          onPress={handleLandscapeToggle}
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
              fillColor={isLandscape ? "#1862cfff" : "#79716B"}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      {/* 動画エリア */}
      <View style={styles.videoArea}>
        <View style={styles.videoPlayer}>
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
        <View style={styles.progressContainer}>
          <ProgressBars 
            chapters={stringFigure.chapters}
            currentChapterIndex={currentChapterIndex}
            getChapterProgress={getChapterProgress}
          />
        </View>

        {/* 再生速度コントロール */}
        <View style={styles.speedControlContainer}>
          <TouchableOpacity 
            onPress={onSlowerSpeed}
            style={styles.speedButton}
          >
            <Text style={styles.speedButtonText}>ゆっくり</Text>
          </TouchableOpacity>
          
          <View style={styles.speedDisplay}>
            <Ionicons name="play" size={20} color="#666" />
            <Text style={styles.speedText}>{getPlaybackRateDisplay(playbackRate)}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={onFasterSpeed}
            style={styles.speedButton}
          >
            <Text style={styles.speedButtonText}>はやく</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 字幕エリア */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>
          {getLocalizedText(stringFigure.chapters[currentChapterIndex].subtitle)}
        </Text>
      </View>

      {/* コントロールボタンエリア */}
      <View style={styles.controlsContainer}>
        <View style={styles.mainControls}>
          {/* まえボタン */}
          <TouchableOpacity 
            onPress={onPreviousChapter}
            style={styles.controlButton}
            disabled={currentChapterIndex === 0}
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
            <Text style={[styles.controlButtonText, currentChapterIndex === 0 && styles.disabledText]}>
              まえ
            </Text>
          </TouchableOpacity>

          {/* もういちど/はじめからボタン */}
          <TouchableOpacity 
            onPress={isLastChapterCompleted ? onRestartFromBeginning : onReplay}
            style={styles.controlButton}
          >
            <View style={styles.floatingButton}>
              <ReplayIcon 
                width={24} 
                height={24} 
                fillColor={"white"}
                strokeColor='transparent'
              />
            </View>
            <Text style={styles.controlButtonText}>
              {isLastChapterCompleted ? 'はじめから' : 'もういちど'}
            </Text>
          </TouchableOpacity>

          {/* つぎ/はじめる/もういちど/はじめからボタン */}
          <TouchableOpacity 
            onPress={isLastChapterCompleted ? onRestartFromBeginning : handleMainButtonPress}
            style={styles.controlButton}
          >
            <View style={styles.floatingButton}>
              {isLastChapterCompleted ? (
                <SkipBackwardIcon 
                  width={24} 
                  height={24} 
                  fillColor="white"
                />
              ) : (
                <SkipNextIcon 
                  width={24} 
                  height={24} 
                  fillColor="white" 
                  strokeColor='transparent' 
                />
              )}
            </View>
            <Text style={styles.controlButtonText}>
              {isLastChapterCompleted 
                ? getLocalizedText({ ja: 'はじめから', en: 'Restart' })
                : getLocalizedText({ ja: 'つぎ', en: 'Next' })
              }
            </Text>
          </TouchableOpacity>
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
  speedControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  speedButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  speedDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  speedText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
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
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    paddingVertical: 12,
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
  controlButtonText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.1,
    elevation: 0,
  },
  disabledText: {
    color: '#ccc',
  },
});

export default VideoPlayerPortrait;
