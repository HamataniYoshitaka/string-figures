import React, { useRef } from 'react';
import { TouchableWithoutFeedback, Animated, View, Text, StyleSheet } from 'react-native';
import { SkipBackwardIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface RestartButtonProps {
  onPress: () => void;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

const RestartButton: React.FC<RestartButtonProps> = ({
  onPress,
  getLocalizedText,
}) => {
  const restartButtonScale = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const createPressInHandler = () => {
    Animated.spring(restartButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const createPressOutHandler = () => {
    Animated.spring(restartButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // リップルエフェクト開始
    rippleAnim.setValue(0);
    rippleOpacity.setValue(1);
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
    ]).start();
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  return (
    <TouchableWithoutFeedback 
      onPress={onPress}
      onPressIn={createPressInHandler}
      onPressOut={createPressOutHandler}
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
          <Animated.View
            style={[
              styles.floatingButton,
              { transform: [{ scale: restartButtonScale }] }
            ]}
          >
            <SkipBackwardIcon width={24} height={24} fillColor="#57534D" />
          </Animated.View>
        </View>
        <View style={[
          styles.chapterBalloon,
          styles.speedButtonTop
        ]}>
          <Text>{getLocalizedText({ ja: 'はじめから', en: 'Restart' })}</Text>
          <SpeedButtonTail
            fillColor={'rgba(209, 200, 194, 0.5)'}
            isBottom={true}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

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
    backgroundColor: '#F7F6F2',
    borderWidth: 2,
    borderColor: '#57534D',
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 8,
  },
  chapterBalloon: {
    backgroundColor: 'rgba(209, 200, 194, 0.5)',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
    color: '#57534D',
    fontWeight: '400',
  },
  speedButtonTop: {
    borderBottomLeftRadius: 0,
  },
});

export default RestartButton;
