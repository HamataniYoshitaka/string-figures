import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PreviousChapterLandscapeButton, { PreviousChapterLandscapeButtonRef } from './PreviousChapterLandscapeButton';
import ReplayLandscapeButton, { ReplayLandscapeButtonRef } from './ReplayLandscapeButton';
import NextChapterLandscapeButton, { NextChapterLandscapeButtonRef } from './NextChapterLandscapeButton';
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

  // 表示する章番号を計算
  const getPreviousChapters = () => {
    const result = [];
    
    // 現在の章より前の章を最大2つ取得
    if (currentChapterIndex >= 2) {
      // 2つ以上前の章がある場合
      result.push(currentChapterIndex - 2);
      result.push(currentChapterIndex - 1);
    } else if (currentChapterIndex === 1) {
      // 1つ前の章のみ
      result.push(null);
      result.push(currentChapterIndex - 1);
    } else {
      // 前の章がない
      result.push(null);
      result.push(null);
    }
    
    return result;
  };

  const getNextChapters = () => {
    const result = [];
    
    // 現在の章より後の章を最大2つ取得
    if (currentChapterIndex <= chapters.length - 3) {
      // 2つ以上後の章がある場合
      result.push(currentChapterIndex + 1);
      result.push(currentChapterIndex + 2);
    } else if (currentChapterIndex === chapters.length - 2) {
      // 1つ後の章のみ
      result.push(currentChapterIndex + 1);
      result.push(null);
    } else {
      // 後の章がない
      result.push(null);
      result.push(null);
    }
    
    return result;
  };

  const previousChapters = getPreviousChapters();
  const nextChapters = getNextChapters();
  
  // 3点リーダーを表示するかどうか（前の章が3つ以上ある場合）
  const showEllipsisBefore = currentChapterIndex >= 3;

  const renderChapterNumber = (chapterIndex: number | null, isPrevious: boolean) => {
    // chapterIndexがnullの場合は空白を表示
    if (chapterIndex === null) {
      return (
        <View style={styles.emptyChapterContainer}>
          {/* 空白 */}
        </View>
      );
    }
    
    const chapterNumber = chapterIndex + 1;
    
    return (
      <View style={styles.chapterContainer}>
        <Text style={[styles.chapterText, isPrevious ? styles.previousChapterText : styles.nextChapterText]}>
          {chapterNumber}
        </Text>
      </View>
    );
  };

  const renderEllipsis = () => {
    return (
      <View style={styles.ellipsisContainer}>
        <Text style={styles.ellipsisText}>...</Text>
      </View>
    );
  };

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

      {/* 3点リーダー（必要に応じて） */}
      {showEllipsisBefore && (
        <View style={styles.ellipsisWrapper}>
          {renderEllipsis()}
        </View>
      )}

      {/* 前の章番号（最大2つ） */}
      {previousChapters.map((chapterIndex, index) => (
        <View key={`prev-${chapterIndex !== null ? chapterIndex : `empty-${index}`}`} style={styles.chapterNumberWrapper}>
          {renderChapterNumber(chapterIndex, true)}
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

      {/* 後の章番号（最大2つ） */}
      {nextChapters.map((chapterIndex, index) => (
        <View key={`next-${chapterIndex !== null ? chapterIndex : `empty-${index}`}`} style={styles.chapterNumberWrapper}>
          {renderChapterNumber(chapterIndex, false)}
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
    // height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    // height: 48,
  },
  chapterText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
  },
  previousChapterText: {
    color: '#57534D', // 前の章番号の色（ダークグレー）
  },
  nextChapterText: {
    color: '#A6A09B', // 後の章番号の色（ライトグレー）
  },
  emptyChapterContainer: {
    width: 48,
    // height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsisWrapper: {
    width: 48,
    // height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsisContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipsisText: {
    fontSize: 16,
    color: '#57534D',
    textAlign: 'center',
  },
});

export default ChapterNavigationVerticalBar;

