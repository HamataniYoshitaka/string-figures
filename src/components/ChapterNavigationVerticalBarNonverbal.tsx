import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import NonverbalPreviousChapterLandscapeButton from './NonverbalPreviousChapterLandscapeButton';
import { PreviousChapterLandscapeButtonRef } from './PreviousChapterLandscapeButton';
import NonverbalReplayLandscapeButton from './NonverbalReplayLandscapeButton';
import { ReplayLandscapeButtonRef } from './ReplayLandscapeButton';
import NonverbalNextChapterLandscapeButton from './NonverbalNextChapterLandscapeButton';
import { NextChapterLandscapeButtonRef } from './NextChapterLandscapeButton';
import NonverbalRestartButtonVertical from './NonverbalRestartButtonVertical';
import AnimatedChapterNumberVertical from './AnimatedChapterNumberVertical';
import { Chapter, StringFigure } from '../types';
import type { NonverbalSegmentPlayback } from '../utils/nonverbalChapterPlayback';

interface ChapterNavigationVerticalBarNonverbalProps {
  currentLanguage: 'ja' | 'en';
  chapters: Chapter[];
  currentChapterIndex: number;
  onPreviousChapter: () => void;
  onReplay: () => void;
  onNextChapter: () => void;
  onComplete: () => void;
  onRestartFromBeginning: () => void;
  nonverbalSegmentPlayback: NonverbalSegmentPlayback;
  isLastChapterCompleted: boolean;
  stringFigure: StringFigure;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  previousChapterButtonRef: React.RefObject<PreviousChapterLandscapeButtonRef | null>;
  replayButtonRef: React.RefObject<ReplayLandscapeButtonRef | null>;
  nextChapterButtonRef: React.RefObject<NextChapterLandscapeButtonRef | null>;
  isTemporarilyDisabled: boolean;
}

export interface ChapterNavigationVerticalBarNonverbalRef {
  // 必要に応じて後で追加
}

const ChapterNavigationVerticalBarNonverbal = forwardRef<
  ChapterNavigationVerticalBarNonverbalRef,
  ChapterNavigationVerticalBarNonverbalProps
>(({
  currentLanguage,
  chapters,
  currentChapterIndex,
  onPreviousChapter,
  onReplay,
  onNextChapter,
  onComplete,
  onRestartFromBeginning,
  nonverbalSegmentPlayback,
  isLastChapterCompleted,
  stringFigure,
  getLocalizedText,
  previousChapterButtonRef,
  replayButtonRef,
  nextChapterButtonRef,
  isTemporarilyDisabled,
}, ref) => {

  useImperativeHandle(ref, () => ({}));

  // 表示する章番号を計算（ChapterNavigationBar.tsxのロジックを参考）
  const getPreviousChapters = () => {
    const result = [];

    if (currentChapterIndex <= 0) {
      // 最初の方の章の場合：空白で埋めて、現在章より前を表示
      for (let i = 0; i < currentChapterIndex; i++) {
        result.push(i);
      }
      // 3つに満たない場合は null で埋める（空白表示用）
      while (result.length < 1) {
        result.unshift(null);
      }
    } else {
      // 中間以降の章の場合：現在章の直前3つを表示
      result.push(currentChapterIndex - 1);
    }

    return result.slice(-3); // 最後の3つを取得
  };

  const getNextChapters = () => {
    const result = [];

    if (currentChapterIndex >= chapters.length - 2) {
      // 最後の方の章の場合：現在章より後をすべて表示
      for (let i = currentChapterIndex + 1; i < chapters.length; i++) {
        result.push(i);
      }
      // 3つに満たない場合は null で埋める（空白表示用）
      while (result.length < 1) {
        result.push(null);
      }
    } else {
      // 中間の章の場合：現在章の直後3つを表示
      result.push(currentChapterIndex + 1);
    }

    return result.slice(0, 3); // 最初の3つを取得
  };

  const previousChapters = getPreviousChapters();
  const nextChapters = getNextChapters();

  return (
    <View style={styles.container}>
      {/* はじめからボタン */}
      <View style={[styles.buttonWrapper, { marginBottom: 8 }]}>
        <NonverbalRestartButtonVertical
          onPress={onRestartFromBeginning}
          currentChapterIndex={currentChapterIndex}
          getLocalizedText={getLocalizedText}
          isTemporarilyDisabled={isTemporarilyDisabled}
        />
      </View>

      {/* まえボタン */}
      <View style={styles.buttonWrapper}>
        <NonverbalPreviousChapterLandscapeButton
          ref={previousChapterButtonRef}
          onPress={onPreviousChapter}
          currentChapterIndex={currentChapterIndex}
          getLocalizedText={getLocalizedText}
          isTemporarilyDisabled={isTemporarilyDisabled}
        />
      </View>

      {/* 前の章番号（最大3つ、先頭が3点リーダーに置き換わる場合あり） */}
      {previousChapters.map((chapterIndex, index) => (
        <View key={`prev-${index}`} style={styles.chapterNumberWrapper}>
          <AnimatedChapterNumberVertical
            chapterIndex={chapterIndex}
            isEllipsis={false}
            defaultOpacity={0.5}
          />
        </View>
      ))}

      {/* もういちどボタン（現在の章） */}
      <View style={styles.buttonWrapper}>
        <NonverbalReplayLandscapeButton
          ref={replayButtonRef}
          onPress={onReplay}
          currentChapterIndex={currentChapterIndex}
          nonverbalSegmentPlayback={nonverbalSegmentPlayback}
          getLocalizedText={getLocalizedText}
          isTemporarilyDisabled={isTemporarilyDisabled}
        />
      </View>

      {/* 後の章番号（最大3つ、最後が3点リーダーに置き換わる場合あり） */}
      {nextChapters.map((chapterIndex, index) => (
        <View key={`next-${index}`} style={styles.chapterNumberWrapper}>
          <AnimatedChapterNumberVertical
            chapterIndex={chapterIndex}
            isEllipsis={false}
            defaultOpacity={0.5}
          />
        </View>
      ))}

      {/* つぎボタン */}
      <View style={styles.buttonWrapper}>
        <NonverbalNextChapterLandscapeButton
          ref={nextChapterButtonRef}
          chapters={chapters}
          onPress={isLastChapterCompleted ? onComplete : onNextChapter}
          stringFigure={stringFigure}
          currentChapterIndex={currentChapterIndex}
          isLastChapterCompleted={isLastChapterCompleted}
          getLocalizedText={getLocalizedText}
          isTemporarilyDisabled={isTemporarilyDisabled}
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

export default ChapterNavigationVerticalBarNonverbal;
