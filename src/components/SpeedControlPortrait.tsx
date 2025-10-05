import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import PlaySpeedIcon from './icons/PlaySpeed';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface SpeedControlPortraitProps {
  playbackRate: number;
  onSlowerSpeed: () => void;
  onFasterSpeed: () => void;
  getPlaybackRateDisplay: (rate: number) => string;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

const SpeedControlPortrait: React.FC<SpeedControlPortraitProps> = ({
  playbackRate,
  onSlowerSpeed,
  onFasterSpeed,
  getPlaybackRateDisplay,
  getLocalizedText,
}) => {
  // アニメーション用のスケール値
  const slowerSpeedScale = useRef(new Animated.Value(1)).current;
  const fasterSpeedScale = useRef(new Animated.Value(1)).current;
  
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

  return (
    <View style={styles.speedControlContainer}>
      <TouchableWithoutFeedback 
        onPress={onSlowerSpeed}
        onPressIn={createPressInHandler(slowerSpeedScale)}
        onPressOut={createPressOutHandler(slowerSpeedScale)}
      >
        <Animated.View 
          style={[
            styles.speedButton, 
            styles.speedButtonBottomRight,
            { transform: [{ scale: slowerSpeedScale }] }
          ]}
        >
          <Text style={styles.speedButtonText}>{getLocalizedText({ ja: 'ゆっくり', en: 'Slower' })}</Text>
          <SpeedButtonTail 
            fillColor="rgba(209, 200, 194, 0.5)"
            isBottom={true}
            isRight={true}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
      
      <View style={styles.speedDisplay}>
        <PlaySpeedIcon width={32} height={32} fillColor="#292524" strokeColor="#57534D" />
        <Text style={styles.speedText}>{getPlaybackRateDisplay(playbackRate)}x</Text>
      </View>
      
      <TouchableWithoutFeedback 
        onPress={onFasterSpeed}
        onPressIn={createPressInHandler(fasterSpeedScale)}
        onPressOut={createPressOutHandler(fasterSpeedScale)}
      >
        <Animated.View 
          style={[
            styles.speedButton, 
            styles.speedButtonBottomLeft,
            { transform: [{ scale: fasterSpeedScale }] }
          ]}
        >
          <Text style={styles.speedButtonText}>{getLocalizedText({ ja: 'はやく', en: 'Faster' })}</Text>
          <SpeedButtonTail 
            fillColor="rgba(209, 200, 194, 0.5)"
            isBottom={true}
            isRight={false}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  speedControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  speedButton: {
    backgroundColor: 'rgba(209, 200, 194, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
  },
  speedButtonBottomRight: {
    borderBottomRightRadius: 0,
  },
  speedButtonBottomLeft: {
    borderBottomLeftRadius: 0,
  },
  speedButtonText: {
    fontSize: 14,
    color: '#57534D',
    fontWeight: '400',
  },
  speedDisplay: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  speedText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

export default SpeedControlPortrait;
