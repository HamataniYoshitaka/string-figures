import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { TouchableWithoutFeedback, Animated, View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface ReplayLandscapeButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  playbackPosition: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  getChapterProgress: (chapterIndex: number) => number;
  isTemporarilyDisabled?: boolean;
}

export interface ReplayLandscapeButtonRef {
  triggerRipple: () => void;
}

const ReplayLandscapeButton = forwardRef<ReplayLandscapeButtonRef, ReplayLandscapeButtonProps>(({
  onPress,
  currentChapterIndex,
  playbackPosition,
  getLocalizedText,
  getChapterProgress,
  isTemporarilyDisabled = false,
}, ref) => {
  const isDisabled = (currentChapterIndex === 0 && playbackPosition === 0) || isTemporarilyDisabled;
  const [scaleAnim] = useState(new Animated.Value(1));
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const balloonColorAnim = useRef(new Animated.Value(0)).current;
  
  // チャプター番号アニメーション用（Y方向）
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [displayChapterIndex, setDisplayChapterIndex] = useState(currentChapterIndex);
  const previousChapterIndexRef = useRef(currentChapterIndex);
  const isInitialMount = useRef(true);

  // 円形プログレスアニメーション用
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [progressValue, setProgressValue] = useState(0);

  // チャプター番号のアニメーション（Y方向）
  useEffect(() => {
    // 初回マウント時は何もしない（既に表示されている）
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousChapterIndexRef.current = currentChapterIndex;
      return;
    }

    // currentChapterIndexが変更された場合のみアニメーションを実行
    const previousChapterIndex = previousChapterIndexRef.current;
    const hasChanged = currentChapterIndex !== previousChapterIndex;
    
    if (hasChanged && previousChapterIndex !== null && currentChapterIndex !== null) {
      // 増減を判定（増える場合は正の値、減る場合は負の値）
      const isIncreasing = currentChapterIndex > previousChapterIndex;
      
      // フェーズ1の移動方向と距離（Y方向）
      const phase1TranslateY = isIncreasing ? -10 : 10;
      // フェーズ2の初期位置（フェーズ1の逆方向）
      const phase2TranslateY = isIncreasing ? 10 : -10;
      
      // フェーズ1: 現在の数字を移動、opacity: 0に（0.15s）
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: phase1TranslateY,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // フェーズ2: 数字を新しい値に更新、位置を逆方向に設定
        setDisplayChapterIndex(currentChapterIndex);
        translateY.setValue(phase2TranslateY);
        opacity.setValue(0);

        // フェーズ3: 逆方向 → 0pt、opacity: 1にアニメーション（0.15s）
        Animated.parallel([
          Animated.timing(translateY, {
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
  }, [currentChapterIndex]);

  // プログレスのアニメーション
  useEffect(() => {
    const progress = getChapterProgress(currentChapterIndex) * 1.1;
    Animated.timing(animatedProgress, {
      toValue: progress > 1 ? 1 : progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [currentChapterIndex, playbackPosition, getChapterProgress]);

  // プログレス値の監視
  useEffect(() => {
    const listenerId = animatedProgress.addListener(({ value }) => {
      setProgressValue(value);
    });
    return () => {
      animatedProgress.removeListener(listenerId);
    };
  }, []);

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
            {/* 円形プログレスインジケーター */}
            <View style={styles.progressContainer}>
              <Svg width={48} height={48} style={styles.progressSvg}>
                {/* 背景円 */}
                <Circle
                  cx={24}
                  cy={24}
                  r={23}
                  stroke="#a8a29e"
                  strokeWidth={2}
                  fill="none"
                />
                {/* プログレス円 */}
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
                  transform: [{ translateY }],
                  opacity,
                },
              ]}
            >
              <Text allowFontScaling={false} style={[styles.labelText]}>
                {displayChapterIndex + 1}
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
        <Animated.View style={[
          styles.balloon,
          styles.balloonTop,
          isDisabled && styles.balloonDisabled,
          !isDisabled && { backgroundColor: balloonColor }
        ]}>
          <Text 
            maxFontSizeMultiplier={1.25}
            style={[
              isDisabled && styles.balloonTextDisabled
            ]}
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
});

const styles = StyleSheet.create({
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 8,
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
