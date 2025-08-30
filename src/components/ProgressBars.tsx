import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useDeviceInfo } from '../hooks/useDeviceInfo';

interface Chapter {
  videoUrl: string | any;
  subtitle: { ja: string; en: string };
}

interface ProgressBarsProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  getChapterProgress: (chapterIndex: number) => number;
}

const ProgressBars: React.FC<ProgressBarsProps> = ({
  chapters,
  currentChapterIndex,
  getChapterProgress,
}) => {
  const { isTablet, isDeviceLandscape } = useDeviceInfo();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  
  // isTablet の場合、progressBarWidthはwindowWidth-32
  // !isTablet の場合、isDeviceLandscapeの場合は ((windowHeight - 60) / 9) * 16, それ以外は windowWidth-32
  const progressBarWidth = isTablet
    ? windowWidth - 32
    : isDeviceLandscape
    ? ((windowHeight - 60) / 9) * 16
    : windowWidth - 32;

  return (
    <View style={[styles.progressContainer, { width: progressBarWidth }]}>
      <View style={styles.progressBarsContainer}>
        {chapters.map((_, index) => {
          const progress = getChapterProgress(index);
          const isCompleted = progress === 1;
          const isActive = index === currentChapterIndex;
          
          return (
            <View key={index} style={styles.progressBarWrapper}>
              <View 
                style={[
                  styles.progressBarBackground,
                  isCompleted ? styles.progressBarCompleted : styles.progressBarIncomplete
                ]}
              >
                {isActive && progress > 0 && progress < 1 && (
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${progress * 100}%` }
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    paddingVertical: 16,
  },
  progressBarsContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  progressBarWrapper: {
    flex: 1,
    minWidth: 20,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarCompleted: {
    backgroundColor: '#1C1917', // stone-900
  },
  progressBarIncomplete: {
    backgroundColor: '#D6D3D1', // stone-300
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1C1917', // stone-900
    borderRadius: 3,
  },
});

export default ProgressBars;
