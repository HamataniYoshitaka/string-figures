import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { SkipBackwardIcon } from './icons';
import BalloonTail from './icons/BalloonTail';
import type { RestartButtonRef } from './RestartButton';

interface NonverbalRestartTopBalloonProps {
  onPress: () => void;
  currentChapterIndex: number;
  currentLanguage: string;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  isTemporarilyDisabled?: boolean;
}

const BALLOON_BG = 'rgba(209, 200, 194, 0.5)';

const NonverbalRestartTopBalloon = forwardRef<
  RestartButtonRef,
  NonverbalRestartTopBalloonProps
>(({ onPress, currentChapterIndex, currentLanguage, getLocalizedText, isTemporarilyDisabled = false }, ref) => {
  const isDisabled = isTemporarilyDisabled;
  const [scaleAnim] = useState(new Animated.Value(1));
  const [balloonColorAnim] = useState(new Animated.Value(0));

  const triggerRippleEffect = () => {
    if (currentChapterIndex > 1) {
      balloonColorAnim.setValue(1);
      Animated.timing(balloonColorAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
    } else {
      balloonColorAnim.setValue(0);
    }
  };

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      triggerRippleEffect();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerRipple: triggerRippleEffect,
  }));

  const balloonColor = balloonColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BALLOON_BG, 'rgba(194, 65, 12, 0.5)'],
  });

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          styles.balloonOuter,
          isDisabled && styles.balloonDisabled,
          { width: currentLanguage === 'ja' ? 120 : 100 },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.View
          style={[
            styles.balloon,
            !isDisabled && { backgroundColor: balloonColor },
          ]}
        >
          <SkipBackwardIcon
            width={24}
            height={24}
            fillColor="#44403c"
            strokeColor="transparent"
          />
          <Text maxFontSizeMultiplier={1.25} style={styles.balloonText}>
            {getLocalizedText({ ja: 'はじめから', en: 'Restart' })}
          </Text>
        </Animated.View>
        <BalloonTail fillColor={BALLOON_BG} position="topcenter" />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  balloonOuter: {
    position: 'relative',
    alignSelf: 'center',
  },
  balloon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: BALLOON_BG,
  },
  balloonText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    lineHeight: 18,
  },
  balloonDisabled: {
    opacity: 0.5,
  },
});

export default NonverbalRestartTopBalloon;
