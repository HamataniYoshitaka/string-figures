import { StringFigure } from '../types';

export const dummyStringFigures: StringFigure[] = [
  {
    id: '1',
    name: 'アムワンキョ',
    difficulty: 'medium',
    thumbnail: require('../../assets/thumbnail1.jpg'),
    patternImage: '',
    previewUrl: '',
    videoUrl: '',
    description: 'アムワンキョの説明文です。',
    isBookmarked: false,
    premiumCourseId: 0, // 無料
  },
  {
    id: '2', 
    name: 'ふたつの星',
    difficulty: 'easy',
    thumbnail: require('../../assets/thumbnail2.jpg'),
    patternImage: '',
    previewUrl: '',
    videoUrl: '',
    description: 'ふたつの星の説明文です。',
    isBookmarked: true,
    premiumCourseId: 0, // 無料
  },
  {
    id: '3',
    name: 'シベリアの家',
    difficulty: 'hard',
    thumbnail: require('../../assets/thumbnail3.jpg'),
    patternImage: '',
    previewUrl: '',
    videoUrl: '',
    description: 'シベリアの家の説明文です。',
    isBookmarked: false,
    premiumCourseId: 1, // 有料コース1
  },
  {
    id: '4',
    name: 'イヌイットの網',
    difficulty: 'medium',
    thumbnail: require('../../assets/thumbnail4.jpg'),
    patternImage: '',
    previewUrl: '',
    videoUrl: '',
    description: 'イヌイットの網の説明文です。伝統的な漁網のパターンを模したあやとりです。',
    isBookmarked: false,
    premiumCourseId: 2, // 有料コース2
  },
];
