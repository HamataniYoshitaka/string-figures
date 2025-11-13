import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

import { VideoPlayerSharedProps } from './VideoPlayerScreen';
import ProgressDots from '../components/ProgressDots';
import VideoControlPanel from '../components/VideoControlPanel';
import { BookmarkIcon, CloseIcon } from '../components/icons';
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

  const backButtonScale = useRef(new Animated.Value(1)).current;

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
  if (!stringFigure || !chapters || !chapters[currentChapterIndex]) {
    // console.log('VideoPlayerLandscape - Invalid stringFigure or chapter data');
    const fallbackTitle = stringFigure
      ? getLocalizedText({
          ja: stringFigure.name.ja,
          en: stringFigure.name.en,
        })
      : '読み込み中...';

    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.header}>
          <TouchableWithoutFeedback
            onPress={restProps.onGoBack}
            onPressIn={createPressInHandler(backButtonScale)}
            onPressOut={createPressOutHandler(backButtonScale)}
          >
            <Animated.View
              style={[
                styles.backButton,
                { transform: [{ scale: backButtonScale }] },
              ]}
            >
              <CloseIcon width={24} height={24} fillColor="#79716B" />
            </Animated.View>
          </TouchableWithoutFeedback>
          <Text style={styles.title} numberOfLines={1}>
            {fallbackTitle}
          </Text>
        </View>
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
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
              <Text style={[styles.subtitleText, styles.subtitleShadow, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>

              {/* 本体テキスト */}
              <Text style={[styles.subtitleText, restProps.currentLanguage === 'en' && { fontSize: 15 }]}>{subtitle}</Text>
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
    backgroundColor: '#F7F5F2',
    position: 'relative',
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#F7F5F2',
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 20,
  },
  title: {
    fontFamily: 'KleeOne-SemiBold',
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
    color: '#2c2c2c',
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
    textShadowColor: 'rgba(45, 45, 45, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,  
    fontFamily: 'KleeOne-SemiBold',
  },
  // 影用テキスト（同じ位置に配置して影だけを重ねる）
  subtitleShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    // color: 'transparent',                 // 本体色は表示しない
    textShadowColor: 'rgba(45, 45, 45, 1)',  // 影のみ
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,                  // 影の広がり（好みで調整）
  },
  progressContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
});

export default VideoPlayerLandscape;
