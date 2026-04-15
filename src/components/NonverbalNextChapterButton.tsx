import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { ArrowRightIcon, CheckIcon } from './icons';
import { Chapter } from '../types';
import BalloonTail from './icons/BalloonTail';

interface NonverbalNextChapterButtonProps {
  onPress: () => void;
  chapters: Chapter[];
  isLastChapterCompleted: boolean;
  currentChapterIndex: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  isTemporarilyDisabled?: boolean;
}

export interface NextChapterButtonRef {
  triggerRipple: () => void;
}

const NonverbalNextChapterButton = forwardRef<NextChapterButtonRef, NonverbalNextChapterButtonProps>(({
  onPress,
  chapters,
  isLastChapterCompleted,
  currentChapterIndex,
  getLocalizedText,
  isTemporarilyDisabled = false,
}, ref) => {
  const isDisabled = (currentChapterIndex === chapters.length - 1 && !isLastChapterCompleted) || isTemporarilyDisabled;
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

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const balloonBackgroundColor = balloonColorAnim.interpolate({
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
          <Animated.View
            style={[
              styles.ripple,
              {
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
          {isLastChapterCompleted ? (
            <Animated.View
              style={[
                styles.floatingButton,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <CheckIcon
                width={26}
                height={26}
                fillColor="#44403c"
                strokeWidth={1}
                strokeColor="#44403c"
              />
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.floatingButton,
                { paddingLeft: 2 },
                isDisabled && styles.disabledButton,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <ArrowRightIcon
                width={36}
                height={36}
                fillColor="#57534D"
                strokeColor="transparent"
              />
            </Animated.View>
          )}
        </View>
        <View style={styles.balloonContainer}>
          <Animated.View
            style={[
              styles.balloon,
              styles.balloonTopRight,
              isDisabled && styles.balloonDisabled,
              { backgroundColor: balloonBackgroundColor },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.25}
              style={styles.controlButtonText}
            >
              {isLastChapterCompleted
                ? getLocalizedText({ ja: 'できた!', en: 'Done!' })
                : getLocalizedText({ ja: 'つぎ', en: 'Next' })}
            </Text>
            <BalloonTail
              fillColor="rgba(209, 200, 194, 0.5)"
              position="topright"
            />
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  controlButton: {
    alignItems: 'flex-end',
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
    borderColor: '#44403c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  balloonContainer: {
    position: 'absolute',
    right: 0,
    bottom: -44,
    width: 100,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  balloon: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balloonTopRight: {
    borderTopRightRadius: 0,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'right',
    lineHeight: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  balloonDisabled: {
    opacity: 0.0,
  },
});

export default NonverbalNextChapterButton;
