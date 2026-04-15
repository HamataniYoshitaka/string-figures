import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import BalloonTail from './icons/BalloonTail';

interface NonverbalReplayButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  playbackPosition: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  getChapterProgress: (chapterIndex: number) => number;
  isTemporarilyDisabled?: boolean;
}

export interface ReplayButtonRef {
  triggerRipple: () => void;
}

const NonverbalReplayButton = forwardRef<ReplayButtonRef, NonverbalReplayButtonProps>(({
  onPress,
  currentChapterIndex,
  playbackPosition,
  getLocalizedText,
  getChapterProgress,
  isTemporarilyDisabled = false,
}, ref) => {
  const isDisabled = (currentChapterIndex === 0 && playbackPosition === 0) || isTemporarilyDisabled;
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [rippleOpacity] = useState(new Animated.Value(0));
  const [balloonColorAnim] = useState(new Animated.Value(0));

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [displayChapterIndex, setDisplayChapterIndex] = useState(currentChapterIndex);
  const previousChapterIndexRef = useRef(currentChapterIndex);
  const isInitialMount = useRef(true);

  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousChapterIndexRef.current = currentChapterIndex;
      return;
    }

    const previousChapterIndex = previousChapterIndexRef.current;
    const hasChanged = currentChapterIndex !== previousChapterIndex;

    if (hasChanged && previousChapterIndex !== null && currentChapterIndex !== null) {
      const isIncreasing = currentChapterIndex > previousChapterIndex;
      const phase1TranslateX = isIncreasing ? -10 : 10;
      const phase2TranslateX = isIncreasing ? 10 : -10;

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: phase1TranslateX,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDisplayChapterIndex(currentChapterIndex);
        translateX.setValue(phase2TranslateX);
        opacity.setValue(0);

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
    previousChapterIndexRef.current = currentChapterIndex;
  }, [currentChapterIndex, opacity, translateX]);

  useEffect(() => {
    const progress = getChapterProgress(currentChapterIndex) * 1.1;
    Animated.timing(animatedProgress, {
      toValue: progress > 1 ? 1 : progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [currentChapterIndex, playbackPosition, getChapterProgress, animatedProgress]);

  useEffect(() => {
    const listenerId = animatedProgress.addListener(({ value }) => {
      setProgressValue(value);
    });
    return () => {
      animatedProgress.removeListener(listenerId);
    };
  }, [animatedProgress]);

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
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.progressContainer}>
              <Svg width={48} height={48} style={styles.progressSvg}>
                <Circle
                  cx={24}
                  cy={24}
                  r={23}
                  stroke="#a8a29e"
                  strokeWidth={2}
                  fill="none"
                />
                <Circle
                  cx={24}
                  cy={24}
                  r={23}
                  stroke="#44403c"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray={23 * 2 * Math.PI}
                  strokeDashoffset={23 * 2 * Math.PI * (1 - progressValue)}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </Svg>
            </View>
            <Animated.View
              style={[
                styles.chapterNumberContainer,
                {
                  transform: [{ translateX }],
                  opacity,
                },
              ]}
            >
              <Text
                allowFontScaling={false}
                style={styles.labelText}
              >
                {displayChapterIndex + 1}
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
        <View style={styles.balloonContainer}>
          <Animated.View
            style={[
              styles.balloon,
              isDisabled && styles.balloonDisabled,
              !isDisabled && { backgroundColor: balloonColor },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.25}
              style={styles.controlButtonText}
            >
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  progressContainer: {
    position: 'absolute',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSvg: {
    position: 'absolute',
  },
  chapterNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  labelText: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium',
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

export default NonverbalReplayButton;
