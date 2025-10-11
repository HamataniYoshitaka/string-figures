import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { TouchableWithoutFeedback, Animated, View, Text, StyleSheet } from 'react-native';
import { ReplayIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface ReplayLandscapeButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  playbackPosition: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

export interface ReplayLandscapeButtonRef {
  triggerRipple: () => void;
}

const ReplayLandscapeButton = forwardRef<ReplayLandscapeButtonRef, ReplayLandscapeButtonProps>(({
  onPress,
  currentChapterIndex,
  playbackPosition,
  getLocalizedText,
}, ref) => {
  const isDisabled = currentChapterIndex === 0 && playbackPosition === 0;
  const [scaleAnim] = useState(new Animated.Value(1));
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const balloonColorAnim = useRef(new Animated.Value(0)).current;

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
      onPressIn={!isDisabled ? handlePressIn : undefined}
      onPressOut={!isDisabled ? handlePressOut : undefined}
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
        <Animated.View style={[
          styles.balloon,
          styles.balloonTop,
          isDisabled && styles.balloonDisabled,
          !isDisabled && { backgroundColor: balloonColor }
        ]}>
          <Text style={[
            isDisabled && styles.balloonTextDisabled
          ]}>{getLocalizedText({ ja: 'もういちど', en: 'Replay' })}</Text>
          <SpeedButtonTail
            fillColor={isDisabled ? 'rgba(208, 205, 205, 0.3)' : 'rgba(209, 200, 194, 0.5)'}
            isBottom={true}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 12,
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
    backgroundColor: '#e8e6e0',
    borderWidth: 2,
    borderColor: '#57534D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  balloon: {
    backgroundColor: 'rgba(209, 200, 194, 0.5)',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
    color: '#57534D',
    fontWeight: '400',
  },
  balloonTop: {
    borderBottomLeftRadius: 0,
  },
  balloonDisabled: {
    opacity: 0.0,
  },
  balloonTextDisabled: {
    color: '#999',
  },
});

export default ReplayLandscapeButton;
