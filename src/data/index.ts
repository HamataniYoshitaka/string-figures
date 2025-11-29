import { StringFigure } from '../types';
import { ASSETS_MAP } from './assetsMap';

/**
 * あやとりの追加作業
 * - 新しいあやとりを追加する場合は、ここに情報を追加してください。
 * - `directory`は、`src/assets/string-figures/` 内のフォルダ名と一致させてください。
 * - `premiumCourseId` は、0が無料、1以降が有料コースのIDを示します。
 * - ./chaptersMap.ts にも同様の追加が必要です。
 * - ./chapterVideos/figure-{directoryName}.ts にも各あやとりの動画パスを追加してください。
 * - ./assetsMap.ts にも同様の追加が必要です。
 */

export const stringFigures: StringFigure[] = [
  {
    id: '6',
    name: { ja: '紐の結びかた', en: 'How to Tie Strings' },
    difficulty: 'basic',
    directory: '6_tieup',
    ...ASSETS_MAP['6_tieup'],
    description: { 
      ja: 'まずはあやとりに使う紐を作りましょう\nここでは簡単で結び目の小さい「相引き結び（テグス結び）」を紹介します。\n何種類かの長さの紐を用意して使い分けると良いでしょう', 
      en: 'First, learn how to tie the strings used for string figures.\nThis introduction will focus on the simple and small "Fisherman\'s Knot". It is recommended to prepare various lengths of strings to use them appropriately.' 
    },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '60',
    name: { ja: 'はじめの構え', en: 'Position 1' },
    difficulty: 'basic',
    directory: '60_position1',
    ...ASSETS_MAP['60_position1'],
    description: { 
      ja: '「はじめの構え」は、ほとんどのあやとりの開始位置となる、最も基本的な構えです', 
      en: 'The "Position 1" is the most basic position for most string figures.' 
    },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '61',
    name: { ja: '人差し指の構え', en: 'Opening A' },
    difficulty: 'basic',
    directory: '61_opening-a',
    ...ASSETS_MAP['61_opening-a'],
    description: { ja: '世界中のあやとりの多くが、この「人差し指の構え」から始まります', en: 'Most string figures in the world start with this "Opening A".' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '62',
    name: { ja: '中指の構え', en: 'Japanese Opening' },
    difficulty: 'basic',
    directory: '62_japanese-opening',
    ...ASSETS_MAP['62_japanese-opening'],
    description: { 
      ja: '日本のあやとりの多くが、この「中指の構え」から始まります。', 
      en: 'Most string figures in Japan start with this "Japanese Opening".' 
    },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '1',
    name: { ja: '星', en: 'Star' },
    difficulty: 'easy',
    directory: '1_star',
    ...ASSETS_MAP['1_star'],
    description: { ja: '手のひらにかわいい星ができます。短め、太めの紐を使うと良いでしょう', en: 'A cute star can be made on the palm. It is good to use short and thick string.' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '3',
    name: { ja: '蜘蛛の巣', en: 'Spiderweb' },
    difficulty: 'easy',
    directory: '3_spiderweb',
    ...ASSETS_MAP['3_spiderweb'],
    description: { 
      ja: '放射状の形が綺麗なあやとりです。紐を二重にすることで、よりバランスの取れた形を作りやすくなります', 
      en: 'A beautiful string figure with a radial shape. By doubling the string, you can make it even more beautiful.' 
    },
    premiumCourseId: 1, // 有料コース1
    data: null
  },
  {
    id: '4',
    name: { ja: '火山', en: 'Volcano' },
    difficulty: 'hard',
    directory: '4_volcano',
    ...ASSETS_MAP['4_volcano'],
    description: { ja: '中央の六角錐とその頂点を引き上げる糸を用いて、噴火する火山を立体的に表現した見事なあやとりです', en: 'This impressive string figure represents an erupting volcano in three dimensions, using a central hexagonal pyramid and the thread that lifts its peak.' },
    premiumCourseId: 2, // 有料コース2
    data: {
      region: { ja: 'パタゴニア', en: 'Patagonia' },
      source: 'R. Martínez-Crovetto, <i>Juegos de Hilo de los Aborígenes del Norte de Patagonia</i>, 1970 ',
      author: null,
      references: null
    }
  },
  {
    id: '5',
    name: { ja: 'たくさんの星', en: 'Many Stars' },
    difficulty: 'medium',
    directory: '5_many-stars',
    ...ASSETS_MAP['5_many-stars'],
    description: { 
      ja: '北アメリカのナバホ族に伝わるあやとりです。複雑な模様が、満天の星のきらめきを美しく表現します。', 
      en: 'This string figure comes from the Navajo people of the United States. Its intricate pattern beautifully expresses the sparkle of a star-filled sky.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: 'A. C. Haddon, <i>A Few American String Figures and Tricks</i>, 1903',
      author: null,
      references: null
    }
  },
  {
    id: '7',
    name: { ja: 'かたつむり', en: 'Snail' },
    difficulty: 'easy',
    directory: '7_snail',
    ...ASSETS_MAP['7_snail'],
    description: { 
      ja: '小さなかわいいかたつむりが出来上がります。両手を振って糸をぐるぐる巻きつけるという、ちょっと変わった手順があります', 
      en: 'The result is a small, charming snail. One of the steps is a bit unusual—you swing both hands and wind the string around in a circular motion.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: null,
      source: '有木昭久, 湯浅清四郎, <i>世界のあやとり傑作選</i>, 1974 ',
      author: { ja: '有木昭久', en: 'ARIKI Teruhisa' },
      references: null
    }
  },
  {
    id: '8',
    name: { ja: 'ゴム', en: 'Elastic Band' },
    difficulty: 'easy',
    directory: '8_elastic-band',
    ...ASSETS_MAP['8_elastic-band'],
    description: { 
      ja: '世界各地に伝わるあやとりです。糸が伸び縮みしているように見えます', 
      en: 'This string figure is popular around the world. It looks like a rubber band that stretches and contracts.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { 
        ja: 'ニュージーランド、日本、ハワイ、他', 
        en: 'New Zealand, Japan, Hawaii, etc.' 
      },
      source: 'J. C. Andersen, <i>Māori String Figures</i>, 1927 ',
      author: null,
      references: null
    }
  },
  {
    id: '9',
    name: { ja: '菊', en: 'Chrysanthemum' },
    difficulty: 'medium',
    directory: '9_chrysanthemum',
    ...ASSETS_MAP['9_chrysanthemum'],
    description: { 
      ja: '日本人にとって古くから親しまれている菊の花の形です。最後は手から糸を外すことであやとりが完成します', 
      en: 'This string figure forms the shape of a chrysanthemum, a flower long cherished in Japan. The figure is completed by removing the strings from your hands at the final step.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: '有木昭久, 湯浅清四郎, <i>楽しいあやとり遊び</i>, 1973 ',
      author: null,
      references: null
    }
  },
  {
    id: '10',
    name: { ja: '指ぬき', en: 'Magic Fingers' },
    difficulty: 'easy',
    directory: '10_magic-fingers',
    ...ASSETS_MAP['10_magic-fingers'],
    description: { ja: '世界中で親しまれているあやとりのトリックです', en: 'A world-renowned string figure trick.' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '11',
    name: { ja: 'ウインク', en: 'Winking Eye' },
    difficulty: 'easy',
    directory: '11_wink',
    ...ASSETS_MAP['11_wink'],
    description: { 
      ja: '紐を引くと目を閉じ、離すと目が開きます。アフリカでは「ニワトリの産卵」として知られているあやとりです', 
      en: 'When you pull the string, the eyes close; when you release it, the eyes open. In Africa, this string figure is known as “The Hen\'s Vent”' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'アフリカ, ハワイ, 他', en: 'Africa, Hawaii, etc.' },
      source: 'W. C. Farabee, <i>The Central Arawaks</i>, 1918',
      author: null,
      references: null
    }
  },
  {
    id: '12',
    name: { ja: '9つダイヤ', en: 'Nine Diamonds' },
    difficulty: 'easy',
    directory: '12_9-diamonds',
    ...ASSETS_MAP['12_9-diamonds'],
    description: { ja: '9つダイヤの説明文です。', en: 'Description for Nine Diamonds.' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '13',
    name: { ja: 'かんたんほうき', en: 'Easy Broom' },
    difficulty: 'easy',
    directory: '13_easy-broom',
    ...ASSETS_MAP['13_easy-broom'],
    description: { 
      ja: '一瞬でほうきの形が出来上がります。世界各地に広く分布する有名なあやとりです。日本では最後に両手を広げる際、手を1回叩きます', 
      en: 'The broom shape appears in an instant. This famous string figure is widely found around the world. In Japan, people clap their hands once as they spread them apart at the final step.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '世界中に広く分布', en: 'Worldwide distribution' },
      source: 'J. Teit, <i>The Thompson Indians of British Columbia</i>, 1900',
      author: null,
      references: null
    }
  },
  {
    id: '14',
    name: { ja: '足あと', en: 'Footprint' },
    difficulty: 'easy',
    directory: '14_footprint',
    ...ASSETS_MAP['14_footprint'],
    description: { 
      ja: 'かわいい足あとができます。大きさや色を変えて何個か並べるとより面白いでしょう。糸を二重にして取るのもおすすめです', 
      en: 'You can make cute footprints with this string figure. Lining up several of them with different sizes and colors will make it even more fun. It is also recommended to take the string double.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ボリビア', en: 'Bolivia' },
      source: 'S. Rydén, <i>South American String Figures</i>, 1934',
      author: null,
      references: null
    }
    },
  {
    id: '15',
    name: { ja: 'バナナ', en: 'Banana' },
    difficulty: 'easy',
    directory: '15_banana',
    ...ASSETS_MAP['15_banana'],
    description: { ja: 'バナナの説明文です。', en: 'Description for Banana.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '16',
    name: { ja: 'せんす', en: 'Sensu' },
    difficulty: 'easy',
    directory: '16_sensu',
    ...ASSETS_MAP['16_sensu'],
    description: { ja: '扇子の説明文です。', en: 'Description for Sensu.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '17',
    name: { ja: 'ほうき', en: 'Broom' },
    difficulty: 'easy',
    directory: '17_broom',
    ...ASSETS_MAP['17_broom'],
    description: { 
      ja: 'ほうき、パラシュートなどと呼ばれ、世界各地に広く分布する有名なあやとりです', 
      en: 'Known as “Broom” or “Parachute,” this famous string figure is widely found across many regions of the world.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '世界中に広く分布', en: 'Worldwide distribution' },
      source: 'G. Tessmann, <i>Die Kinderspiele der Pangwe</i>, 1912',
      author: null,
      references: null
    }
    },
  {
    id: '18',
    name: { ja: '富士山', en: 'Mt. Fuji' },
    difficulty: 'easy',
    directory: '18_mt-fuji',
    ...ASSETS_MAP['18_mt-fuji'],
    description: { ja: '富士山の説明文です。', en: 'Description for Mt. Fuji.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '19',
    name: { ja: '二人の首長', en: 'Two Chiefs' },
    difficulty: 'medium',
    directory: '19_two-chiefs',
    ...ASSETS_MAP['19_two-chiefs'],
    description: { ja: '二人の首長の説明文です。', en: 'Description for Two Chiefs.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '20',
    name: { ja: 'つづみ', en: 'Tuzumi' },
    difficulty: 'easy',
    directory: '20_tuzumi',
    ...ASSETS_MAP['20_tuzumi'],
    description: { ja: 'つづみの説明文です。', en: 'Description for Tuzumi.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '21',
    name: { ja: '菊水', en: 'Kikusui' },
    difficulty: 'medium',
    directory: '21_kikusui',
    ...ASSETS_MAP['21_kikusui'],
    description: { ja: '菊水の説明文です。', en: 'Description for Kikusui.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '22',
    name: { ja: 'やり投げ', en: 'Spear' },
    difficulty: 'easy',
    directory: '22_spear',
    ...ASSETS_MAP['22_spear'],
    description: { ja: 'やり投げの説明文です。', en: 'Description for Spear.' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '23',
    name: { ja: '指の散歩', en: 'Finger Stroll' },
    difficulty: 'easy',
    directory: '23_finger-stroll',
    ...ASSETS_MAP['23_finger-stroll'],
    description: { ja: '指の散歩の説明文です。', en: 'Description for Finger Stroll.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '24',
    name: { ja: '流れ星', en: 'Shooting Star' },
    difficulty: 'medium',
    directory: '24_shooting-star',
    ...ASSETS_MAP['24_shooting-star'],
    description: { 
      ja: 'まるでマンガのような、尾を引きながら流れる星の姿を見事に表現したあやとりです。ひもを二重にしてから取り始めるというちょっと変わった特徴があります。', 
      en: 'A string figure that beautifully represents the shooting star as it trails behind like a manga. It has a slightly unusual feature of starting by doubling the string and then taking.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: null,
      source: 'SHISHIDO Y, <i>Geometrical Figures</i>, 1980',
      author: { ja: 'SHISHIDO Yukio', en: 'SHISHIDO Yukio' },
      references: null
    }
  },
  {
    id: '25',
    name: { ja: '指ぬき', en: 'Fingers Magic' },
    difficulty: 'easy',
    directory: '25_fingers-magic',
    ...ASSETS_MAP['25_fingers-magic'],
    description: { ja: '指ぬきの説明文です。', en: 'Description for Fingers Magic.' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '26',
    name: { ja: 'ハンモック', en: 'Hammock' },
    difficulty: 'easy',
    directory: '26_hammock',
    ...ASSETS_MAP['26_hammock'],
    description: { 
      ja: 'あやとりが完成した状態が、左右の手の形も含めて赤ちゃんを寝かしつけている動きになる、愛らしいあやとりです', 
      en: 'This charming string figure depicts the motion of rocking a baby to sleep, including the posture of both hands once the figure is finished.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ハワイ', en: 'Hawaii' },
      source: 'L. A. Dickey,<i>String Figures from Hawaii</i>, 1928',
      author: null,
      references: null
    }
  },
  {
    id: '27',
    name: { ja: 'さかな', en: 'A Fish' },
    difficulty: 'medium',
    directory: '27_fish',
    ...ASSETS_MAP['27_fish'],
    description: { 
      ja: 'シンプルで力強い、大きな魚が出来上がります。', 
      en: 'A simple yet powerful figure that forms a large fish.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ハワイ', en: 'Hawaii' },
      source: 'L. A. Dickey, <i>String Figures from Hawaii</i>, 1928',
      author: null,
      references: null
    }
  },
  {
    id: '28',
    name: { ja: 'アタヌアの家', en: 'The House of Atanua' },
    difficulty: 'easy',
    directory: '28_atanua-house',
    ...ASSETS_MAP['28_atanua-house'],
    description: { 
      ja: '立体的な長屋が出来上がるあやとりです。他にはあまり見られない独特の手順で作成しますが、難しくはありません', 
      en: 'This string figure creates a three-dimensional longhouse. It is made using a unique procedure rarely seen in other figures, yet it is not difficult.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ポリネシア', en: 'Polynesia' },
      source: 'W. C. Handy,	<i>String Figures from the Marquesas and Society Islands</i>, 1925',
      author: null,
      references: null
    }
    },
  {
    id: '29',
    name: { ja: '二匹の魚', en: 'Two Fishes' },
    difficulty: 'medium',
    directory: '29_two-fishes',
    ...ASSETS_MAP['29_two-fishes'],
    description: { ja: '二匹の魚の説明文です。', en: 'Description for Two Fishes.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '30',
    name: { ja: '星', en: 'Star' },
    difficulty: 'easy',
    directory: '30_star',
    ...ASSETS_MAP['30_star'],
    description: { ja: '星の説明文です。', en: 'Description for Star.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '31',
    name: { ja: 'はたおり', en: 'Loom' },
    difficulty: 'easy',
    directory: '31_weaving',
    ...ASSETS_MAP['31_weaving'],
    description: { ja: 'はたおりの説明文です。', en: 'Description for Loom.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '32',
    name: { ja: 'カヌー', en: 'Canoe' },
    difficulty: 'easy',
    directory: '32_canoe',
    ...ASSETS_MAP['32_canoe'],
    description: { ja: 'カヌーの説明文です。', en: 'Description for Canoe.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '33',
    name: { ja: 'かに', en: 'Crub' },
    difficulty: 'hard',
    directory: '33_crub',
    ...ASSETS_MAP['33_crub'],
    description: { 
      ja: 'かにの形が見事に表現されたあやとりです。とても長い手順を辿りますが、一つ一つは難しい操作ではありません。ここでは「カヌー」の完成形からの手順を紹介していますので、「カヌー」の作り方を先に習得してから始めて下さい', 
      en: 'This string figure beautifully represents the shape of a crab. Although the process involves many steps, none of them are particularly difficult. The instructions here begin from the completed form of “Canoe,” so please learn how to make “Canoe” first before starting.' 
    },
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: 'パプアニューギニア', en: 'Papua New Guinea' },
      source: 'W. H. R. Rivers, A. C. Haddon, <i>A Method of Recording String Figures and Tricks</i>, 1902 ',
      author: null,
      references: null
    }
  },
  {
    id: '35',
    name: { ja: '1段ばしご', en: 'One Diamond' },
    difficulty: 'medium',
    directory: '35_jacobs-ladder1',
    ...ASSETS_MAP['35_jacobs-ladder1'],
    description: { 
      ja: '最も有名なあやとり「4段ばしご」の1段バージョンです。前半の手順が異なりますが、後半は「4段ばしご」と同じ操作を行います', 
      en: 'This is the single-diamond version of the famous string figure “Four Diamonds.” The first half of the sequence differs, but the latter half follows the same movements as “Four Diamonds.”' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ハワイ、日本、他', en: 'Japan, Hawaii, etc.' },
      source: 'L. A. Dickey,<i>String Figures from Hawaii</i>, 1928',
      author: null,
      references: null
    }
    },
  {
    id: '36',
    name: { ja: '2段ばしご', en: '2 Ladder' },
    difficulty: 'medium',
    directory: '36_jacobs-ladder2',
    ...ASSETS_MAP['36_jacobs-ladder2'],
    description: { 
      ja: '最も有名なあやとり「4段ばしご」の2段バージョンです。前半の手順が異なりますが、後半は「4段ばしご」と同じ操作を行います', 
      en: 'This is the two-diamond version of the famous string figure “Four Diamonds.” The first half of the sequence differs, but the latter half follows the same movements as “Four Diamonds.”' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '世界中に広く分布', en: 'Worldwide distribution' },
      source: 'C. F. Jayne,<i>String Figures</i>, 1906',
      author: null,
      references: null
    }
    },
  { 
    id: '37',
    name: { ja: '3段ばしご', en: '3 Ladder' },
    difficulty: 'medium',
    directory: '37_jacobs-ladder3',
    ...ASSETS_MAP['37_jacobs-ladder3'],
    description: { 
      ja: '最も有名なあやとり「4段ばしご」の3段バージョンです。前半の手順が異なりますが、後半は「4段ばしご」と同じ操作を行います', 
      en: 'This is the three-diamond version of the famous string figure “Four Diamonds.” The first half of the sequence differs, but the latter half follows the same movements as “Four Diamonds.”' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ハワイ、日本、他', en: 'Hawaii, Japan, etc.' },
      source: 'L. A. Dickey,<i>String Figures from Hawaii</i>, 1928',
      author: null,
      references: null
    }
    },
  {
    id: '2',
    name: { ja: '4段ばしご', en: 'Jacob\'s Ladder' },
    difficulty: 'medium',
    directory: '2_jacobs-ladder4',
    ...ASSETS_MAP['2_jacobs-ladder4'],
    description: { 
      ja: '日本では中指を主に使う「4段ばしご」、世界では主に人差し指を使い「ヤコブの梯子」など様々な名前で知られています。ここでは中指を使って取る方法を紹介します', 
      en: 'This is a famous string figure widely known all over the world. Here, we introduce the method using the middle fingers, which is common in Japan.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '世界中に広く分布', en: 'Worldwide distribution' },
      source: 'C. F. Jayne, <i>String Figures</i>, 1906',
      author: null,
      references: null
    }
    },
  { 
    id: '38',
    name: { ja: 'ダンスの舞台', en: 'Dance Stage' },
    difficulty: 'medium',
    directory: '38_dance-stage',
    ...ASSETS_MAP['38_dance-stage'],
    description: { 
      ja: 'ダンスを踊るための舞台を表しています。最後の手順で、絡まったように見える糸が一瞬で開いて美しいパターンが出来上がります', 
      en: 'This figure depicts a dance stage. At the final step, the strings—seemingly knotted together—suddenly unfold, revealing a beautiful pattern in an instant.' 
    },
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: 'パラオ', en: 'Palau' },
      source: 'P. Raymund, <i>The String Games and Cat\'s Cradles of Palau</i>, 1911',
      author: null,
      references: null
    }
    },
  {
    id: '34',
    name: { ja: 'アムワンギヨ', en: 'Amwangiyo' },
    difficulty: 'hard',
    directory: '34_amwangiyo',
    ...ASSETS_MAP['34_amwangiyo'],
    description: { 
      ja: 'アムワンギヨはナウル語で「枝」のことで、中央の幹から左右に枝が伸びている状態を表しています', 
      en: 'In Nauruan, <i>Amwangiyo</i> means “branches,” depicting the way branches spread outward from a central trunk.' 
    },
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: 'ナウル', en: 'Nauru' },
      source: 'H. C. Maude, <i>The String Figures of Nauru Island</i>, 1971',
      author: null,
      references: null
    }
    },
  {
    id: '39',
    name: { ja: '太陽', en: 'The Sun' },
    difficulty: 'medium',
    directory: '39_the-sun',
    ...ASSETS_MAP['39_the-sun'],
    description: { 
      ja: '同じ出来上がりのパターンなるあやとりが、様々な名称で世界中に伝承されています。ここではナウルに伝わる手順を紹介します', 
      en: 'String figures with the same final pattern are passed down around the world under various names. Here, we present the version traditionally taught in Nauru.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ミクロネシア、オーストラリア、他', en: 'Micronesia, Australia, etc.' },
      source: 'P. Hambruch, <i>Nauru</i>, 1914 ',
      author: null,
      references: null
    }
    },
  {
    id: '40',
    name: { ja: '山の上のお月さん', en: 'The Moon on the Mountain' },
    difficulty: 'medium',
    directory: '40_moon-over-mountain',
    ...ASSETS_MAP['40_moon-over-mountain'],
    description: { 
      ja: '山の頂上に大きな月が昇ってくる、日本の伝承あやとりです。両手を広げることで、月が小さくなりながら高く昇っていきます', 
      en: 'This is a traditional Japanese string figure depicting a large moon rising over the mountaintop. As you spread your hands apart, the moon becomes smaller and rises higher into the sky.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: 'さいとうたま, <i>あやとりいととり 2</i>, 1982 ',
      author: null,
      references: null
    }
    },
  { 
    id: '41',
    name: { ja: 'たんぽぽ', en: 'Dandelion' },
    difficulty: 'medium',
    directory: '41_dandelion',
    ...ASSETS_MAP['41_dandelion'],
    description: { ja: '日本の伝承あやとり「菊」と似ていますが、花弁が10枚あり、手順も簡単です', en: 'Description for Dandelion.' },
    premiumCourseId: 0, // 無料
    data: {
      region: null,
      source: '夏堀謹二郎, <i>日本の綾取</i>, 1986',
      author: { ja: '夏堀謹二郎', en: 'NATSUBORI Kinjiro' },
      references: null
    }
    },
  {
    id: '42',
    name: { ja: 'テントの幕', en: 'A Tent Flap' },
    difficulty: 'medium',
    directory: '42_apaches-door',
    ...ASSETS_MAP['42_apaches-door'],
    description: { 
      ja: '複雑で美しいパターンが出来上がりますが、手順は意外と短いです。北アメリカのアパッチ族の伝統的な住居「ティーピー」の入り口に掛ける幕を表しています', 
      en: 'It creates a complex and beautiful pattern, yet the sequence of steps is surprisingly short. It represents the curtain hung at the entrance of a “teepee,” the traditional dwelling of the Apache people of North America.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: 'C. F. Jayne, <i>String Figures</i>, 1906',
      author: null,
      references: null
    }
    },
  {
    id: '43',
    name: { ja: 'トランポリン', en: 'Trampoline' },
    difficulty: 'hard',
    directory: '43_trampoline',
    ...ASSETS_MAP['43_trampoline'],
    description: { 
      ja: 'ナイジェリアやシエラレオネなどで伝承されているあやとりです。10本の指を全て使った複雑なパターンが出来上がりますが、最後に親指と小指から糸を外すことで一瞬で最初の状態に戻ります。', 
      en: 'This string figure is traditionally practiced in regions including Nigeria and Sierra Leone. It forms a complex design that uses all ten fingers, yet with a simple motion—releasing the strings from your thumbs and little fingers—it snaps back to its starting form in an instant.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'アフリカ', en: 'Africa' },
      source: 'J. Parkinson, <i>Yöruba String Figures</i>, 1906',
      author: null,
      references: null
    }
    },
  {
    id: '44',
    name: { ja: '蝶', en: 'Butterfly' },
    difficulty: 'easy',
    directory: '44_butterfly',
    ...ASSETS_MAP['44_butterfly'],
    description: { 
      ja: 'ナバホ族に伝わるあやとりです。渦巻きで蝶の口吻を表している珍しいあやとりです。親指と人差し指を開閉することで蝶が羽ばたきます', 
      en: 'This string figure comes from the Navajo people. Its spiral design represents the butterfly’s proboscis, making it quite a unique figure. By opening and closing your thumbs and index fingers, the butterfly appears to flap its wings.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: 'C. F. Jayne, <i>String Figures</i>, 1906',
      author: null,
      references: null
    }
  },
  {
    id: '45',
    name: { ja: 'あみ', en: 'Hammock' },
    difficulty: 'medium',
    directory: '45_hammock',
    ...ASSETS_MAP['45_hammock'],
    description: { 
      ja: '対照的で美しい形のあやとりです。日本では「あみ」という名前で知られ、ここから「琴」「バリカン」とあやとりが続きます',
      en: 'This string figure has a strikingly symmetrical and elegant shape. In Japan, it is called “Ami,” and from it you can continue on to the figures “Koto” and “Barikan.”'
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: '野口広, <i>あやとり</i>, 1973',
      author: null,
      references: null
    }
  },
  {
    id: '46',
    name: { ja: 'うさぎ', en: 'Rabbit' },
    difficulty: 'medium',
    directory: '46_rabit',
    ...ASSETS_MAP['46_rabit'],
    description: { 
      ja: 'うさぎの顔の特徴を捉えた、愛らしい形のあやとりです。北アメリカのクラマス族に伝わるあやとりです', 
      en: 'This charming string figure captures the distinctive features of a rabbit’s face. It comes from the Klamath people of North America.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: 'C. F. Jayne, <i>String Figures</i>, 1906',
      author: null,
      references: null
    }
  },
  {
    id: '47',
    name: { ja: 'かめ', en: 'Turtle' },
    difficulty: 'medium',
    directory: '47_turtle',
    ...ASSETS_MAP['47_turtle'],
    description: { 
      ja: 'かめの形が見事に表現されたあやとりです。最後に手から糸を外すことであやとりが完成します', 
      en: 'This is a wonderfully crafted string figure that depicts a turtle. To finish, you release the strings from your hands, revealing the completed figure.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'パプアニューギニア', en: 'Papua New Guinea' },
      source: '野口広, <i>あやとり 続々</i>, 1975  ',
      author: null,
      references: null
    }
  },
  {
    id: '48',
    name: { ja: '雪かきシャベル', en: 'A Snow Shovel' },
    difficulty: 'easy',
    directory: '48_shovel',
    ...ASSETS_MAP['48_shovel'],
    description: { ja: 'カナダのイヌイットに伝わるあやとりです', en: 'This string figure comes from the Inuit of Canada.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: 'D. Jenness, <i>Eskimo String Figures</i>, 1924',
      author: null,
      references: null
    }
    },
  {
    id: '49',
    name: { ja: 'カリブー', en: 'A Caribou' },
    difficulty: 'medium',
    directory: '49_caribou',
    ...ASSETS_MAP['49_caribou'],
    description: { ja: 'カリブーの説明文です。', en: 'Description for Caribou.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '50',
    name: { ja: '2階建てのシベリアの家', en: '2-Story Siberian House' },
    difficulty: 'medium',
    directory: '50_2story-siberian-house',
    ...ASSETS_MAP['50_2story-siberian-house'],
    description: { ja: '2階建てのシベリアの家の説明文です。', en: 'Description for 2-Story Siberian House.' },
    premiumCourseId: 0, // 無料 
    data: null
    },
  {
    id: '51',
    name: { ja: 'かもめ', en: 'Seagull' },
    difficulty: 'medium',
    directory: '51_seagull',
    ...ASSETS_MAP['51_seagull'],
    description: { ja: 'かもめの説明文です。', en: 'Description for Seagull.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '52',
    name: { ja: 'くち', en: 'Mouth' },
    difficulty: 'medium',
    directory: '52_mouth',
    ...ASSETS_MAP['52_mouth'],
    description: { ja: 'くちの説明文です。', en: 'Description for Mouth.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '53',
    name: { ja: '2匹の子鹿', en: 'Two Fawns' },
    difficulty: 'hard',
    directory: '53_2fawns',
    ...ASSETS_MAP['53_2fawns'],
    description: { ja: '2匹の子鹿の説明文です。', en: 'Description for Two Fawns.' },
    premiumCourseId: 0, // 無料
    data: null
    },
  {
    id: '54',
    name: { ja: '柳の中のカリブー', en: 'A Caribou in the Willows' },
    difficulty: 'hard',
    directory: '54_caribou-in-willows',
    ...ASSETS_MAP['54_caribou-in-willows'],
    description: { 
      ja: 'カリブーが柳の下で涼んでいる様子を表しています。後半から「カリブー」と同じ手順で形を作っていきます', 
      en: 'A Caribou is resting under the willow. The same procedure as "A Caribou" is used from the second half.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'アラスカ', en: 'Alaska' },
      source: 'Diamond Jenness, <i>Eskimo String Figures</i>, 1924',
      author: null,
      references: null
    }
    },
  {
    id: '56',
    name: { ja: 'ティーピー', en: 'Teepee' },
    difficulty: 'easy',
    directory: '56_teepee',
    ...ASSETS_MAP['56_teepee'],
    description: { 
      ja: 'ティーピーはアメリカインディアンのうち、おもに平原の部族が利用する移動用住居です。「テントの幕」というあやとりがあり、このティーピーの出入口に掛ける幕を表しています', 
      en: 'A teepee is a movable home traditionally used by Native American tribes of the Great Plains. There is a string figure known as “A Tent Flap,” depicting the fabric hung at the entrance of the teepee.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: 'C. F. Jayne, <i>String Figures</i>, 1906',
      author: null,
      references: null
    }
  },
  {
    id: '57',
    name: { ja: '稲妻', en: 'Lightning' },
    difficulty: 'medium',
    directory: '57_thunder',
    ...ASSETS_MAP['57_thunder'],
    description: { 
      ja: '最後の操作が特徴的で、まさに稲妻のように一瞬にして形が出来上がります。北アメリカのナバホ族に伝わるあやとりです', 
      en: 'The final move is distinctive, forming the figure in an instant—just like a flash of lightning. This string figure comes from the Navajo people of North America.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: 'A. C. Haddon, <i>A Few American String Figures and Tricks</i>, 1903 ',
      author: null,
      references: null
    }
  },
  {
    id: '59',
    name: { ja: 'カヤックをこぐ人', en: 'The Kayaker' },
    difficulty: 'hard',
    directory: '59_paddler',
    ...ASSETS_MAP['59_paddler'],
    description: { 
      ja: '両手の人差し指を左右に動かすことで、カヤックに乗っている人が漕ぎ出します。イヌイットのあやとりで、このあと「山並み」へと続けて取ることができます', 
      en: 'By moving both index fingers from side to side, the person in the kayak appears to paddle forward. This is an Inuit string figure, and from it you can continue on to make “The Range of the Mountains.”' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: 'D. Jenness, <i>Eskimo String Figures</i>, 1924',
      author: null,
      references: null
    }
  },
  { id: '99999',
    name: { ja: 'このアプリの使い方', en: 'How to use this app' },
    difficulty: 'basic',
    directory: '0_introduction',
    thumbnail: require('../../assets/string-figures/0_introduction/thumbnail.jpg'),
    patternImage: require('../../assets/string-figures/1_star/pattern.jpg'),
    previewUrl: require('../../assets/string-figures/1_star/preview.mp4'),
    description: { ja: 'このアプリの操作方法の紹介です', en: 'Introduction to the operation of this app.' },
    premiumCourseId: 0,
    directNavigationDestination: 'Intro',
    data: null
  },
];
