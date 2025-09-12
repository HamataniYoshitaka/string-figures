import { StringFigure } from '../types';

export const dummyStringFigures: StringFigure[] = [
  {
    id: '1',
    name: { ja: '星', en: 'Star' },
    difficulty: 'easy',
    thumbnail: require('../../assets/string-figures/dummy1/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy1/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy2/preview.mp4'),
    description: { ja: '手のひらにかわいい星ができます。短め、太めの紐を使うと良いでしょう', en: 'A cute star can be made on the palm. It is good to use short and thick string.' },
    premiumCourseId: 0, // 無料
    chapters: [
      {
        subtitle: { ja: '左手の親指と小指に紐をかけます', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/dummy1/chapters/1.mp4'),
      },
      {
        subtitle: { ja: '右手のひらを上にして輪の中に上から入れ、右手の親指と小指に紐をかけます', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/dummy1/chapters/2.mp4'),
      },
      {
        subtitle: { ja: '右手全体を半回転させます', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/dummy1/chapters/3.mp4'),
      },
            {
        subtitle: { ja: '左手の中指で、右手の親指と小指にかかっている糸を取ります', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/dummy1/chapters/4.mp4'),
      },
    ]
  },
  {
    id: '2', 
    name: { ja: 'ふたつの星', en: 'Two Stars' },
    difficulty: 'easy',
    thumbnail: require('../../assets/string-figures/dummy2/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy2/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy2/preview.mp4'),
    description: { ja: 'ふたつの星の説明文です。', en: 'Description for Two Stars.' },
    premiumCourseId: 0, // 無料
    chapters: [
      {
        subtitle: { ja: '第1章', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/1.mp4'),
      },
      {
        subtitle: { ja: '第2章', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/2.mp4'),
      },
      {
        subtitle: { ja: '第3章', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/3.mp4'),
      },
      {
        subtitle: { ja: '第4章', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/4.mp4'),
      },
    ]
  },
  {
    id: '3',
    name: { ja: 'シベリアの家', en: 'Siberian House' },
    difficulty: 'hard',
    thumbnail: require('../../assets/string-figures/dummy3/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy3/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy3/preview.mp4'),
    description: { ja: 'シベリアの家の説明文です。', en: 'Description for Siberian House.' },
    premiumCourseId: 1, // 有料コース1
    chapters: [
      {
        subtitle: { ja: '第1章', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/dummy3/chapters/1.mp4'),
      },
      {
        subtitle: { ja: '第2章', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/dummy3/chapters/2.mp4'),
      },
      {
        subtitle: { ja: '第3章', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/dummy3/chapters/3.mp4'),
      },
      {
        subtitle: { ja: '第4章', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/dummy3/chapters/4.mp4'),
      }
    ]
  },
  {
    id: '4',
    name: { ja: 'イヌイットの網', en: 'Inuit Net' },
    difficulty: 'medium',
    thumbnail: require('../../assets/string-figures/dummy4/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy4/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy4/preview.mp4'),
    description: { ja: 'イヌイットの網の説明文です。伝統的な漁網のパターンを模したあやとりです。', en: 'Description for Inuit Net. Traditional fishing net pattern string figure.' },
    premiumCourseId: 2, // 有料コース2
    chapters: [
      {
        subtitle: { ja: '第1章', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/dummy4/chapters/1.mp4'),
      },
      {
        subtitle: { ja: '第2章', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/dummy4/chapters/2.mp4'),
      },
      {
        subtitle: { ja: '第3章', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/dummy4/chapters/3.mp4'),
      },
      {
        subtitle: { ja: '第4章', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/dummy4/chapters/4.mp4'),
      },
    ]
  },
];
