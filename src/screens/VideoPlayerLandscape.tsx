import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import ProgressBars from '../components/ProgressBars';
import VideoControlPanel from '../components/VideoControlPanel';
import { BookmarkIcon } from '../components/icons';

const VideoPlayerLandscape: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  currentChapterIndex,
  playbackRate,
  videoRef,
  onPlaybackStatusUpdate,
  onVideoLoad,
  getLocalizedText,
  getChapterProgress,
  ...restProps
}) => {
  
  // デバッグ用ログ
  console.log('VideoPlayerLandscape - stringFigure:', stringFigure);
  
  // ダミーのブックマーク状態とハンドラー（後で実装）
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    console.log('Bookmark toggled:', !isBookmarked);
  };
  
  // stringFigureが未定義の場合の早期リターン
  if (!stringFigure || !stringFigure.chapters || !stringFigure.chapters[currentChapterIndex]) {
    console.error('VideoPlayerLandscape - Invalid stringFigure or chapter data');
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>データを読み込み中...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* ブックマークボタン */}
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={handleToggleBookmark}
      >
        <BookmarkIcon
          width={24}
          height={24}
          strokeColor={isBookmarked ? '#DC2626' : '#A6A09B'}
          fillColor={isBookmarked ? '#DC2626' : 'transparent'}
          strokeWidth={1.5}
        />
      </TouchableOpacity>

      {/* 動画エリア */}
      <View style={styles.videoArea}>
        <View style={[styles.videoPlayer]}>
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

      {/* コントロールエリア */}
      <VideoControlPanel
        stringFigure={stringFigure}
        currentChapterIndex={currentChapterIndex}
        playbackPosition={restProps.playbackPosition}
        isLastChapterCompleted={restProps.isLastChapterCompleted}
        playbackRate={playbackRate}
        PLAYBACK_RATES={restProps.PLAYBACK_RATES}
        isLandscapeMode={restProps.isLandscapeMode}
        currentLanguage={restProps.currentLanguage}
        recognizing={restProps.recognizing}
        onGoBack={restProps.onGoBack}
        onNextChapter={restProps.onNextChapter}
        onReplay={restProps.onReplay}
        onPreviousChapter={restProps.onPreviousChapter}
        onRestartFromBeginning={restProps.onRestartFromBeginning}
        onSlowerSpeed={restProps.onSlowerSpeed}
        onFasterSpeed={restProps.onFasterSpeed}
        onLandscapeToggle={restProps.onLandscapeToggle}
        getPlaybackRateDisplay={restProps.getPlaybackRateDisplay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    position: 'relative',
  },
  bookmarkButton: {
    position: 'absolute',
    top: -10,
    right: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
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
  videoArea: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 12,
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    aspectRatio: 16 / 9,
  },
  subtitleArea: {
    position: 'absolute',
    bottom: 0,
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
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    fontWeight: '500',
  },
});

export default VideoPlayerLandscape;
