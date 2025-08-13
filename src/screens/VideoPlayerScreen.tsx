import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

import { RootStackParamList } from '../types';
import { SkipNextIcon, SkipPreviousIcon, ReplayIcon, CloseIcon, SkipBackwardIcon } from '../components/icons';
import PlaySpeedIcon from '../components/icons/PlaySpeed';
import ProgressBars from '../components/ProgressBars';

type VideoPlayerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VideoPlayer'
>;
type VideoPlayerScreenRouteProp = RouteProp<RootStackParamList, 'VideoPlayer'>;

interface Props {
  navigation: VideoPlayerScreenNavigationProp;
  route: VideoPlayerScreenRouteProp;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 再生速度の設定配列
const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stringFigure } = route.params;
  
  // ステート管理
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLastChapterCompleted, setIsLastChapterCompleted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const videoRef = useRef<Video>(null);

  // アプリ起動時に保存された言語設定を読み込む
  useEffect(() => {
    loadLanguageSetting();
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

  // 現在の言語を取得（後でAppSettingsから取得するように変更予定）
  // const currentLanguage: 'ja' | 'en' = 'ja'; // デフォルトは日本語

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
        } 
        // それ以外の場合は次のchapterへ進む
        else if (currentChapterIndex < stringFigure.chapters.length - 1) {
          setShouldAutoPlay(true);
          setCurrentChapterIndex(prev => prev + 1);
          setPlaybackPosition(0); // 新しいチャプターの開始時は進捗をリセット
        }
      }
    } catch (error) {
      console.error('Error handling next chapter:', error);
    }
  };

  const handleGoBack = () => {
    console.log('handleGoBack');
    navigation.goBack();
  };

  // もういちどボタンの処理
  const handleReplay = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.setPositionAsync(0);
      setPlaybackPosition(0);
      await videoRef.current.playAsync();
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

  // さいしょからボタンの処理
  const handleRestartFromBeginning = async () => {
    try {
      setShouldAutoPlay(true);
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

  return (
    <View style={styles.outerContainer}>
      <View style={styles.rotatedContainer}>
        {/* 右側の動画エリア（absoluteで配置） */}
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
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              onLoad={handleVideoLoad}
            />
            
            {/* 字幕エリア - 動画の上に重ねて表示 */}
            <View style={styles.subtitleArea}>
              <Text style={styles.subtitleText}>
                {getLocalizedText(stringFigure.chapters[currentChapterIndex].subtitle)}
              </Text>
            </View>
          </View>

          {/* 進捗バー */}
          <ProgressBars 
            chapters={stringFigure.chapters}
            currentChapterIndex={currentChapterIndex}
            getChapterProgress={getChapterProgress}
          />
        </View>

        {/* 左側のコントロールエリア（動画の上に重ねて表示） */}
        <View style={styles.leftPanel}>
          {/* 戻るボタン */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <CloseIcon width={32} height={32} fillColor="#79716B" />
          </TouchableOpacity>

          {/* コントロールボタン */}
          <View style={styles.controlsContainer}>
            {isLastChapterCompleted ? (
              <TouchableOpacity style={styles.controlButton} onPress={handleRestartFromBeginning}>
                <View style={styles.floatingButton}>
                  <SkipBackwardIcon width={24} height={24} fillColor="white" />
                </View>
                <Text style={styles.controlLabel}>さいしょから</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={currentChapterIndex < stringFigure.chapters.length - 1 ? handleNextChapter : undefined}
                disabled={currentChapterIndex === stringFigure.chapters.length - 1}
              >
                <View style={[
                  styles.floatingButton,
                  currentChapterIndex === stringFigure.chapters.length - 1 && styles.disabledButton
                ]}>
                  <SkipNextIcon width={24} height={24} fillColor="white" strokeColor='transparent' />
                </View>
                <Text style={[
                  styles.controlLabel,
                  currentChapterIndex === stringFigure.chapters.length - 1 && styles.disabledLabel
                ]}>つぎ</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={currentChapterIndex === 0 && playbackPosition === 0 ? undefined : handleReplay}
              disabled={currentChapterIndex === 0 && playbackPosition === 0}
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
              <Text style={[
                styles.controlLabel,
                currentChapterIndex === 0 && playbackPosition === 0 && styles.disabledLabel
              ]}>もういちど</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={currentChapterIndex > 0 ? handlePreviousChapter : undefined}
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
              <Text style={[
                styles.controlLabel,
                currentChapterIndex === 0 && styles.disabledLabel
              ]}>まえ</Text>
            </TouchableOpacity>
          </View>

          {/* 再生速度 */}
          <View style={styles.speedContainer}>
            <View style={styles.speedDisplay}>
              <PlaySpeedIcon width={24} height={24} fillColor="#292524" strokeColor="#57534D" />
              <Text style={styles.speedText}>{playbackRate}x</Text>
            </View>
            <View style={styles.speedButtons}>
              <TouchableOpacity 
                style={[
                  styles.speedButton, 
                  styles.speedButtonTop,
                  PLAYBACK_RATES.indexOf(playbackRate) === 0 && styles.speedButtonDisabled
                ]}
                onPress={handleSlowerSpeed}
                disabled={PLAYBACK_RATES.indexOf(playbackRate) === 0}
              >
                <Text style={[
                  styles.speedButtonText,
                  PLAYBACK_RATES.indexOf(playbackRate) === 0 && styles.speedButtonTextDisabled
                ]}>ゆっくり</Text>
                <View style={[
                  styles.speedButtonTail,
                  PLAYBACK_RATES.indexOf(playbackRate) === 0 && styles.speedButtonTailDisabled
                ]} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.speedButton, 
                  styles.speedButtonBottom,
                  PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 && styles.speedButtonDisabled
                ]}
                onPress={handleFasterSpeed}
                disabled={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1}
              >
                <Text style={[
                  styles.speedButtonText,
                  PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 && styles.speedButtonTextDisabled
                ]}>はやく</Text>
                <View style={[
                  styles.speedButtonTail, 
                  styles.speedButtonTailBottom,
                  PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 && styles.speedButtonTailDisabled
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatedContainer: {
    width: screenHeight,
    height: screenWidth,
    transform: [{ rotate: '90deg' }],
    position: 'relative',
  },
  leftPanel: {
    position: 'absolute',
    left: 36,
    top: 0,
    bottom: 0,
    width: 150,
    zIndex: 10,
    paddingVertical: 20,
    paddingHorizontal: 0,
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
  bookmarkButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  bookmarkIcon: {
    fontSize: 24,
    color: '#FFD700',
  },
  controlsContainer: {
    flex: 1,
    gap: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.1,
  },
  controlIcon: {
    fontSize: 20,
    color: 'white',
    marginBottom: 4,
  },
  controlLabel: {
    fontSize: 11,
    color: 'black',
    fontWeight: '400',
  },
  disabledLabel: {
    color: '#999',
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  speedDisplay: {
    alignItems: 'center',
    width: 52,
  },
  speedButtons: {
    gap: 6,
  },
  speedButton: {
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    position: 'relative',
  },
  speedButtonTop: {
    borderBottomLeftRadius: 0,
  },
  speedButtonBottom: {
    borderTopRightRadius: 0,
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
  speedButtonTail: {
    position: 'absolute',
    left: -4,
    top: 12,
    width: 8,
    height: 8,
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
    transform: [{ rotate: '45deg' }],
  },
  speedButtonTailDisabled: {
    backgroundColor: 'rgba(208, 205, 205, 0.3)',
  },
  speedButtonTailBottom: {
    top: -4,
    transform: [{ rotate: '45deg' }],
  },
  speedText: {
    fontSize: 16,
    color: '#292524',
    fontWeight: '400',
    marginTop: 2,
  },
  videoArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingEnd: 12,
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 16 / 9,
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  subtitleArea: {
    position: 'absolute',
    bottom: 60, // 進捗バーの上に配置
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subtitleText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#2196F3',
  },
});

export default VideoPlayerScreen;
