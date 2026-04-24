export const FIGURE_98_FISH_TRAP_VIDEOS = {
  1: require('../../../assets/string-figures/98_fish-trap/chapters/01.mp4'),
  2: require('../../../assets/string-figures/98_fish-trap/chapters/02-1.mp4'),
  3: require('../../../assets/string-figures/98_fish-trap/chapters/03-1.mp4'),
  4: require('../../../assets/string-figures/98_fish-trap/chapters/04-1.mp4'),
  5: require('../../../assets/string-figures/98_fish-trap/chapters/05-1.mp4'),
  6: require('../../../assets/string-figures/98_fish-trap/chapters/06-1.mp4'),
  7: require('../../../assets/string-figures/98_fish-trap/chapters/07-1.mp4'),
  8: require('../../../assets/string-figures/98_fish-trap/chapters/08-1.mp4'),
};

export const FIGURE_98_FISH_TRAP_NONVERBAL_VIDEO_PAIRS = {
  1: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/01-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/01-2.mp4'),
  },
  2: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/02-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/02-2.mp4'),
  },
  3: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/03-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/03-2.mp4'),
  },
  4: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/04-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/04-2.mp4'),
  },
  5: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/05-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/05-2.mp4'),
  },
  6: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/06-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/06-2.mp4'),
  },
  7: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/07-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/07-2.mp4'),
  },
  8: {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/08-1.mp4'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/08-2.mp4'),
  },
};

export const FIGURE_98_FISH_TRAP_NONVERBAL_TOTAL_CHAPTERS = 8;

/**
 * フィルムストリップ各行に対応する静止画（primary / secondary に加え、可視スロット2・3用の standby）。
 * 要素数は「再生チャプター数 + 1」: 最後はストリップ末尾プレビュー用（最終章と同一構図の別カット等）。
 */
export const FIGURE_98_FISH_TRAP_NONVERBAL_CHAPTER_STILL_PAIRS = [
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/01-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/01-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/01-1.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/02-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/02-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/00.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/03-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/03-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/01-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/04-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/04-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/02-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/05-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/05-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/03-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/06-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/06-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/04-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/07-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/07-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/05-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/08-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/08-1.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/06-2.jpg'),
  },
  /** 再生は最終章まで。ストリップ末尾のプレビュー用に直前スロットと別画像 */
  {
    primary: require('../../../assets/string-figures/98_fish-trap/chapters/08-1.jpg'),
    secondary: require('../../../assets/string-figures/98_fish-trap/chapters/08-2.jpg'),
    standby: require('../../../assets/string-figures/98_fish-trap/chapters/07-2.jpg'),
  },
] as const;
