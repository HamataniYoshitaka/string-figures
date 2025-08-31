import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

import PlaySpeedIcon from './icons/PlaySpeed';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface SpeedControlLandscapeProps {
  playbackRate: number;
  PLAYBACK_RATES: number[];
  currentLanguage: 'ja' | 'en';
  onSlowerSpeed: () => void;
  onFasterSpeed: () => void;
  getPlaybackRateDisplay: (rate: number) => string;
}

const SpeedControlLandscape: React.FC<SpeedControlLandscapeProps> = ({
  playbackRate,
  PLAYBACK_RATES,
  currentLanguage,
  onSlowerSpeed,
  onFasterSpeed,
  getPlaybackRateDisplay,
}) => {
  // 多言語対応のヘルパー関数
  const getLocalizedText = (textObj: { ja: string; en: string }) => {
    return textObj[currentLanguage];
  };

  // アニメーション用のrefs
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
    <View style={styles.speedContainer}>
      <View style={styles.speedDisplay}>
        <PlaySpeedIcon width={24} height={24} fillColor="#292524" strokeColor="#57534D" />
        <Text style={styles.speedText}>{getPlaybackRateDisplay(playbackRate)}x</Text>
      </View>
      <View style={styles.speedButtons}>
        <TouchableWithoutFeedback 
          onPress={onSlowerSpeed}
          onPressIn={PLAYBACK_RATES.indexOf(playbackRate) === 0 ? undefined : createPressInHandler(slowerSpeedScale)}
          onPressOut={PLAYBACK_RATES.indexOf(playbackRate) === 0 ? undefined : createPressOutHandler(slowerSpeedScale)}
          disabled={PLAYBACK_RATES.indexOf(playbackRate) === 0}
        >
          <Animated.View 
            style={[
              styles.speedButton, 
              styles.speedButtonTop,
              PLAYBACK_RATES.indexOf(playbackRate) === 0 && styles.speedButtonDisabled,
              { transform: [{ scale: slowerSpeedScale }] }
            ]}
          >
            <Text style={[
              styles.speedButtonText,
              PLAYBACK_RATES.indexOf(playbackRate) === 0 && styles.speedButtonTextDisabled
            ]}>{getLocalizedText({ ja: 'ゆっくり', en: 'Slower' })}</Text>
            <SpeedButtonTail 
              fillColor={PLAYBACK_RATES.indexOf(playbackRate) === 0 ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
              isBottom={true}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback 
          onPress={onFasterSpeed}
          onPressIn={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 ? undefined : createPressInHandler(fasterSpeedScale)}
          onPressOut={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 ? undefined : createPressOutHandler(fasterSpeedScale)}
          disabled={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1}
        >
          <Animated.View 
            style={[
              styles.speedButton, 
              styles.speedButtonBottom,
              PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 && styles.speedButtonDisabled,
              { transform: [{ scale: fasterSpeedScale }] }
            ]}
          >
            <Text style={[
              styles.speedButtonText,
              PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 && styles.speedButtonTextDisabled
            ]}>{getLocalizedText({ ja: 'はやく', en: 'Faster' })}</Text>
            <SpeedButtonTail 
              fillColor={PLAYBACK_RATES.indexOf(playbackRate) === PLAYBACK_RATES.length - 1 ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
              isBottom={false}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  speedDisplay: {
    alignItems: 'center',
    width: 68,
  },
  speedButtons: {
    gap: 8,
  },
  speedButton: {
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    position: 'relative',
  },
  speedButtonTop: {
    borderBottomLeftRadius: 0,
  },
  speedButtonBottom: {
    borderTopLeftRadius: 0,
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
  speedText: {
    fontSize: 16,
    color: '#292524',
    fontWeight: '400',
    marginTop: 2,
  },
});

export default SpeedControlLandscape;
