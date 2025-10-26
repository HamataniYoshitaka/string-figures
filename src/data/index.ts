import { StringFigure } from '../types';

export const stringFigures: StringFigure[] = [
  {
    id: '1',
    name: { ja: '星', en: 'Star' },
    difficulty: 'easy',
    directory: '1_star',
    thumbnail: require(`../../assets/string-figures/1_star/giphy.gif`),
    patternImage: require(`../../assets/string-figures/1_star/pattern.jpg`),
    previewUrl: require(`../../assets/string-figures/1_star/preview.mp4`),
    description: { ja: '手のひらにかわいい星ができます。短め、太めの紐を使うと良いでしょう', en: 'A cute star can be made on the palm. It is good to use short and thick string.' },
    premiumCourseId: 0, // 無料

  },
  {
    id: '2', 
    name: { ja: '四段ばしご', en: 'Jacob\'s Ladder' },
    difficulty: 'easy',
    directory: '2_jacobs-ladder',
    thumbnail: require('../../assets/string-figures/2_jacobs-ladder/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/2_jacobs-ladder/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/2_jacobs-ladder/preview.mp4'),
    description: { ja: '日本では中指を主に使う「四段ばしご」、世界では人差し指を使う「ヤコブの梯子」という名前で知られています。ここでは人差し指を使ってとる方法を紹介します。', en: 'Description for Jacob\'s Ladder.' },
    premiumCourseId: 0, // 無料
    
  },
  {
    id: '3',
    name: { ja: '蜘蛛の巣', en: 'Spiderweb' },
    difficulty: 'easy',
    directory: '3_spiderweb',
    thumbnail: require('../../assets/string-figures/3_spiderweb/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/3_spiderweb/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/3_spiderweb/preview.mp4'),
    description: { ja: '蜘蛛の巣の説明文です。', en: 'Description for Spiderweb.' },
    premiumCourseId: 1, // 有料コース1
    
  },
  {
    id: '4',
    name: { ja: '火山', en: 'Volcano' },
    difficulty: 'medium',
    directory: '4_volcano',
    thumbnail: require('../../assets/string-figures/4_volcano/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/4_volcano/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/4_volcano/preview.mp4'),
    description: { ja: '火山の説明文です。', en: 'Description for Volcano.' },
    premiumCourseId: 2, // 有料コース2
    
  },
  {
    id: '5',
    name: { ja: 'たくさんの星', en: 'Many Stars' },
    difficulty: 'easy',
    directory: '5_many-stars',
    thumbnail: require('../../assets/string-figures/5_many-stars/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/5_many-stars/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/5_many-stars/preview.mp4'),
    description: { ja: 'たくさんの星の説明文です。', en: 'Description for Many Stars.' },
    premiumCourseId: 0, // 無料
    
  },
];
