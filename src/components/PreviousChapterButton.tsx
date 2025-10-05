import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
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
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.controlButton}
      disabled={disabled}
    >
      <View style={[
        styles.floatingButton,
        disabled && styles.disabledButton
      ]}>
        <SkipPreviousIcon 
          width={24} 
          height={24} 
          fillColor="#57534D"
          strokeColor='transparent'
        />
      </View>
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
    </TouchableOpacity>
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
    backgroundColor: 'rgba(208, 205, 205, 0.5)',
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
