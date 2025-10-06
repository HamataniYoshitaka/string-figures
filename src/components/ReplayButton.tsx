import React, { useState } from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Animated } from 'react-native';
import { ReplayIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface ReplayButtonProps {
  onPress: () => void;
  currentChapterIndex: number;
  playbackPosition: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

const ReplayButton: React.FC<ReplayButtonProps> = ({
  onPress,
  currentChapterIndex,
  playbackPosition,
  getLocalizedText,
}) => {
  const isDisabled = currentChapterIndex === 0 && playbackPosition === 0;
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const handlePressOut = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={!isDisabled ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <View style={styles.controlButton}>
        <Animated.View style={[
          styles.floatingButton,
          isDisabled && styles.disabledButton,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <ReplayIcon
            width={24}
            height={24}
            fillColor="#57534D"
            strokeColor='transparent'
          />
        </Animated.View>
        <View style={[
          styles.speedButton,
          styles.speedButtonTopLeft,
          isDisabled && styles.balloonDisabled
        ]}>
          <Text style={[
            styles.controlButtonText,
            isDisabled && styles.textDisabled
          ]}>
            {getLocalizedText({ ja: 'もういちど', en: 'Replay' })}
          </Text>
          <SpeedButtonTail
            fillColor={isDisabled ? 'rgba(208, 205, 205, 0.3)' : 'rgba(209, 200, 194, 0.5)'}
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
    backgroundColor: 'rgba(208, 205, 205, 0)',
  },
  textDisabled: {
    color: '#fff',
  },
});

export default ReplayButton;
