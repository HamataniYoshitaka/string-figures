import React, { useState } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { SkipPreviousIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface PreviousChapterButtonProps {
  onPress: () => void;
  disabled: boolean;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

const PreviousChapterButton: React.FC<PreviousChapterButtonProps> = ({
  onPress,
  disabled,
  getLocalizedText,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }).start();
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <View style={styles.controlButton}>
        <Animated.View style={[
          styles.floatingButton,
          disabled && styles.disabledButton,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <SkipPreviousIcon
            width={24}
            height={24}
            fillColor="#57534D"
            strokeColor='transparent'
          />
        </Animated.View>
        <View style={[styles.speedButton, styles.speedButtonTopLeft, disabled && styles.balloonDisabled]}>
          <Text style={[styles.controlButtonText, disabled && styles.disabledText]}>
            {getLocalizedText({ ja: 'まえ', en: 'Previous' })}
          </Text>
          <SpeedButtonTail
            fillColor="rgba(205, 205, 205, 0.5)"
            isBottom={false}
            isRight={false}
            isUp={true}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    paddingVertical: 12,
    gap: 10,
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
  speedButton: {
    backgroundColor: 'rgba(209, 200, 194, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
  },
  speedButtonTopLeft: {
    borderTopLeftRadius: 0,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.1,
    elevation: 0,
  },
  balloonDisabled: {
    backgroundColor: 'rgba(205, 205, 205, 0)',
  },
  disabledText: {
    color: '#fff',
  },
});

export default PreviousChapterButton;
