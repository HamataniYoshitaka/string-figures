import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { PlayIcon, SkipBackwardIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';
import { StringFigure } from '../types';

interface NextChapterButtonProps {
  onPress: () => void;
  isLastChapterCompleted: boolean;
  stringFigure: StringFigure;
  currentChapterIndex: number;
  getLocalizedText: (text: { ja: string; en: string }) => string;
}

const NextChapterButton: React.FC<NextChapterButtonProps> = ({
  onPress,
  isLastChapterCompleted,
  stringFigure,
  currentChapterIndex,
  getLocalizedText,
}) => {
  const isDisabled = currentChapterIndex === stringFigure.chapters.length - 1 && !isLastChapterCompleted;

  return (
    <TouchableOpacity 
      onPress={!isDisabled ? onPress : undefined}
      style={styles.controlButton}
      disabled={isDisabled}
    >
        {isLastChapterCompleted ? (
          <View style={styles.floatingButton}>
            <SkipBackwardIcon 
              width={26} 
              height={26} 
              fillColor="white"
            />
          </View>
        ) : (
          <View style={[styles.floatingButton, { paddingLeft: 2 }, isDisabled && styles.disabledButton]}>
            <PlayIcon 
              width={20} 
              height={20} 
              fillColor="#57534D" 
              strokeColor='transparent' 
            />
          </View>
        )}
      <View style={[styles.speedButton, styles.speedButtonTopLeft, isDisabled && styles.balloonDisabled]}>
        <Text style={styles.controlButtonText}>
          {isLastChapterCompleted 
            ? getLocalizedText({ ja: 'はじめから', en: 'Restart' })
            : getLocalizedText({ ja: 'つぎ', en: 'Next' })
          }
        </Text>
        <SpeedButtonTail 
          fillColor="rgba(208, 205, 205, 0.5)"
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
    opacity: 0.0,
  },
});

export default NextChapterButton;
