export type NonverbalSegmentPlayback = {
  primaryDurationMs: number;
  primaryPlaybackPositionMs: number;
  secondaryDurationMs: number;
  secondaryPlaybackPositionMs: number;
};

export const EMPTY_NONVERBAL_SEGMENT_PLAYBACK: NonverbalSegmentPlayback = {
  primaryDurationMs: 0,
  primaryPlaybackPositionMs: 0,
  secondaryDurationMs: 0,
  secondaryPlaybackPositionMs: 0,
};

/** チャプター全体の長さ（primary + secondary）。両方揃うまで 0 を返す。 */
export function getNonverbalChapterTotalDurationMs(
  primaryDurationMs: number,
  secondaryDurationMs: number,
): number {
  if (primaryDurationMs > 0 && secondaryDurationMs > 0) {
    return primaryDurationMs + secondaryDurationMs;
  }
  return 0;
}

/**
 * 現在チャプターの再生進捗（0〜1）。
 * 例: primary 5s + secondary 10s で primary 終了時 → 5/15 ≈ 0.33
 */
export function getNonverbalCurrentChapterProgress(
  playback: NonverbalSegmentPlayback,
): number {
  const total = getNonverbalChapterTotalDurationMs(
    playback.primaryDurationMs,
    playback.secondaryDurationMs,
  );
  if (total <= 0) return 0;

  const position =
    playback.primaryPlaybackPositionMs + playback.secondaryPlaybackPositionMs;
  return Math.min(1, position / total);
}

export function getNonverbalCompositePlaybackPositionMs(
  playback: NonverbalSegmentPlayback,
): number {
  return playback.primaryPlaybackPositionMs + playback.secondaryPlaybackPositionMs;
}
