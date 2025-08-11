import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

import { StringFigure } from '../types';
import { EasyIcon, NormalIcon, HardIcon, PlayIcon } from './icons';

interface Props {
  isVisible: boolean;
  item: StringFigure | null;
  onClose: () => void;
  onPlayVideo: (item: StringFigure) => void;
}

const { height: screenHeight } = Dimensions.get('window');

const DetailBottomSheet: React.FC<Props> = ({
  isVisible,
  item,
  onClose,
  onPlayVideo,
}) => {
  const translateY = useSharedValue(screenHeight);

  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(screenHeight, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handlePlayPress = () => {
    if (item) {
      onPlayVideo(item);
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return EasyIcon;
      case 'medium': return NormalIcon;
      case 'hard': return HardIcon;
      default: return EasyIcon;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'かんたん';
      case 'medium': return 'ふつう';
      case 'hard': return 'むずかしい';
      default: return '';
    }
  };

  if (!isVisible || !item) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.bottomSheet, animatedStyle]}>
              {/* ハンドル */}
              <View style={styles.handle} />

              {/* コンテンツ */}
              <View style={styles.content}>
                {/* プレビュー動画エリア */}
                <View style={styles.imageContainer}>
                  {item.previewUrl ? (
                    <Video
                      source={typeof item.previewUrl === 'string' 
                        ? { uri: item.previewUrl } 
                        : item.previewUrl
                      }
                      style={styles.videoPreview}
                      shouldPlay={true}
                      isLooping={true}
                      isMuted={true}
                      resizeMode={ResizeMode.COVER}
                      useNativeControls={false}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imageText}>動画プレビュー</Text>
                    </View>
                  )}
                  
                  {/* 白のグラデーション */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)','rgba(255,255,255,0.4)', 'rgba(255,255,255,1.0)']}
                    style={styles.gradientOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                  
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPress}
                  >
                    <PlayIcon width={24} height={28} strokeWidth={3} />
                  </TouchableOpacity>
                </View>

                {/* サムネイル - プレビュー動画エリアに重ねる */}
                <View style={styles.thumbnailContainer}>
                  <View style={styles.thumbnail}>
                    {item.patternImage ? (
                      <Image 
                        source={typeof item.patternImage === 'string' 
                          ? { uri: item.patternImage } 
                          : item.patternImage
                        } 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.thumbnailText}>完成図</Text>
                    )}
                  </View>
                </View>

                {/* 作品情報 */}
                <View style={styles.infoContainer}>
                  <Text style={styles.title}>{item.name}</Text>
                  <View style={styles.difficultyContainer}>
                    {(() => {
                      const IconComponent = getDifficultyIcon(item.difficulty);
                      return <IconComponent width={28} height={28} strokeColor="#666" />;
                    })()}
                    <Text style={styles.difficultyText}>
                      {getDifficultyText(item.difficulty)}
                    </Text>
                  </View>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: screenHeight * 0.6,
    maxHeight: screenHeight * 0.8,
    overflow: 'hidden',
    position: 'relative',
  },
  handle: {
    position: 'absolute',
    top: 14,
    left: '50%',
    transform: [{ translateX: -30 }],
    width: 60,
    height: 5,
    backgroundColor: '#000000',
    opacity: 0.5,
    borderRadius: 3,
    alignSelf: 'center',
    zIndex: 100,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    width: '100%',
  },
  imagePlaceholder: {
    height: 240,
    width: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreview: {
    height: 240,
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  imageText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingStart: 4,
    elevation: 8,
  },
  thumbnailContainer: {
    position: 'absolute',
    top: 180,
    alignSelf: 'center',
    zIndex: 10,
  },
  thumbnail: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#79716B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailText: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'KleeOne-SemiBold',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 6,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'center',
  },
  difficultyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default DetailBottomSheet;
