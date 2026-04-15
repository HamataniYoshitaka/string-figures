import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { ArrowLeftIcon } from './icons';
import BalloonTail from './icons/BalloonTail';

interface NonverbalPreviousChapterButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  isTemporarilyDisabled?: boolean;
}

export interface PreviousChapterButtonRef {
  triggerRipple: () => void;
}

const NonverbalPreviousChapterButton = forwardRef<PreviousChapterButtonRef, NonverbalPreviousChapterButtonProps>(({
  onPress,
  currentChapterIndex,
  getLocalizedText,
  isTemporarilyDisabled = false,
}, ref) => {
  const isDisabled = currentChapterIndex === 0 || isTemporarilyDisabled;
  const [pressAnim] = useState(new Animated.Value(0));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [rippleOpacity] = useState(new Animated.Value(0));
  const [balloonColorAnim] = useState(new Animated.Value(0));

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(pressAnim, {
        toValue: 1,
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
      Animated.spring(pressAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

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
    outputRange: ['rgba(209, 200, 194, 0.5)', 'rgba(255, 98, 63, 0.5)'],
  });
  const pressTranslate = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
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
          <View style={[styles.shadowCircle, isDisabled && styles.shadowHidden]} />
          <Animated.View
            style={[
              styles.ripple,
              {
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.floatingButton,
              isDisabled && styles.disabledButton,
              { transform: [{ translateX: pressTranslate }, { translateY: pressTranslate }] },
            ]}
          >
            <ArrowLeftIcon
              width={36}
              height={36}
              fillColor="#44403c"
              strokeColor="transparent"
            />
          </Animated.View>
        </View>
        <View style={styles.balloonContainer}>
          <Animated.View
            style={[
              styles.balloon,
              styles.balloonTopLeft,
              isDisabled && styles.balloonDisabled,
              !isDisabled && { backgroundColor: balloonColor },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.25}
              style={styles.controlButtonText}
            >
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
    backgroundColor: '#FF623F',
  },
  shadowCircle: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    left: 4,
    top: 4,
  },
  shadowHidden: {
    opacity: 0,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F5F2',
    borderWidth: 2,
    borderColor: '#44403c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloonContainer: {
    position: 'absolute',
    left: 16,
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

export default NonverbalPreviousChapterButton;
