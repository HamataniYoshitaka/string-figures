import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import ProgressDots from '../components/ProgressDots';
import VideoControlPanel from '../components/VideoControlPanel';
import { BookmarkIcon } from '../components/icons';
import { CHAPTER_VIDEOS } from '../data/chapterVideos';

const VideoPlayerLandscape: React.FC<VideoPlayerSharedProps> = ({
  stringFigure,
  chapters,
  currentChapterIndex,
  playbackRate,
  videoRef,
  onPlaybackStatusUpdate,
  onVideoLoad,
  getLocalizedText,
  getChapterProgress,
  bookmarked,
  onToggleBookmark,
  ...restProps
}) => {
  
  // デバッグ用ログ
  console.log('VideoPlayerLandscape - stringFigure:', stringFigure);
  
  // stringFigureが未定義の場合の早期リターン
  if (!stringFigure || !chapters || !chapters[currentChapterIndex]) {
    // console.log('VideoPlayerLandscape - Invalid stringFigure or chapter data');
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>データを読み込み中...</Text>
        </View>
      </View>
    );
  }
  
  // 各章の字幕テキストを一度だけ取り出し
  const subtitle = getLocalizedText(chapters[currentChapterIndex].subtitle);

  return (
    <View style={styles.container}>
      {/* ブックマークボタン */}
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={onToggleBookmark}
      >
        <BookmarkIcon
          width={40}
          height={40}
          strokeColor={bookmarked ? 'transparent' : '#ffffff'}
          fillColor={bookmarked ? '#FB2C36' : '#aaa'}
          strokeWidth={1.5}
        />
      </TouchableOpacity>

      {/* 動画エリア */}
      <View style={styles.videoArea}>
        <View style={[styles.videoPlayer]}>
          <Video
            key={`chapter-${currentChapterIndex}`}
            ref={videoRef}
            source={CHAPTER_VIDEOS[stringFigure.directory]?.[currentChapterIndex + 1]}
            
            // source={typeof stringFigure.chapters[currentChapterIndex].videoUrl === 'string' 
            //   ? { uri: stringFigure.chapters[currentChapterIndex].videoUrl } 
            //   : stringFigure.chapters[currentChapterIndex].videoUrl
            // }
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
            <View style={styles.subtitleStack} pointerEvents="none">
              {/* 影だけを同じ位置に重ねる（回数で濃さ調整） */}
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow]}>{subtitle}</Text>

              {/* 本体テキスト */}
              <Text style={styles.subtitleText}>{subtitle}</Text>
            </View>
          </View>
        </View>

        {/* 進捗バー */}
        <View style={styles.progressContainer}>
        <ProgressDots 
          chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            getChapterProgress={getChapterProgress}
          />
        </View>
      </View>

      {/* コントロールエリア */}
      {chapters.length > 0 && 
        <VideoControlPanel
          stringFigure={stringFigure}
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          playbackPosition={restProps.playbackPosition}
          isLastChapterCompleted={restProps.isLastChapterCompleted}
          playbackRate={playbackRate}
          PLAYBACK_RATES={restProps.PLAYBACK_RATES}
          isLandscapeMode={restProps.isLandscapeMode}
          currentLanguage={restProps.currentLanguage}
          recognizing={restProps.recognizing}
          nextChapterButtonRef={restProps.nextChapterButtonRef as React.RefObject<any>}
          replayButtonRef={restProps.replayButtonRef as React.RefObject<any>}
          previousChapterButtonRef={restProps.previousChapterButtonRef as React.RefObject<any>}
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
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#e8e6e0',
    position: 'relative',
  },
  bookmarkButton: {
    position: 'absolute',
    top: -8,
    right: 16,
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
  // 重ね描き用のコンテナ（重ねテキストの基準位置）
  subtitleStack: {
    position: 'relative',
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(60, 60, 60, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,  
    fontFamily: 'KleeOne-SemiBold',
  },
  // 影用テキスト（同じ位置に配置して影だけを重ねる）
  subtitleShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    // color: 'transparent',                 // 本体色は表示しない
    textShadowColor: 'rgba(60, 60, 60, 1)',  // 影のみ
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,                  // 影の広がり（好みで調整）
  },
  progressContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
});

export default VideoPlayerLandscape;
