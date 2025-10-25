import { StringFigure } from '../types';

const stringFiguresDirectory = '../../assets/string-figures';
export const stringFigures: StringFigure[] = [
  {
    id: '1',
    name: { ja: '星', en: 'Star' },
    difficulty: 'easy',
    directory: '1_star',
    // thumbnail: require(`${stringFiguresDirectory}/1_star/thumbnail.jpg`),
    thumbnail: require(`${stringFiguresDirectory}/1_star/giphy.gif`),
    patternImage: require(`${stringFiguresDirectory}/1_star/pattern.jpg`),
    previewUrl: require(`${stringFiguresDirectory}/1_star/preview.mp4`),
    description: { ja: '手のひらにかわいい星ができます。短め、太めの紐を使うと良いでしょう', en: 'A cute star can be made on the palm. It is good to use short and thick string.' },
    premiumCourseId: 0, // 無料
    chapters: [
      {
      subtitle: { ja: '左手の親指と小指に紐をかけます', en: 'Chapter 1' },
      videoUrl: require('../../assets/string-figures/1_star/chapters/1.mp4'),
      },
      {
      subtitle: { ja: '右手のひらを上にして輪の中に上から入れ、右手の親指と小指に紐をかけます', en: 'Chapter 2' },
      videoUrl: require('../../assets/string-figures/1_star/chapters/2.mp4'),
      },
      {
      subtitle: { ja: '右手全体を半回転させます', en: 'Chapter 3' },
      videoUrl: require('../../assets/string-figures/1_star/chapters/3.mp4'),
      },
          {
      subtitle: { ja: '左手の中指で、右手の親指と小指にかかっている糸を取ります', en: 'Chapter 4' },
      videoUrl: require('../../assets/string-figures/1_star/chapters/4.mp4'),
      },
  ]
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
    chapters: [
      {
        subtitle: { ja: '人差し指の構えから始めます。両手の親指の糸を外します', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/01.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、小指の向こう側の糸を下から取ります', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/02.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、人差し指の手前側の糸を超えて人差し指の向こう側の糸を取ります', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/03.mp4'),
      },
      {
        subtitle: { ja: '両方の小指の糸を外します', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/04.mp4'),
      },
      {
        subtitle: { ja: '両方の小指で、人差し指の糸をこえて親指の向こう側の糸を取ります', en: 'Chapter 5' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/05.mp4'),
      },
      {
        subtitle: { ja: '両方の親指の糸を全て外します', en: 'Chapter 6' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/06.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、人差し指の糸を越えて小指の手前側の糸を取ります', en: 'Chapter 7' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/07.mp4'),
      },
      {
        subtitle: { ja: '左手人差し指の手前側の糸を、親指に移します', en: 'Chapter 8' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/08.mp4'),
      },
      {
        subtitle: { ja: '左手親指の下の糸を、親指の上の糸を越えて外します（ナバホ取り）', en: 'Chapter 9' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/09.mp4'),
      },
      {
        subtitle: { ja: '右手人差し指の手前側の糸を、親指に移します', en: 'Chapter 10' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/10.mp4'),
      },
      {
        subtitle: { ja: '右手親指の下の糸を、親指の上の糸を越えて外します（ナバホ取り）', en: 'Chapter 11' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/11.mp4'),
      },      
      {
        subtitle: { ja: '親指と人差し指の間にある三角の輪に人差し指を上から差し入れます', en: 'Chapter 12' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/12_1.mp4'),
      },
      {
        subtitle: { ja: '両手の小指の糸を外します', en: 'Chapter 13' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/13.mp4'),
      },
      {
        subtitle: { ja: '手を向こう側に向け、人差し指と親指を広げて完成です', en: 'Chapter 14' },
        videoUrl: require('../../assets/string-figures/2_jacobs-ladder/chapters/14.mp4'),
      },
    ]
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
    chapters: [
      {
        subtitle: { ja: '人差し指の構えから始めます。両手の親指で小指の手前の糸を取ります', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/3_spiderweb/chapters/1.mp4'),
      },
      {
        subtitle: { ja: '両手の人差し指を、人差し指の前にある三角の輪に上から差し入れます', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/3_spiderweb/chapters/2.mp4'),
      },
      {
        subtitle: { ja: '小指の糸を外し、人差し指を広げます', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/3_spiderweb/chapters/3.mp4'),
      },
      {
        subtitle: { ja: '人差し指の糸を中指に移します', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/3_spiderweb/chapters/4.mp4'),
      },
      {
        subtitle: { ja: '両手の親指の間に掛かっている糸だけを外します（ナバホ取り）', en: 'Chapter 5' },
        videoUrl: require('../../assets/string-figures/3_spiderweb/chapters/5.mp4'),
      },
      {
        subtitle: { ja: '両手の親指の前にある三角の輪に親指を差し入れます', en: 'Chapter 6' },
        videoUrl: require('../../assets/string-figures/3_spiderweb/chapters/6.mp4'),
      }
    ]
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
    chapters: [
      {
        subtitle: { ja: '第1章', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/1.mp4'),
      },
      {
        subtitle: { ja: '第2章', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/2.mp4'),
      },
      {
        subtitle: { ja: '第3章', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/3.mp4'),
      },
      {
        subtitle: { ja: '第4章', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/4.mp4'),
      },
      {
        subtitle: { ja: '第5章', en: 'Chapter 5' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/5.mp4'),
      },
      {
        subtitle: { ja: '第6章', en: 'Chapter 6' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/6.mp4'),
      },
      {
        subtitle: { ja: '第7章', en: 'Chapter 7' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/7.mp4'),
      },
      {
        subtitle: { ja: '第8章', en: 'Chapter 8' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/8.mp4'),
      },
      {
        subtitle: { ja: '第9章', en: 'Chapter 9' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/9.mp4'),
      },
      {
        subtitle: { ja: '第10章', en: 'Chapter 10' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/10.mp4'),
      },
      {
        subtitle: { ja: '第11章', en: 'Chapter 11' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/11.mp4'),
      },
      {
        subtitle: { ja: '第12章', en: 'Chapter 12' },
        videoUrl: require('../../assets/string-figures/4_volcano/chapters/12.mp4'),
      }

    ]
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
    chapters: [
      {
        subtitle: { ja: '人差し指の構えから始めます。両方の親指で、人差し指の2本の糸を超えて小指の手前の糸を取ります', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/1.mp4'),
      },
      {
        subtitle: { ja: '両方の中指で、親指の向こう側の糸を取ります', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/2.mp4'),
      },
      {
        subtitle: { ja: '両方の親指の糸を全て外します', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/3.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、人差し指の手前の糸を押し下げて、小指の向こう側の糸を取ります', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/4.mp4'),
      },
      {
        subtitle: { ja: '両方の小指の糸を全て外します', en: 'Chapter 5' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/5.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、人差し指の2本の糸を押し下げて中指の向こう側の糸を取ります', en: 'Chapter 6' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/6.mp4'),
      },
      {
        subtitle: { ja: '両方の人差し指で、親指と中指にかかっている糸を取ります', en: 'Chapter 7' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/7.mp4'),
      },
      {
        subtitle: { ja: '両方の中指の全て外します', en: 'Chapter 8' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/8.mp4'),
      },
      {
        subtitle: { ja: '左手の親指と人差し指にかかっている上の糸を残したまま、下の糸を外します', en: 'Chapter 9' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/9.mp4'),
      },
      {
        subtitle: { ja: '右手の親指と人差し指にかかっている上の糸を残したまま、下の糸を外します', en: 'Chapter 10' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/10.mp4'),
      },
      {
        subtitle: { ja: '両手の親指で、親指の向こう側の糸を上から取ります。親指の手前側の糸は自然に外れます', en: 'Chapter 11' },
        videoUrl: require('../../assets/string-figures/5_many-stars/chapters/11.mp4'),
      }
    ]
  },
];
