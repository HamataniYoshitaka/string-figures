import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AnimatedChapterNumberProps {
  chapterIndex: number | null;
  isEllipsis: boolean;
  defaultOpacity?: number;
}

const AnimatedChapterNumber: React.FC<AnimatedChapterNumberProps> = ({
  chapterIndex,
  isEllipsis,
  defaultOpacity = 0.4,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current; // 初期値を0に変更
  const [displayChapterIndex, setDisplayChapterIndex] = useState(chapterIndex);
  const previousChapterIndexRef = useRef(chapterIndex);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 初回マウント時はフェードインアニメーションを実行
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousChapterIndexRef.current = chapterIndex;
      // 初回マウント時はフェードイン
      if (chapterIndex !== null) {
        opacity.setValue(0);
        Animated.timing(opacity, {
          toValue: defaultOpacity,
          duration: 150,
          useNativeDriver: true,
        }).start();
      } else {
        opacity.setValue(0);
      }
      return;
    }

    // chapterIndexが変更された場合のみアニメーションを実行
    const previousChapterIndex = previousChapterIndexRef.current;
    const hasChanged = chapterIndex !== previousChapterIndex && previousChapterIndex !== null && chapterIndex !== null;
    
    if (hasChanged && previousChapterIndex !== null) {
      // 増減を判定（増える場合は正の値、減る場合は負の値）
      const isIncreasing = chapterIndex > previousChapterIndex;
      
      // フェーズ1の移動方向と距離
      const phase1TranslateX = isIncreasing ? -10 : 10;
      // フェーズ2の初期位置（フェーズ1の逆方向）
      const phase2TranslateX = isIncreasing ? 10 : -10;
      
      // フェーズ1: 現在の数字を移動、opacity: 0に（0.2s）
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
        setDisplayChapterIndex(chapterIndex);
        translateX.setValue(phase2TranslateX);
        opacity.setValue(0);

        // フェーズ3: 逆方向 → 0pt、opacity: defaultOpacityにアニメーション（0.3s）
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: defaultOpacity,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // nullから値への変更、または値からnullへの変更の場合は、フェードイン/フェードアウト
      if (chapterIndex !== null && previousChapterIndex === null) {
        // nullから値への変更：フェードイン
        setDisplayChapterIndex(chapterIndex);
        translateX.setValue(chapterIndex === 0 ? 10 : -10);
        opacity.setValue(0);
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            delay: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: defaultOpacity,
            duration: 150,
            delay: 150,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (chapterIndex === null && previousChapterIndex !== null) {
        // 値からnullへの変更：フェードアウト
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: previousChapterIndex === 0 ? 10 : -10,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
    previousChapterIndexRef.current = chapterIndex;
  }, [chapterIndex, defaultOpacity]);
  // chapterIndexがnullの場合は空白を表示
  if (displayChapterIndex === null) {
    return (
      <Animated.View style={[styles.emptyChapterContainer, { opacity }]}>
        {/* 空白 */}
      </Animated.View>
    );
  }

  // 3点リーダーの場合
  if (isEllipsis) {
    return (
      <Animated.View
        style={[
          styles.chapterContainer,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
      >
        <Text 
          allowFontScaling={false}
          style={styles.chapterText}
        >...</Text>
      </Animated.View>
    );
  }

  const chapterNumber = displayChapterIndex + 1;

  return (
    <Animated.View
      style={[
        styles.chapterContainer,
        {
          transform: [{ translateX }],
          opacity,
        },
      ]}
    >
      <Text 
        allowFontScaling={false}
        style={styles.chapterText}
      >{chapterNumber}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chapterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  chapterText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
  },
  emptyChapterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    minWidth: 16,
  },
});

export default AnimatedChapterNumber;

