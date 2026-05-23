import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { TouchableWithoutFeedback, Animated, View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import SpeedButtonTail from './icons/SpeedButtonTail';
import type { ReplayLandscapeButtonRef } from './ReplayLandscapeButton';
import {
  getNonverbalCompositePlaybackPositionMs,
  getNonverbalCurrentChapterProgress,
  type NonverbalSegmentPlayback,
} from '../utils/nonverbalChapterPlayback';

interface NonverbalReplayLandscapeButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  nonverbalSegmentPlayback: NonverbalSegmentPlayback;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  isTemporarilyDisabled?: boolean;
}

const NonverbalReplayLandscapeButton = forwardRef<
  ReplayLandscapeButtonRef,
  NonverbalReplayLandscapeButtonProps
>(
  (
    {
      onPress,
      currentChapterIndex,
      nonverbalSegmentPlayback,
      getLocalizedText,
      isTemporarilyDisabled = false,
    },
    ref,
  ) => {
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
                <Text allowFontScaling={false} style={styles.labelText}>
                  {displayChapterIndex + 1}
                </Text>
              </Animated.View>
            </Animated.View>
          </View>
          <Animated.View
            style={[
              styles.balloon,
              styles.balloonTop,
              isDisabled && styles.balloonDisabled,
              !isDisabled && { backgroundColor: balloonColor },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.25}
              style={[styles.controlButtonText, isDisabled && styles.balloonTextDisabled]}
            >
              {getLocalizedText({ ja: 'もういちど', en: 'Replay' })}
            </Text>
            <SpeedButtonTail
              fillColor={isDisabled ? 'rgba(208, 205, 205, 0.3)' : 'rgba(209, 200, 194, 0.5)'}
              isBottom={true}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    );
  },
);

const styles = StyleSheet.create({
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
  ripple: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF623F',
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  disabledButton: {
    opacity: 0.5,
  },
  labelText: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium',
  },
  balloon: {
    backgroundColor: 'rgba(209, 200, 194, 0.5)',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  controlButtonText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 14,
  },
});

export default NonverbalReplayLandscapeButton;
