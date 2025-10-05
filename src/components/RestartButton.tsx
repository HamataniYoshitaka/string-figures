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
      tension: 300,
      friction: 8,
    }).start();
  };

  return (
    <TouchableWithoutFeedback 
      onPress={onPress}
      onPressIn={createPressInHandler}
      onPressOut={createPressOutHandler}
    >
      <Animated.View 
        style={[
          styles.controlButton,
          { transform: [{ scale: restartButtonScale }] }
        ]}
      >
        <View style={styles.floatingButton}>
          <SkipBackwardIcon width={24} height={24} fillColor="#57534D" />
        </View>
        <View style={[
          styles.chapterBalloon,
          styles.speedButtonTop
        ]}>
          <Text>{getLocalizedText({ ja: 'はじめから', en: 'Restart' })}</Text>
          <SpeedButtonTail 
            fillColor={'rgba(208, 205, 205, 0.5)'}
            isBottom={true}
          />
        </View>
      </Animated.View>
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
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
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
