import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { CHAPTER_VIDEOS } from '../data/chapterVideos';

interface Props {
  directory: string;
}

const PreviewVideoPlayer: React.FC<Props> = ({ directory }) => {
  // CHAPTER_VIDEOSから動画配列を取得
  const videoMap = CHAPTER_VIDEOS[directory];
  
  // 動画が存在しない場合の処理
  if (!videoMap) {
    return (
      <View style={styles.placeholder}>
        {/* プレースホルダーは親コンポーネントで処理 */}
      </View>
    );
  }

  // 動画配列を取得（チャプター番号1から始まるので、ソートして配列に変換）
  const videoArray = Object.keys(videoMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(key => videoMap[key]);
  
  if (videoArray.length === 0) {
    return (
      <View style={styles.placeholder}>
        {/* プレースホルダーは親コンポーネントで処理 */}
      </View>
    );
  }

  // 現在表示中の動画インデックスと次に再生する動画インデックスを管理
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState<number | null>(null);
  const [isNextVideoReady, setIsNextVideoReady] = useState(false);
  const [isNextVideoPlaying, setIsNextVideoPlaying] = useState(false);
  
  const currentVideoRef = useRef<Video>(null);
  const nextVideoRef = useRef<Video>(null);

  // 現在の動画の再生状態を監視
  const handleCurrentPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // 動画が終了したら次の動画の準備を開始
    if (status.didJustFinish && nextVideoIndex === null) {
      const nextIndex = (currentVideoIndex + 1) % videoArray.length;
      setNextVideoIndex(nextIndex);
      setIsNextVideoReady(false);
      setIsNextVideoPlaying(false);
    }
  };

  // 次の動画の読み込み完了を検知
  const handleNextVideoLoad = () => {
    setIsNextVideoReady(true);
    // 次の動画を再生開始
    if (nextVideoRef.current) {
      nextVideoRef.current.playAsync();
    }
  };

  // 次の動画の再生状態を監視
  const handleNextPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // 次の動画が再生開始したら、現在の動画を非表示にして次の動画を表示
    if (status.isPlaying && !isNextVideoPlaying) {
      setIsNextVideoPlaying(true);
      // 現在の動画を停止
      if (currentVideoRef.current) {
        currentVideoRef.current.pauseAsync();
      }
      // 次の動画を現在の動画に切り替え
      setCurrentVideoIndex(nextVideoIndex!);
      setNextVideoIndex(null);
      setIsNextVideoReady(false);
      setIsNextVideoPlaying(false);
    }
  };

  // 現在の動画が表示されているかどうか
  const isCurrentVideoVisible = nextVideoIndex === null || !isNextVideoPlaying;
  // 次の動画が表示されているかどうか
  const isNextVideoVisible = nextVideoIndex !== null && isNextVideoPlaying;

  return (
    <View style={styles.container}>
      {/* 現在の動画 */}
      <Video
        key={`current-video-${currentVideoIndex}`}
        ref={currentVideoRef}
        source={videoArray[currentVideoIndex]}
        style={[
          styles.video,
          styles.videoAbsolute,
          !isCurrentVideoVisible && styles.videoHidden,
        ]}
        shouldPlay={true}
        isLooping={false}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        useNativeControls={false}
        onPlaybackStatusUpdate={handleCurrentPlaybackStatusUpdate}
      />
      
      {/* 次の動画（準備中） */}
      {nextVideoIndex !== null && (
        <Video
          key={`next-video-${nextVideoIndex}`}
          ref={nextVideoRef}
          source={videoArray[nextVideoIndex]}
          style={[
            styles.video,
            styles.videoAbsolute,
            !isNextVideoVisible && styles.videoHidden,
          ]}
          shouldPlay={false}
          isLooping={false}
          isMuted={true}
          resizeMode={ResizeMode.COVER}
          useNativeControls={false}
          onLoad={handleNextVideoLoad}
          onPlaybackStatusUpdate={handleNextPlaybackStatusUpdate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoHidden: {
    opacity: 0,
  },
  placeholder: {
    width: '100%',
    height: 240,
  },
});

export default PreviewVideoPlayer;

