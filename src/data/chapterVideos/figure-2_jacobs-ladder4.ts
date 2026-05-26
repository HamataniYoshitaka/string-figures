/** 一旦 2_jacobs-ladder4 と同一アセット・4章構成。本番用に差し替え時はパスと章数を更新する */
export const FIGURE_2_JACOBS_LADDER4_NONVERBAL_VIDEO_PAIRS = {
  1: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/01-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/01-2.mp4'),
  },
  2: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/02-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/02-2.mp4'),
  },
  3: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/03-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/03-2.mp4'),
  },
  4: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/04-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/04-2.mp4'),
  },
  5: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/05-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/05-2.mp4'),
  },
  6: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/06-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/06-2.mp4'),
  },
  7: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/07-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/07-2.mp4'),
  },
  8: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/08-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/08-2.mp4'),
  },
  9: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/09-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/09-2.mp4'),
  },
  10: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/10-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/10-2.mp4'),
  },
  11: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/11-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/11-2.mp4'),
  },
  12: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/12-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/12-2.mp4'),
  },
  13: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/13-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/13-2.mp4'),
  },
  14: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/14-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/14-2.mp4'),
  },
  15: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/15-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/15-2.mp4'),
  },
  16: {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/16-1.mp4'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/16-2.mp4'),
  },
};

export const FIGURE_2_JACOBS_LADDER4_NONVERBAL_TOTAL_CHAPTERS = 16;

/**
 * フィルムストリップ各行に対応する静止画（primary / secondary に加え、可視スロット2・3用の standby）。
 * 要素数は「再生チャプター数 + 1」: 最後はストリップ末尾プレビュー用（最終章と同一構図の別カット等）。
 */
export const FIGURE_2_JACOBS_LADDER4_NONVERBAL_CHAPTER_STILL_PAIRS = [
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/01-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/01-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/01-1.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/02-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/02-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/00.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/03-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/03-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/01-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/04-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/04-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/02-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/05-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/05-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/03-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/06-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/06-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/04-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/07-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/07-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/05-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/08-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/08-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/06-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/09-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/09-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/07-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/10-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/10-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/08-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/11-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/11-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/09-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/12-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/12-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/10-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/13-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/13-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/11-2.jpg'),
  },  
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/14-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/14-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/12-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/15-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/15-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/13-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/16-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/16-1.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/14-2.jpg'),
  },
  /** 再生は最終章まで。ストリップ末尾のプレビュー用に直前スロットと別画像 */
  {
    primary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/04-1.jpg'),
    secondary: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/16-2.jpg'),
    standby: require('../../../assets/string-figures/2_jacobs-ladder4/chapters/15-2.jpg'),
  },
] as const;
