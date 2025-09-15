import React, { useRef } from 'react';
import { TouchableWithoutFeedback, Animated, View, Text, StyleSheet } from 'react-native';
import { SkipPreviousIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface PreviousChapterLandscapeButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

const PreviousChapterLandscapeButton: React.FC<PreviousChapterLandscapeButtonProps> = ({
  onPress,
  currentChapterIndex,
  getLocalizedText,
}) => {
  const previousButtonScale = useRef(new Animated.Value(1)).current;
  const isDisabled = currentChapterIndex === 0;

  const createPressInHandler = () => {
    if (!isDisabled) {
      Animated.spring(previousButtonScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }).start();
    }
  };

  const createPressOutHandler = () => {
    if (!isDisabled) {
      Animated.spring(previousButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }).start();
    }
  };

  return (
    <TouchableWithoutFeedback 
      onPress={!isDisabled ? onPress : undefined}
      onPressIn={!isDisabled ? createPressInHandler : undefined}
      onPressOut={!isDisabled ? createPressOutHandler : undefined}
      disabled={isDisabled}
    >
      <Animated.View 
        style={[
          styles.controlButton,
          { transform: [{ scale: previousButtonScale }] }
        ]}
      >
        <View style={[
          styles.floatingButton,
          isDisabled && styles.disabledButton
        ]}>
          <SkipPreviousIcon 
            width={24} 
            height={24} 
            fillColor={"white"}
            strokeColor='transparent'
          />
        </View>
        <View style={[
          styles.chapterBalloon,
          styles.speedButtonTop,
          isDisabled && styles.balloonDisabled
        ]}>
          <Text style={[
            isDisabled && styles.speedButtonTextDisabled
          ]}>{getLocalizedText({ ja: 'まえ', en: 'Previous' })}</Text>
          <SpeedButtonTail 
            fillColor={isDisabled ? 'rgba(208, 205, 205, 0.3)' : 'rgba(208, 205, 205, 0.5)'}
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
    backgroundColor: '#57534D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.1,
    elevation: 0,
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
  balloonDisabled: {
    opacity: 0.0,
  },
  speedButtonTextDisabled: {
    color: '#999',
  },
});

export default PreviousChapterLandscapeButton;
