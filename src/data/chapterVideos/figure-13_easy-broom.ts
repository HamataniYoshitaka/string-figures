export const FIGURE_13_EASY_BROOM_VIDEOS = {
  1: require('../../../assets/string-figures/13_easy-broom/chapters/01-1.mp4'),
  2: require('../../../assets/string-figures/13_easy-broom/chapters/02-1.mp4'),
  3: require('../../../assets/string-figures/13_easy-broom/chapters/03-1.mp4'),
  4: require('../../../assets/string-figures/13_easy-broom/chapters/04-1.mp4'),
};

export const FIGURE_13_EASY_BROOM_NONVERBAL_VIDEO_PAIRS = {
  1: {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/01-1.mp4'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/01-2.mp4'),
  },
  2: {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/02-1.mp4'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/02-2.mp4'),
  },
  3: {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/03-1.mp4'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/03-2.mp4'),
  },
  4: {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/04-1.mp4'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/04-2.mp4'),
  },
};

export const FIGURE_13_EASY_BROOM_NONVERBAL_CHAPTER_STILL_PAIRS = [
  {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/01-1.jpg'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/01-1.jpg'),
    standby: require('../../../assets/string-figures/13_easy-broom/chapters/01-1.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/02-1.jpg'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/02-1.jpg'),
    standby: require('../../../assets/string-figures/13_easy-broom/chapters/00.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/03-1.jpg'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/03-1.jpg'),
    standby: require('../../../assets/string-figures/13_easy-broom/chapters/01-2.jpg'),
  },
  {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/04-1.jpg'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/04-1.jpg'),
    standby: require('../../../assets/string-figures/13_easy-broom/chapters/02-2.jpg'),
  },
  /** 再生は最終章まで。ストリップ末尾のプレビュー用に直前スロットと別画像 */
  {
    primary: require('../../../assets/string-figures/13_easy-broom/chapters/04-1.jpg'),
    secondary: require('../../../assets/string-figures/13_easy-broom/chapters/04-1.jpg'),
    standby: require('../../../assets/string-figures/13_easy-broom/chapters/03-2.jpg'),
  },
] as const;

export const FIGURE_13_EASY_BROOM_NONVERBAL_TOTAL_CHAPTERS = 4;
