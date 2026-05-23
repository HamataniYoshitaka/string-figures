import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import BalloonTail from './icons/BalloonTail';
import {
  getNonverbalCompositePlaybackPositionMs,
  getNonverbalCurrentChapterProgress,
  type NonverbalSegmentPlayback,
} from '../utils/nonverbalChapterPlayback';

interface NonverbalReplayButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  nonverbalSegmentPlayback: NonverbalSegmentPlayback;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  isTemporarilyDisabled?: boolean;
  isBalloonAbove?: boolean;
}

export interface ReplayButtonRef {
  triggerRipple: () => void;
}

const BUTTON_SIZE = 48;
const BUTTON_CENTER = BUTTON_SIZE / 2;
const INNER_RADIUS = 23;
const INNER_STROKE_WIDTH = 2;
const BUTTON_OUTER_RADIUS = INNER_RADIUS + INNER_STROKE_WIDTH / 2;
const PROGRESS_STROKE_WIDTH = 6;
const PROGRESS_RADIUS = BUTTON_OUTER_RADIUS + PROGRESS_STROKE_WIDTH / 2;
const PROGRESS_COLOR = '#FF623F';
const PROGRESS_CIRCUMFERENCE = PROGRESS_RADIUS * 2 * Math.PI;
const SVG_CANVAS_SIZE = (PROGRESS_RADIUS + PROGRESS_STROKE_WIDTH / 2) * 2;
const SVG_CENTER = SVG_CANVAS_SIZE / 2;
const SVG_OFFSET = (BUTTON_SIZE - SVG_CANVAS_SIZE) / 2;
const SHADOW_OFFSET_X = 3;
const SHADOW_OFFSET_Y = 4;
const SHADOW_COLOR = '#3D3835';

const NonverbalReplayButton = forwardRef<ReplayButtonRef, NonverbalReplayButtonProps>(({
  onPress,
  currentChapterIndex,
  nonverbalSegmentPlayback,
  getLocalizedText,
  isTemporarilyDisabled = false,
  isBalloonAbove = false,
}, ref) => {
  const compositePlaybackPositionMs = getNonverbalCompositePlaybackPositionMs(
    nonverbalSegmentPlayback,
  );
  const isDisabled =
    (currentChapterIndex === 0 && compositePlaybackPositionMs === 0) || isTemporarilyDisabled;
  const [pressAnim] = useState(new Animated.Value(0));
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
    const progress = getNonverbalCurrentChapterProgress(nonverbalSegmentPlayback) * 1.1;
    Animated.timing(animatedProgress, {
      toValue: progress > 1 ? 1 : progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [currentChapterIndex, nonverbalSegmentPlayback, animatedProgress]);

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
      Animated.spring(pressAnim, {
        toValue: 1,
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
      onPress={!isDisabled ? onPress : undefined}
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
            <View style={styles.progressContainer}>
              <Svg width={SVG_CANVAS_SIZE} height={SVG_CANVAS_SIZE} style={styles.progressSvg}>
                <Circle
                  cx={SVG_CENTER + SHADOW_OFFSET_X}
                  cy={SVG_CENTER + SHADOW_OFFSET_Y}
                  r={INNER_RADIUS}
                  fill={SHADOW_COLOR}
                  opacity={isDisabled ? 0 : 0.35}
                />
                {progressValue > 0 && (
                  <Circle
                    cx={SVG_CENTER}
                    cy={SVG_CENTER}
                    r={PROGRESS_RADIUS}
                    stroke={PROGRESS_COLOR}
                    strokeWidth={PROGRESS_STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={PROGRESS_CIRCUMFERENCE}
                    strokeDashoffset={PROGRESS_CIRCUMFERENCE * (1 - progressValue)}
                    strokeLinecap="butt"
                    transform={`rotate(-90 ${SVG_CENTER} ${SVG_CENTER})`}
                  />
                )}
                <Circle
                  cx={SVG_CENTER}
                  cy={SVG_CENTER}
                  r={INNER_RADIUS}
                  fill="#FFFFFF"
                  stroke="#2D2926"
                  strokeWidth={INNER_STROKE_WIDTH}
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
        <View style={[styles.balloonContainer, isBalloonAbove && styles.balloonContainerAbove]}>
          <Animated.View
            style={[
              styles.balloon,
              isDisabled && styles.balloonDisabled,
              !isDisabled && { backgroundColor: balloonColor },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.25}
              style={[styles.controlButtonText, isBalloonAbove && styles.controlButtonTextAbove]}
            >
              {getLocalizedText({ ja: 'もういちど', en: 'Replay' })}
            </Text>
            <BalloonTail
              fillColor={isDisabled ? 'rgba(208, 205, 205, 0.3)' : 'rgba(209, 200, 194, 0.5)'}
              position={isBalloonAbove ? 'bottomcenter' : 'topcenter'}
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
    minWidth: BUTTON_SIZE,
    position: 'relative',
    overflow: 'visible',
  },
  buttonContainer: {
    position: 'relative',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  ripple: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: PROGRESS_COLOR,
  },
  shadowCircle: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#000',
    left: 4,
    top: 4,
  },
  shadowHidden: {
    opacity: 0,
  },
  floatingButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  progressContainer: {
    position: 'absolute',
    width: SVG_CANVAS_SIZE,
    height: SVG_CANVAS_SIZE,
    left: SVG_OFFSET,
    top: SVG_OFFSET,
  },
  chapterNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressSvg: {
    position: 'absolute',
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
  balloonContainerAbove: {
    bottom: undefined,
    top: -44,
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
  controlButtonTextAbove: {
    marginTop: 0,
    marginBottom: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  balloonDisabled: {
    opacity: 0.0,
  },
});

export default NonverbalReplayButton;
