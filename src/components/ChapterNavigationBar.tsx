import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PreviousChapterButton, { PreviousChapterButtonRef } from './PreviousChapterButton';
import ReplayButton, { ReplayButtonRef } from './ReplayButton';
import NextChapterButton, { NextChapterButtonRef } from './NextChapterButton';
import { Chapter } from '../types';

interface ChapterNavigationBarProps {
  chapters: Chapter[];
  currentChapterIndex: number;
  onPreviousChapter: () => void;
  onReplay: () => void;
  onNextChapter: () => void;
  getLocalizedText: (text: { ja: string; en: string }) => string;
  // 既存のボタンrefs
  previousChapterButtonRef: React.RefObject<PreviousChapterButtonRef | null>;
  replayButtonRef: React.RefObject<ReplayButtonRef | null>;
  nextChapterButtonRef: React.RefObject<NextChapterButtonRef | null>;
  // 追加のprops
  playbackPosition: number;
  isLastChapterCompleted: boolean;
}

export interface ChapterNavigationBarRef {
  // 必要に応じて後で追加
}

const ChapterNavigationBar = forwardRef<ChapterNavigationBarRef, ChapterNavigationBarProps>(({
  chapters,
  currentChapterIndex,
  onPreviousChapter,
  onReplay,
  onNextChapter,
  getLocalizedText,
  previousChapterButtonRef,
  replayButtonRef,
  nextChapterButtonRef,
  playbackPosition,
  isLastChapterCompleted,
}, ref) => {
  
  useImperativeHandle(ref, () => ({}));

  // 表示する章番号を計算
  const getLeftChapters = () => {
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

  const getRightChapters = () => {
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

  const leftChapters = getLeftChapters();
  const rightChapters = getRightChapters();

  const renderChapterNumber = (chapterIndex: number | null, isActive: boolean, isEllipsis: boolean = false) => {
    // chapterIndexがnullの場合は空白を表示
    if (chapterIndex === null) {
      return (
        <View style={styles.emptyChapterContainer}>
          {/* 空白 */}
        </View>
      );
    }
    
    // 3点リーダーの場合
    if (isEllipsis) {
      return (
        <View style={styles.chapterContainer}>
          <Text style={styles.chapterText}>...</Text>
        </View>
      );
    }
    
    const chapterNumber = chapterIndex + 1;
    
    return (
      <View style={styles.chapterContainer}>
        <Text style={styles.chapterText}>{chapterNumber}</Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.navigationRow}>
        {/* まえボタン */}
        <View style={styles.buttonContainer}>
          <PreviousChapterButton
            ref={previousChapterButtonRef}
            onPress={onPreviousChapter}
            currentChapterIndex={currentChapterIndex}
            getLocalizedText={getLocalizedText}
          />
        </View>

        {/* 左側の3つの数字 */}
        <View style={styles.chaptersContainer}>
          {leftChapters.map((chapterIndex, index) => (
            <View key={`left-${chapterIndex !== null ? chapterIndex : `empty-${index}`}`} style={styles.chapterNumberWrapper}>
              {renderChapterNumber(
                chapterIndex, 
                chapterIndex === currentChapterIndex,
                index === 0 && chapterIndex !== null && currentChapterIndex > 3
              )}
            </View>
          ))}
        </View>

        {/* もういちどボタン */}
        <View style={styles.buttonContainer}>
          <ReplayButton
            ref={replayButtonRef}
            onPress={onReplay}
            currentChapterIndex={currentChapterIndex}
            playbackPosition={playbackPosition}
            getLocalizedText={getLocalizedText}
          />
        </View>

        {/* 右側の3つの数字 */}
        <View style={styles.chaptersContainer}>
          {rightChapters.map((chapterIndex, index) => (
            <View key={`right-${chapterIndex !== null ? chapterIndex : `empty-${index}`}`} style={[styles.chapterNumberWrapper, {opacity: 0.4}]}>
              {renderChapterNumber(
                chapterIndex, 
                chapterIndex === currentChapterIndex,
                index === 2 && chapterIndex !== null && currentChapterIndex < chapters.length - 4
              )}
            </View>
          ))}
        </View>

        {/* つぎボタン */}
        <View style={styles.buttonContainer}>
          <NextChapterButton
            ref={nextChapterButtonRef}
            chapters={chapters}
            onPress={isLastChapterCompleted ? onNextChapter : onNextChapter}
            currentChapterIndex={currentChapterIndex}
            isLastChapterCompleted={isLastChapterCompleted}
            getLocalizedText={getLocalizedText}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 52,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    position: 'relative',
  },
  chaptersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  chapterNumberWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
  },
  chapterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  chapterText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
  },
  emptyChapterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    minWidth: 16,
  },
});

export default ChapterNavigationBar;
