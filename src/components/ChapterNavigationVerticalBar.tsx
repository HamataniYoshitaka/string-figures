import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import PreviousChapterLandscapeButton, { PreviousChapterLandscapeButtonRef } from './PreviousChapterLandscapeButton';
import ReplayLandscapeButton, { ReplayLandscapeButtonRef } from './ReplayLandscapeButton';
import NextChapterLandscapeButton, { NextChapterLandscapeButtonRef } from './NextChapterLandscapeButton';
import AnimatedChapterNumberVertical from './AnimatedChapterNumberVertical';
import { Chapter, StringFigure } from '../types';

interface ChapterNavigationVerticalBarProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onPreviousChapter: () => void;
  onReplay: () => void;
  onNextChapter: () => void;
  onRestartFromBeginning: () => void;
  playbackPosition: number;
  isLastChapterCompleted: boolean;
  stringFigure: StringFigure;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  previousChapterButtonRef: React.RefObject<PreviousChapterLandscapeButtonRef | null>;
  replayButtonRef: React.RefObject<ReplayLandscapeButtonRef | null>;
  nextChapterButtonRef: React.RefObject<NextChapterLandscapeButtonRef | null>;
}

export interface ChapterNavigationVerticalBarRef {
  // 必要に応じて後で追加
}

const ChapterNavigationVerticalBar = forwardRef<ChapterNavigationVerticalBarRef, ChapterNavigationVerticalBarProps>(({
  chapters,
  currentChapterIndex,
  onPreviousChapter,
  onReplay,
  onNextChapter,
  onRestartFromBeginning,
  playbackPosition,
  isLastChapterCompleted,
  stringFigure,
  getLocalizedText,
  previousChapterButtonRef,
  replayButtonRef,
  nextChapterButtonRef,
}, ref) => {
  
  useImperativeHandle(ref, () => ({}));

  // 表示する章番号を計算（ChapterNavigationBar.tsxのロジックを参考）
  const getPreviousChapters = () => {
    const result = [];
    
    if (currentChapterIndex <= 2) {
      // 最初の方の章の場合：空白で埋めて、現在章より前を表示
      for (let i = 0; i < currentChapterIndex; i++) {
        result.push(i);
      }
      // 3つに満たない場合は null で埋める（空白表示用）
      while (result.length < 3) {
        result.unshift(null);
      }
    } else {
      // 中間以降の章の場合：現在章の直前3つを表示
      result.push(currentChapterIndex - 3);
      result.push(currentChapterIndex - 2);
      result.push(currentChapterIndex - 1);
    }
    
    return result.slice(-3); // 最後の3つを取得
  };

  const getNextChapters = () => {
    const result = [];
    
    if (currentChapterIndex >= chapters.length - 4) {
      // 最後の方の章の場合：現在章より後をすべて表示
      for (let i = currentChapterIndex + 1; i < chapters.length; i++) {
        result.push(i);
      }
      // 3つに満たない場合は null で埋める（空白表示用）
      while (result.length < 3) {
        result.push(null);
      }
    } else {
      // 中間の章の場合：現在章の直後3つを表示
      result.push(currentChapterIndex + 1);
      result.push(currentChapterIndex + 2);
      result.push(currentChapterIndex + 3);
    }
    
    return result.slice(0, 3); // 最初の3つを取得
  };

  const previousChapters = getPreviousChapters();
  const nextChapters = getNextChapters();

  return (
    <View style={styles.container}>
      {/* まえボタン */}
      <View style={styles.buttonWrapper}>
        <PreviousChapterLandscapeButton
          ref={previousChapterButtonRef}
          onPress={onPreviousChapter}
          currentChapterIndex={currentChapterIndex}
          getLocalizedText={getLocalizedText}
        />
      </View>

      {/* 前の章番号（最大3つ、先頭が3点リーダーに置き換わる場合あり） */}
      {previousChapters.map((chapterIndex, index) => (
        <View key={`prev-${index}`} style={styles.chapterNumberWrapper}>
          <AnimatedChapterNumberVertical
            chapterIndex={chapterIndex}
            isEllipsis={index === 0 && chapterIndex !== null && currentChapterIndex > 3}
          />
        </View>
      ))}

      {/* もういちどボタン（現在の章） */}
      <View style={styles.buttonWrapper}>
        <ReplayLandscapeButton
          ref={replayButtonRef}
          onPress={onReplay}
          currentChapterIndex={currentChapterIndex}
          playbackPosition={playbackPosition}
          getLocalizedText={getLocalizedText}
        />
      </View>

      {/* 後の章番号（最大3つ、最後が3点リーダーに置き換わる場合あり） */}
      {nextChapters.map((chapterIndex, index) => (
        <View key={`next-${index}`} style={styles.chapterNumberWrapper}>
          <AnimatedChapterNumberVertical
            chapterIndex={chapterIndex}
            isEllipsis={index === 2 && chapterIndex !== null && currentChapterIndex < chapters.length - 4}
            defaultOpacity={0.5}
          />
        </View>
      ))}

      {/* つぎボタン */}
      <View style={styles.buttonWrapper}>
        <NextChapterLandscapeButton
          ref={nextChapterButtonRef}
          chapters={chapters}
          onPress={isLastChapterCompleted ? onRestartFromBeginning : onNextChapter}
          stringFigure={stringFigure}
          currentChapterIndex={currentChapterIndex}
          isLastChapterCompleted={isLastChapterCompleted}
          getLocalizedText={getLocalizedText}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    // gap: 4,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'flex-start',
  },
  chapterNumberWrapper: {
    width: 48,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChapterNavigationVerticalBar;

