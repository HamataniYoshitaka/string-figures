import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

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
  const windowHeight = Dimensions.get('window').height;
  const progressBarWidth = ((windowHeight - 60) / 9) * 16;

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
    // width: 'calc((100vh - 40px)/9*16)',
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
