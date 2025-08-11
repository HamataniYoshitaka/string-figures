import { StringFigure } from '../types';

export const dummyStringFigures: StringFigure[] = [
  {
    id: '1',
    name: 'アムワンキョ',
    difficulty: 'medium',
    thumbnail: require('../../assets/string-figures/dummy1/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy1/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy2/preview.mp4'),
    videoUrl: require('../../assets/string-figures/dummy2/preview.mp4'),
    description: 'アムワンキョの説明文です。',
    isBookmarked: false,
    premiumCourseId: 0, // 無料
  },
  {
    id: '2', 
    name: 'ふたつの星',
    difficulty: 'easy',
    thumbnail: require('../../assets/string-figures/dummy2/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy2/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy2/preview.mp4'),
    videoUrl: require('../../assets/string-figures/dummy2/preview.mp4'),
    description: 'ふたつの星の説明文です。',
    isBookmarked: true,
    premiumCourseId: 0, // 無料
  },
  {
    id: '3',
    name: 'シベリアの家',
    difficulty: 'hard',
    thumbnail: require('../../assets/string-figures/dummy3/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy3/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy3/preview.mp4'),
    videoUrl: require('../../assets/string-figures/dummy3/preview.mp4'),
    description: 'シベリアの家の説明文です。',
    isBookmarked: false,
    premiumCourseId: 1, // 有料コース1
  },
  {
    id: '4',
    name: 'イヌイットの網',
    difficulty: 'medium',
    thumbnail: require('../../assets/string-figures/dummy4/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy4/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy4/preview.mp4'),
    videoUrl: require('../../assets/string-figures/dummy4/preview.mp4'),
    description: 'イヌイットの網の説明文です。伝統的な漁網のパターンを模したあやとりです。',
    isBookmarked: false,
    premiumCourseId: 2, // 有料コース2
  },
];
