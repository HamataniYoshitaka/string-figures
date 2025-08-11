import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList } from '../types';
import { SkipNextIcon, SkipPreviousIcon, ReplayIcon } from '../components/icons';

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

const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stringFigure } = route.params;

  const handleGoBack = () => {
    console.log('handleGoBack');
    navigation.goBack();
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.rotatedContainer}>
        {/* 右側の動画エリア（absoluteで配置） */}
        <View style={styles.videoArea}>
          <View style={styles.videoPlayer}>
            <Text style={styles.videoPlaceholder}>動画プレイヤー</Text>
            <Text style={styles.videoTitle}>{stringFigure.name}</Text>
            
            {/* 字幕エリア - 動画の上に重ねて表示 */}
            <View style={styles.subtitleArea}>
              <Text style={styles.subtitleText}>
                右手の人差し指で、左手中指の手前の糸を下から取ります
              </Text>
            </View>
          </View>

          {/* 進捗バー */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        {/* 左側のコントロールエリア（動画の上に重ねて表示） */}
        <View style={styles.leftPanel}>
          {/* 戻るボタン */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* コントロールボタン */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <View style={styles.floatingButton}>
                <SkipNextIcon width={24} height={24} fillColor="white" />
              </View>
              <Text style={styles.controlLabel}>つぎ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <View style={styles.floatingButton}>
                <ReplayIcon width={24} height={24} fillColor="white" />
              </View>
              <Text style={styles.controlLabel}>もういちど</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <View style={styles.floatingButton}>
                <SkipPreviousIcon width={24} height={24} fillColor="white" />
              </View>
              <Text style={styles.controlLabel}>まえ</Text>
            </TouchableOpacity>
          </View>

          {/* 再生速度 */}
          <View style={styles.speedContainer}>
            <TouchableOpacity style={styles.speedButton}>
              <Text style={styles.speedIcon}>⚙</Text>
              <Text style={styles.speedText}>1.0x</Text>
            </TouchableOpacity>
            <Text style={styles.speedLabel}>はやく</Text>
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
    left: 8,
    top: 0,
    bottom: 0,
    width: 150,
    zIndex: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
  speedContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  speedButton: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  speedIcon: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  speedText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  speedLabel: {
    fontSize: 11,
    color: 'white',
    marginTop: 4,
  },
  videoArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#33f',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 16 / 9,
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
