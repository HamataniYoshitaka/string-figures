import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { SkipPreviousIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';
import BalloonTail from './icons/BalloonTail';

interface PreviousChapterButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

export interface PreviousChapterButtonRef {
  triggerRipple: () => void;
}

const PreviousChapterButton = forwardRef<PreviousChapterButtonRef, PreviousChapterButtonProps>(({
  onPress,
  currentChapterIndex,
  getLocalizedText,
}, ref) => {
  const isDisabled = currentChapterIndex === 0;
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [rippleOpacity] = useState(new Animated.Value(0));
  const [balloonColorAnim] = useState(new Animated.Value(0));

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

  const triggerRippleEffect = () => {
    if (currentChapterIndex > 1) {
      rippleAnim.setValue(0);
      rippleOpacity.setValue(1);
      balloonColorAnim.setValue(1);
      Animated.parallel([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(balloonColorAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      rippleAnim.setValue(0);
      rippleOpacity.setValue(0);
      balloonColorAnim.setValue(0);
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // リップルエフェクト開始
      triggerRippleEffect();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerRipple: triggerRippleEffect,
  }));

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const balloonColor = balloonColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(209, 200, 194, 0.5)', 'rgba(194, 65, 12, 0.5)'],
  });

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <View style={styles.controlButton}>
        <View style={styles.buttonContainer}>
          {/* リップルエフェクト */}
          <Animated.View
            style={[
              styles.ripple,
              {
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
          {/* ボタン本体 */}
          <Animated.View style={[
            styles.floatingButton,
            isDisabled && styles.disabledButton,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <SkipPreviousIcon
              width={24}
              height={24}
              fillColor="#57534D"
              strokeColor='transparent'
            />
          </Animated.View>
        </View>
        <View style={styles.balloonContainer}>
          <Animated.View style={[
            styles.balloon,
            styles.balloonTopLeft,
            isDisabled && styles.balloonDisabled,
            !isDisabled && { backgroundColor: balloonColor }
          ]}>
            <Text style={[styles.controlButtonText]}>
              {getLocalizedText({ ja: 'まえ', en: 'Previous' })}
            </Text>
            <BalloonTail
              fillColor="rgba(209, 200, 194, 0.5)"
              position="topleft"
            />
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  controlButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 48,
    position: 'relative',
    // paddingVertical: 12,
    // gap: 10,
  },
  buttonContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#c2410c',
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F5F2',
    borderWidth: 2,
    borderColor: '#57534D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloonContainer: {
    position: 'absolute',
    left: 0,
    bottom: -44,
    width: 100,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  balloon: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balloonTopLeft: {
    borderTopLeftRadius: 0,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  balloonDisabled: {
    opacity: 0.0,
  },
});

export default PreviousChapterButton;
