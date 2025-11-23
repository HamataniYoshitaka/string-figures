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
  defaultOpacity = 1,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(defaultOpacity)).current;
  const [displayChapterIndex, setDisplayChapterIndex] = useState(chapterIndex);
  const previousChapterIndexRef = useRef(chapterIndex);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 初回マウント時はアニメーションを実行しない
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousChapterIndexRef.current = chapterIndex;
      return;
    }

    // chapterIndexが変更された場合のみアニメーションを実行
    const hasChanged = chapterIndex !== previousChapterIndexRef.current && previousChapterIndexRef.current !== null && chapterIndex !== null;
    
    if (hasChanged) {
      // フェーズ1: 現在の数字を左に20pt移動、opacity: 0に（0.3s）
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // フェーズ2: 数字を新しい値に更新、位置を-20ptに設定
        setDisplayChapterIndex(chapterIndex);
        translateX.setValue(10);
        opacity.setValue(0);

        // フェーズ3: -20pt → 0pt、opacity: defaultOpacityにアニメーション（0.3s）
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
      // 初回レンダリングまたはnullから値への変更、または値からnullへの変更の場合は、即座に更新
      setDisplayChapterIndex(chapterIndex);
      translateX.setValue(0);
      opacity.setValue(defaultOpacity);
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
        <Text style={styles.chapterText}>...</Text>
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
      <Text style={styles.chapterText}>{chapterNumber}</Text>
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

