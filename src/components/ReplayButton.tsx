import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { ReplayIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';

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
      ]).start();
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
        <View style={[
          styles.balloon,
          styles.balloonTopLeft,
          isDisabled && styles.balloonDisabled
        ]}>
          <Text style={[
            styles.controlButtonText,
            isDisabled && styles.textDisabled
          ]}>
            {getLocalizedText({ ja: 'もういちど', en: 'Replay' })}
          </Text>
          <SpeedButtonTail
            fillColor={isDisabled ? 'rgba(208, 205, 205, 0.3)' : 'rgba(209, 200, 194, 0.5)'}
            isBottom={false}
            isRight={false}
            isUp={true}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    paddingVertical: 12,
    gap: 10,
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
    backgroundColor: '#F7F6F2',
    borderWidth: 2,
    borderColor: '#57534D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloon: {
    backgroundColor: 'rgba(209, 200, 194, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
  },
  balloonTopLeft: {
    borderTopLeftRadius: 0,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  balloonDisabled: {
    backgroundColor: 'rgba(208, 205, 205, 0)',
  },
  textDisabled: {
    color: '#fff',
  },
});

export default ReplayButton;
