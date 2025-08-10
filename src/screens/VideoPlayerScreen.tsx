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
      {/* 左側のコントロールエリア */}
      <View style={styles.leftPanel}>
        {/* 戻るボタン */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* ブックマークボタン */}
        <TouchableOpacity style={styles.bookmarkButton}>
          <Text style={styles.bookmarkIcon}>
            {stringFigure.isBookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>

        {/* コントロールボタン */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏮</Text>
            <Text style={styles.controlLabel}>つぎ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏪</Text>
            <Text style={styles.controlLabel}>もういちど</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>⏭</Text>
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

      {/* 右側の動画エリア */}
      <View style={styles.videoArea}>
        <View style={styles.videoPlayer}>
          <Text style={styles.videoPlaceholder}>動画プレイヤー</Text>
          <Text style={styles.videoTitle}>{stringFigure.name}</Text>
        </View>

        {/* 字幕エリア */}
        <View style={styles.subtitleArea}>
          <Text style={styles.subtitleText}>
            右手の人差し指で、左手中指の手前の糸を下から取ります
          </Text>
        </View>

        {/* 進捗バー */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatedContainer: {
    width: screenHeight,
    height: screenWidth,
    transform: [{ rotate: '90deg' }],
    flexDirection: 'row',
  },
  leftPanel: {
    width: screenHeight * 0.25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
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
    gap: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
  },
  controlIcon: {
    fontSize: 20,
    color: 'white',
    marginBottom: 4,
  },
  controlLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  speedContainer: {
    alignItems: 'center',
  },
  speedButton: {
    alignItems: 'center',
    padding: 8,
  },
  speedIcon: {
    fontSize: 18,
    color: 'white',
    marginBottom: 4,
  },
  speedText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  speedLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
  videoArea: {
    flex: 1,
    justifyContent: 'center',
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
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
