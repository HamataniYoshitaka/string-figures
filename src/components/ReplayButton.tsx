import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import BalloonTail from './icons/BalloonTail';

interface ReplayButtonProps {
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

const ReplayButton = forwardRef<ReplayButtonRef, ReplayButtonProps>(({
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
  
  // チャプター番号アニメーション用
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [displayChapterIndex, setDisplayChapterIndex] = useState(currentChapterIndex);
  const previousChapterIndexRef = useRef(currentChapterIndex);
  const isInitialMount = useRef(true);

  // 円形プログレスアニメーション用
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [progressValue, setProgressValue] = useState(0);

  // チャプター番号のアニメーション
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
      
      // フェーズ1の移動方向と距離
      const phase1TranslateX = isIncreasing ? -10 : 10;
      // フェーズ2の初期位置（フェーズ1の逆方向）
      const phase2TranslateX = isIncreasing ? 10 : -10;
      
      // フェーズ1: 現在の数字を移動、opacity: 0に（0.15s）
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
        // フェーズ2: 数字を新しい値に更新、位置を逆方向に設定
        setDisplayChapterIndex(currentChapterIndex);
        translateX.setValue(phase2TranslateX);
        opacity.setValue(0);

        // フェーズ3: 逆方向 → 0pt、opacity: 1にアニメーション（0.15s）
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
  }, [currentChapterIndex]);

  // プログレスのアニメーション
  useEffect(() => {
    const progress = getChapterProgress(currentChapterIndex) * 1.1;
    Animated.timing(animatedProgress, {
      toValue: progress > 1 ? 1 : progress,
      duration: 600,
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
                  transform: [{ translateX }],
                  opacity,
                },
              ]}
            >
              <Text 
                allowFontScaling={false}
                style={[styles.labelText]}
              >
                {displayChapterIndex + 1}
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
        <View style={styles.balloonContainer}>
          <Animated.View style={[
            styles.balloon,
            isDisabled && styles.balloonDisabled,
            !isDisabled && { backgroundColor: balloonColor }
          ]}>
            <Text 
              maxFontSizeMultiplier={1.25}
              style={[
                styles.controlButtonText
              ]}
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
    // lineHeight: 24,
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
  }
});

export default ReplayButton;
