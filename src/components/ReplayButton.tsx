import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ReplayIcon } from './icons';
import SpeedButtonTail from './icons/SpeedButtonTail';

interface ReplayButtonProps {
  onPress: () => void;
  isLastChapterCompleted: boolean;
}

const ReplayButton: React.FC<ReplayButtonProps> = ({
  onPress,
  isLastChapterCompleted,
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={styles.controlButton}
    >
      <View style={styles.floatingButton}>
        <ReplayIcon 
          width={24} 
          height={24} 
          fillColor={"white"}
          strokeColor='transparent'
        />
      </View>
      <View style={[styles.speedButton, styles.speedButtonTopLeft]}>
        <Text style={styles.controlButtonText}>
          もういちど
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
});

export default ReplayButton;
