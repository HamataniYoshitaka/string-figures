import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useDeviceInfo } from "../hooks/useDeviceInfo";
import { useEffect, useRef } from "react";

interface Chapter {
videoUrl: string | any;
subtitle: { ja: string; en: string };
}

interface ProgressDotsProps {
    chapters: Chapter[];
    currentChapterIndex: number;
    getChapterProgress: (chapterIndex: number) => number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({
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
    
    // 各チャプターのwidth用のアニメーション値
    const animatedWidths = useRef(
      chapters.map(() => new Animated.Value(8))
    ).current;
    
    // currentChapterIndexが変更されたときにアニメーション実行
    useEffect(() => {
      chapters.forEach((_, index) => {
        Animated.timing(animatedWidths[index], {
          toValue: index === currentChapterIndex ? 40 : 8,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }, [currentChapterIndex, chapters]);
      
      return (
        <View style={[styles.progressContainer, { width: progressBarWidth }]}>
          <View style={styles.progressBarsContainer}>
            {chapters.map((_, index) => {
              const progress = getChapterProgress(index);
              const isCompleted = progress === 1;
              const isActive = index === currentChapterIndex;

              return (
                <Animated.View key={index} style={{ width: animatedWidths[index] }}>
                  {isActive ? (
                    <View style={styles.progressBarWrapper}>
                      <View style={styles.progressBarBackground} />
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progress * 100}%` }
                        ]}
                      />
                    </View>
                  ) : (
                    <View style={[
                      styles.dot,
                      isCompleted && styles.dotCompleted
                    ]} />
                  )}
                </Animated.View>
              );
            })}
          </View>
        </View>
      );
}

const styles = StyleSheet.create({
    progressContainer: {
      paddingVertical: 16,
    },
    progressBarsContainer: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBarWrapper: {
      height: 8,
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden',
    },
    progressBarBackground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
    },
    progressBarFill: {
      position: 'absolute',
      height: '100%',
      backgroundColor: '#000',
      borderRadius: 4,
    },
    dot: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      backgroundColor: '#E0E0E0',
    },
    dotCompleted: {
      backgroundColor: '#000',
    },
});

export default ProgressDots;