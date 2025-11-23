import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { ReplayIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';
import BalloonTail from './icons/BalloonTail';

interface ReplayButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  playbackPosition: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

export interface ReplayButtonRef {
  triggerRipple: () => void;
}

const ReplayButton = forwardRef<ReplayButtonRef, ReplayButtonProps>(({
  onPress,
  currentChapterIndex,
  playbackPosition,
  getLocalizedText,
}, ref) => {
  const isDisabled = currentChapterIndex === 0 && playbackPosition === 0;
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
    if (!isDisabled) {
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
      onPress={!isDisabled ? onPress : undefined}
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
            <ReplayIcon
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
            isDisabled && styles.balloonDisabled,
            !isDisabled && { backgroundColor: balloonColor }
          ]}>
            <Text style={[
              styles.controlButtonText
            ]}>
              {getLocalizedText({ ja: 'もういちど', en: 'Replay' })}
            </Text>
            <BalloonTail
              fillColor={isDisabled ? 'rgba(208, 205, 205, 0.3)' : 'rgba(209, 200, 194, 0.5)'}
              position="topcenter"
            />
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    position: 'relative',
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
    left: -50,
    bottom: -44,
    width: 148,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  balloon: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
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
  }
});

export default ReplayButton;
