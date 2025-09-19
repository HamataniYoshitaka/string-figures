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
    name: { ja: '四段ばしご', en: 'Jacob\'s Ladder' },
    difficulty: 'easy',
    thumbnail: require('../../assets/string-figures/dummy2/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy2/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy2/preview.mp4'),
    description: { ja: '日本では中指を主に使う「四段ばしご」、世界では人差し指を使う「ヤコブの梯子」という名前で知られています。ここでは人差し指を使ってとる方法を紹介します。', en: 'Description for Jacob\'s Ladder.' },
    premiumCourseId: 0, // 無料
    chapters: [
      {
        subtitle: { ja: '人差し指の構えから始めます。両手の親指の糸を外します', en: 'Chapter 1' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/01.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、小指の向こう側の糸を下から取ります', en: 'Chapter 2' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/02.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、人差し指の手前側の糸を超えて人差し指の向こう側の糸を取ります', en: 'Chapter 3' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/03.mp4'),
      },
      {
        subtitle: { ja: '両方の小指の糸を外します', en: 'Chapter 4' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/04.mp4'),
      },
      {
        subtitle: { ja: '両方の小指で、人差し指の糸をこえて親指の向こう側の糸を取ります', en: 'Chapter 5' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/05.mp4'),
      },
      {
        subtitle: { ja: '両方の親指の糸を全て外します', en: 'Chapter 6' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/06.mp4'),
      },
      {
        subtitle: { ja: '両方の親指で、人差し指の糸を越えて小指の手前側の糸を取ります', en: 'Chapter 7' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/07.mp4'),
      },
      {
        subtitle: { ja: '左手人差し指の手前側の糸を、親指に移します', en: 'Chapter 8' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/08.mp4'),
      },
      {
        subtitle: { ja: '左手親指の下の糸を、親指の上の糸を越えて外します（ナバホ取り）', en: 'Chapter 9' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/09.mp4'),
      },
      {
        subtitle: { ja: '右手人差し指の手前側の糸を、親指に移します', en: 'Chapter 10' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/10.mp4'),
      },
      {
        subtitle: { ja: '右手親指の下の糸を、親指の上の糸を越えて外します（ナバホ取り）', en: 'Chapter 11' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/11.mp4'),
      },      
      {
        subtitle: { ja: '親指と人差し指の間にある三角の輪に人差し指を上から差し入れます', en: 'Chapter 12' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/12_1.mp4'),
      },
      {
        subtitle: { ja: '両手の小指の糸を外します', en: 'Chapter 13' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/13.mp4'),
      },
      {
        subtitle: { ja: '手を向こう側に向け、人差し指と親指を広げて完成です', en: 'Chapter 14' },
        videoUrl: require('../../assets/string-figures/dummy2/chapters/14.mp4'),
      },
    ]
  },
  {
    id: '3',
    name: { ja: '蜘蛛の巣', en: 'Spiderweb' },
    difficulty: 'easy',
    thumbnail: require('../../assets/string-figures/dummy3/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/dummy3/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/dummy3/preview.mp4'),
    description: { ja: '蜘蛛の巣の説明文です。', en: 'Description for Spiderweb.' },
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
      },
      {
        subtitle: { ja: '第5章', en: 'Chapter 5' },
        videoUrl: require('../../assets/string-figures/dummy3/chapters/5.mp4'),
      },
      {
        subtitle: { ja: '第6章', en: 'Chapter 6' },
        videoUrl: require('../../assets/string-figures/dummy3/chapters/6.mp4'),
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
