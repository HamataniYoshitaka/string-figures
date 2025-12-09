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
      ja: '日本のあやとりの多くが、この「中指の構え」から始まります', 
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
    id: '4',
    name: { ja: '火山', en: 'Volcano' },
    difficulty: 'hard',
    directory: '4_volcano',
    ...ASSETS_MAP['4_volcano'],
    description: { ja: '中央の六角錐とその頂点を引き上げる糸を用いて、噴火する火山を立体的に表現した見事なあやとりです', en: 'This impressive string figure represents an erupting volcano in three dimensions, using a central hexagonal pyramid and the thread that lifts its peak.' },
    premiumCourseId: 2, // 有料コース2
    data: {
      region: { ja: 'パタゴニア', en: 'Patagonia' },
      source: '“Volcan”\nR. Martínez-Crovetto\n<i>Juegos de Hilo de los Aborígenes del Norte de Patagonia</i> (1970)',
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
      ja: '北アメリカのナバホ族に伝わるあやとりです。複雑な模様が、満天の星のきらめきを美しく表現します', 
      en: 'This string figure comes from the Navajo people of the United States. Its intricate pattern beautifully expresses the sparkle of a star-filled sky.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“Many Stars”\nA. C. Haddon\n<i>A Few American String Figures and Tricks</i> (1903)',
      author: null,
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
      source: '“Toemi”\nJ. C. Andersen\n <i>Māori String Figures</i> (1927)',
      author: null,
      references: null
    }
  },
  {
    id: '35',
    name: { ja: '1段ばしご', en: 'One Diamond' },
    difficulty: 'easy',
    directory: '35_jacobs-ladder1',
    ...ASSETS_MAP['35_jacobs-ladder1'],
    description: { 
      ja: '最も有名なあやとり「4段ばしご」の1段バージョンです。前半の手順が異なりますが、後半は「4段ばしご」と同じ操作を行います。ここでは主に日本で伝わる、中指を使って取る方法を紹介します', 
      en: 'This is the single-diamond version of the famous string figure “Four Diamonds.” The first half of the sequence differs, but the latter half follows the same movements as “Four Diamonds.” In this version, we introduce the Japanese method, which is distinguished by the use of the middle fingers.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ハワイ、日本、他', en: 'Japan, Hawaii, etc.' },
      source: '“One Eye”\nL. A. Dickey\n <i>String Figures from Hawaii</i> (1928)',
      author: null,
      references: null
    }
  },
  {
    id: '36',
    name: { ja: '2段ばしご', en: '2 Diamonds' },
    difficulty: 'easy',
    directory: '36_jacobs-ladder2',
    ...ASSETS_MAP['36_jacobs-ladder2'],
    description: { 
      ja: '最も有名なあやとり「4段ばしご」の2段バージョンです。前半の手順が異なりますが、後半は「4段ばしご」と同じ操作を行います。ここでは主に日本で伝わる、中指を使って取る方法を紹介します', 
      en: 'This is the two-diamond version of the famous string figure “Four Diamonds.” The first half of the sequence differs, but the latter half follows the same movements as “Four Diamonds.” In this version, we introduce the Japanese method, which is distinguished by the use of the middle fingers.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '世界中に広く分布', en: 'Worldwide distribution' },
      source: '“Osage Two Diamonds”\nC. F. Jayne\n <i>String Figures</i> (1906)',
      author: null,
      references: null
    }
  },
  { 
    id: '37',
    name: { ja: '3段ばしご', en: '3 Diamonds' },
    difficulty: 'easy',
    directory: '37_jacobs-ladder3',
    ...ASSETS_MAP['37_jacobs-ladder3'],
    description: { 
      ja: '最も有名なあやとり「4段ばしご」の3段バージョンです。前半の手順が異なりますが、後半は「4段ばしご」と同じ操作を行います。ここでは主に日本で伝わる、中指を使って取る方法を紹介します', 
      en: 'This is the three-diamond version of the famous string figure “Four Diamonds.” The first half of the sequence differs, but the latter half follows the same movements as “Four Diamonds.” In this version, we introduce the Japanese method, which is distinguished by the use of the middle fingers.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ハワイ、日本、他', en: 'Hawaii, Japan, etc.' },
      source: '“Three Eyes”\nL. A. Dickey\n <i>String Figures from Hawaii</i> (1928)',
      author: null,
      references: null
    }
  },
  {
    id: '2',
    name: { ja: '4段ばしご', en: '4 Diamonds' },
    difficulty: 'easy',
    directory: '2_jacobs-ladder4',
    ...ASSETS_MAP['2_jacobs-ladder4'],
    description: { 
      ja: '日本では中指を主に使う「4段ばしご」、世界では主に人差し指を使い「ヤコブの梯子」など様々な名前で知られています。ここでは中指を使って取る方法を紹介します', 
      en: 'This is a famous string figure widely known all over the world. Here, we introduce the method using the middle fingers, which is common in Japan.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '世界中に広く分布', en: 'Worldwide distribution' },
      source: '“Osage Diamonds”\nC. F. Jayne\n <i>String Figures</i> (1906)',
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
      source: '“菊”\n有木昭久, 湯浅清四郎\n <i>楽しいあやとり遊び</i> (1973)',
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
      source: '“でんでん虫”\n有木昭久, 湯浅清四郎\n <i>世界のあやとり傑作選</i> (1974)',
      author: { ja: '有木昭久', en: 'ARIKI Teruhisa' },
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
    premiumCourseId: 2, // コレクション2
    data: {
      region: { ja: 'アフリカ, ハワイ, 他', en: 'Africa, Hawaii, etc.' },
      source: '“a Parrot\'s Tail”\nW. C. Farabee\n <i>The Central Arawaks</i> (1918)',
      author: null,
      references: null
    }
  },
  {
    id: '12',
    name: { ja: '9つのダイヤ', en: 'Nine Diamonds' },
    difficulty: 'easy',
    directory: '12_9-diamonds',
    ...ASSETS_MAP['12_9-diamonds'],
    description: { 
      ja: '中央にダイヤの形が9個並びます。手順は短いですが、途中で薬指を使う箇所があるので指を間違えないようにしましょう', 
      en: 'Nine diamond shapes line up across the center. The sequence is short, but be careful not to use the wrong finger, as there is a step that requires the ring fingers.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本、ハワイ', en: 'Japan, Hawaii' },
      source: '“Nine Eyes”\nL. A. Dickey\n <i>String Figures from Hawaii</i> (1928)',
      author: null,
      references: null
    }
  },
  {
    id: '13',
    name: { ja: 'ぱんぱんほうき', en: 'A Tent' },
    difficulty: 'easy',
    directory: '13_easy-broom',
    ...ASSETS_MAP['13_easy-broom'],
    description: { 
      ja: '一瞬でほうきの形が出来上がります。世界各地に広く分布する有名なあやとりです。日本では最後に両手を広げる際、手を1回叩きます', 
      en: 'The tent shape appears in an instant. This famous string figure is widely found around the world. In Japan, people clap their hands once as they spread them apart at the final step.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '世界中に広く分布', en: 'Worldwide distribution' },
      source: '“Pitching a Tent”\nJ. Teit\n <i>The Thompson Indians of British Columbia</i> (1900)',
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
      source: '“Ulou”\nS. Rydén\n <i>South American String Figures</i> (1934)',
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
    description: { 
      ja: '4本のバナナが出来上がる、簡単な手順のあやとりです。最後に手から糸を外して完成します', 
      en: 'This easy string figure creates four bananas. To finish, you release the strings from your hands to reveal the completed shape.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: null,
      author: null,
      references: null
    }
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
    id: '16',
    name: { ja: '松葉', en: 'Sensu' },
    difficulty: 'easy',
    directory: '16_sensu',
    ...ASSETS_MAP['16_sensu'],
    description: { 
      ja: '「扇子」とは日本の伝統的な折り畳むことができる団扇のことです。他にも「松葉」という名前で知られているあやとりです', 
      en: '<i>Sensu</i> is a traditional Japanese folding fan. This string figure is also known by another name, “Pine Needles.”' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: '“松葉”\n有木昭久, 湯浅清四郎\n <i>楽しいあやとり遊び</i> (1973)',
      author: null,
      references: null
    }
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
      source: '“Salztrichter”\nG. Tessmann\n <i>Die Kinderspiele der Pangwe</i> (1912)',
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
    description: { ja: '今回紹介するあやとり以外にも、日本には富士山を表すあやとりがたくさんあります', en: 'In addition to the figure presented this time, Japan has many other string figures that depict Mount Fuji.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: '“富士山”\n夏堀謹二郎\n <i>日本の綾取</i> (1986)',
      author: null,
      references: null
    }
    },
  {
    id: '19',
    name: { ja: '二人の酋󠄁長', en: 'Two Chiefs' },
    difficulty: 'medium',
    directory: '19_two-chiefs',
    ...ASSETS_MAP['19_two-chiefs'],
    description: { 
      ja: '二人の酋󠄁長が並んでいる様子です。このあやとりが採取されたカロリン諸島には「ひとりの酋󠄁長」というあやとりもあります', 
      en: 'This figure depicts two chiefs standing side by side. In the Caroline Islands, where this string figure was collected, there is also a version called “One Chief.”' 
    },
    premiumCourseId: 2, // コレクション2
    data: {
      region: { ja: 'ミクロネシア', en: 'Micronesia' },
      source: '“Two Chiefs”\nC. F. Jayne\n <i>String Figures</i> (1906)',
      author: null,
      references: null
    }
    },
  {
    id: '20',
    name: { ja: 'つづみ', en: 'Drum' },
    difficulty: 'easy',
    directory: '20_tuzumi',
    ...ASSETS_MAP['20_tuzumi'],
    description: { 
      ja: '日本とナバホ族に伝わるあやとりです。日本では「つづみ」という名前で呼ばれますが、どちらも太鼓を表しています', 
      en: 'This string figure is found in both Japan and Navajo tradition. In Japan it is called “Tsuzumi,” and in both cultures the figure represents a drum.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本、北アメリカ', en: 'Japan, North America' },
      source: '“Drum”\nW. Wirt, M. Sherman, M. Mitchell\n <i>String Games of the Navajo : 1999</i> (2000)',
      author: null,
      references: null
    }
    },
  {
    id: '21',
    name: { ja: '菊水', en: 'Kikusui' },
    difficulty: 'medium',
    directory: '21_kikusui',
    ...ASSETS_MAP['21_kikusui'],
    description: { 
      ja: '日本の家にはそれぞれ家紋があり、「菊水」もその一つです', 
      en: 'In Japan, families traditionally have their own crests, and <i>Kikusui</i> is one such family emblem.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: '“KIKUSUI”\nSAITO T. \n <i>Ayatori: The Traditional String Figures of Japan : 1970-99</i> (2004)',
      author: null,
      references: null
    }
    },
  {
    id: '22',
    name: { ja: '投げやり', en: 'Spear' },
    difficulty: 'easy',
    directory: '22_spear',
    ...ASSETS_MAP['22_spear'],
    description: { 
      ja: 'マレー島に伝わるあやとりです。やりを左右に繰り返し飛ばして遊ぶことができます', 
      en: 'This string figure comes from Malaya. You can play with it by repeatedly launching the spear from side to side.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'メラネシア', en: 'Melanesia' },
      source: '“Casting the Fish-Spear”\nC. F. Jayne\n <i>String Figures</i> (1906)',
      author: null,
      references: null
    }
  },
  {
    id: '23',
    name: { ja: 'ひもの散歩', en: 'String Stroll' },
    difficulty: 'easy',
    directory: '23_finger-stroll',
    ...ASSETS_MAP['23_finger-stroll'],
    description: { ja: '親指から小指まで順番に糸が移動していき、また戻ってくるあやとりです', en: 'This string figure moves the thread sequentially from the thumb to the little finger and then back again.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: null,
      author: null,
      references: null
    }
    },
  {
    id: '24',
    name: { ja: '流れ星', en: 'Shooting Star' },
    difficulty: 'medium',
    directory: '24_shooting-star',
    ...ASSETS_MAP['24_shooting-star'],
    description: { 
      ja: 'まるでマンガのような、尾を引きながら流れる星の姿を見事に表現したあやとりです。ひもを二重にしてから取り始めるというちょっと変わった特徴があります', 
      en: 'A string figure that beautifully represents the shooting star as it trails behind like a MANGA. It has a slightly unusual feature of starting by doubling the string and then taking.' 
    },
    premiumCourseId: 2, // コレクション2
    data: {
      region: null,
      source: '“A Shooting Star”\nSHISHIDO Yukio\n<i>Geometrical Figures</i> (1980)',
      author: { ja: 'SHISHIDO Yukio', en: 'SHISHIDO Yukio' },
      references: null
    }
  },
  {
    id: '25',
    name: { ja: 'ひもぬき', en: 'String Magic' },
    difficulty: 'easy',
    directory: '25_fingers-magic',
    ...ASSETS_MAP['25_fingers-magic'],
    description: { ja: '人差し指と親指にかかった糸が、一瞬にして抜けてしまう簡単なマジックです', en: 'This is a simple trick in which the string looped around the index finger and thumb slips off in an instant.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: null,
      author: null,
      references: null
    }
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
      source: '“One Eye, Ahamaka, or Palai Huna Nui (hammock, extreme shyness)”\nL. A. Dickey\n <i>String Figures from Hawaii</i> (1928)',
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
      ja: 'ハワイに伝わるあやとりです。ハワイ語で「weoweo」と呼ばれているキントキダイ科の赤い魚を表しています', 
      en: 'This string figure originates from Hawaii and depicts a bright red snapper known in Hawaiian as <i>weoweo</i>.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ハワイ', en: 'Hawaii' },
      source: '“Weoweo”\nL. A. Dickey\n <i>String Figures from Hawaii</i> (1928)',
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
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: 'ポリネシア', en: 'Polynesia' },
      source: '“Fa\'e Papa (The House of Atanua)”\nW. C. Handy\n <i>String Figures from the Marquesas and Society Islands</i> (1925)',
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
    description: { 
      ja: '最後に両手を広げると、2匹の魚が逃げて行きます。ここでは「2匹の魚」として紹介していますが、カロリン諸島に伝わるこのあやとりには名前が無く、明確なモチーフも不明です', 
      en: 'When you spread your hands at the end, two fish appear to swim away. Here we introduce it as <i>Two Fishes</i> but this string figure from the Caroline Islands has no traditional name, and its intended motif is unknown..' 
    },
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: 'ミクロネシア', en: 'Micronesia' },
      source: '“No Name”\nC. F. Jayne\n <i>String Figures</i> (1906)',
      author: null,
      references: null
    }
    },
  {
    id: '30',
    name: { ja: '星', en: 'A Star' },
    difficulty: 'easy',
    directory: '30_star',
    ...ASSETS_MAP['30_star'],
    description: { 
      ja: '星をモチーフにしたあやとりは世界中に数多くありますが、この日本に伝わるあやとりは、手順も短く比較的簡単に作ることができます', 
      en: 'Although there are many star-themed string figures around the world, this Japanese one has a short sequence and is relatively easy to make.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: '“ほし”\nさいとうたま\n <i>あやとりいととり 1</i> (1982)',
      author: null,
      references: null
    }
  },
  {
    id: '31',
    name: { ja: 'はたおり', en: 'Sewing Machine' },
    difficulty: 'easy',
    directory: '31_weaving',
    ...ASSETS_MAP['31_weaving'],
    description: { 
      ja: '日本の各地で、さまざまな名前で伝えられているあやとりです。手のひらの向きを変えることで、はたおり機が動きます', 
      en: 'This string figure is passed down across Japan under various names. By changing the orientation of your palms, the loom appears to move.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '日本', en: 'Japan' },
      source: '“はたおり”\n有木昭久, 湯浅清四郎\n <i>楽しいあやとり遊び</i> (1973)',
      author: null,
      references: null
    }
  },
  {
    id: '32',
    name: { ja: '小舟', en: 'A Boat' },
    difficulty: 'easy',
    directory: '32_canoe',
    ...ASSETS_MAP['32_canoe'],
    description: { 
      ja: '立体的なボートが出来上がるあやとりです。この後「かに」へと続けて取ることができます', 
      en: 'This string figure creates a three-dimensional boat. After completing it, you can go straight into the next figure, <i>Crub.</i>' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'パプアニューギニア', en: 'Papua New Guinea' },
      source: '“Tim (a well)”\nW. H. R. Rivers, A. C. Haddon\n<i>A Method of Recording String Figures and Tricks</i>(1902)',
      author: null,
      references: null
    }
  },
  {
    id: '33',
    name: { ja: 'かに', en: 'Crub' },
    difficulty: 'hard',
    directory: '33_crub',
    ...ASSETS_MAP['33_crub'],
    description: { 
      ja: 'かにの形が見事に表現されたあやとりです。とても長い手順を辿りますが、一つ一つは難しい操作ではありません。ここでは「小舟」の完成形からの手順を紹介していますので、「小舟」の作り方を先に習得してから始めて下さい', 
      en: 'This string figure beautifully represents the shape of a crab. Although the process involves many steps, none of them are particularly difficult. The instructions here begin from the completed form of <i>A Boat,</i> so please learn how to make <i>A Boat</i> first before starting.' 
    },
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: 'パプアニューギニア', en: 'Papua New Guinea' },
      source: '“Kokowa (crab)”\nW. H. R. Rivers, A. C. Haddon\n<i>A Method of Recording String Figures and Tricks</i>(1902)',
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
      source: '“Choilolél of Arsei”\nP. Raymund\n<i>The String Games and Cat\'s Cradles of Palau</i> (1911)',
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
      source: '“Amwangiyo”\nH. C. Maude\n<i>The String Figures of Nauru Island</i> (1971)',
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
      region: { ja: 'ナウル、ミクロネシア、オーストラリア、他', en: 'Nauru, Micronesia, Australia, etc.' },
      source: 'Die Sonne (e kuan)\nP. Hambruch\n<i>Nauru</i> (1914)',
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
      source: '“山の上のお月さん”\nさいとうたま\n<i>あやとりいととり 2</i> (1982)',
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
      source: '“たんぽぽ”\n夏堀謹二郎\n<i>日本の綾取</i> (1986)',
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
      source: '“An Apache Door”\nC. F. Jayne\n<i>String Figures</i> (1906)',
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
      ja: 'ナイジェリアやシエラレオネなどで伝承されているあやとりです。10本の指を全て使った複雑なパターンが出来上がりますが、最後に親指と小指から糸を外すことで一瞬で最初の状態に戻ります', 
      en: 'This string figure is traditionally practiced in regions including Nigeria and Sierra Leone. It forms a complex design that uses all ten fingers, yet with a simple motion—releasing the strings from your thumbs and little fingers—it snaps back to its starting form in an instant.' 
    },
    premiumCourseId: 2, // コレクション2
    data: {
      region: { ja: 'アフリカ', en: 'Africa' },
      source: '“Ile Ubde (a parrot cage)”\nJ. Parkinson\n<i>Yöruba String Figures</i> (1906)',
      author: null,
      references: null
    }
    },
  {
    id: '44',
    name: { ja: '蝶', en: 'A Butterfly' },
    difficulty: 'easy',
    directory: '44_butterfly',
    ...ASSETS_MAP['44_butterfly'],
    description: { 
      ja: 'ナバホ族に伝わるあやとりです。渦巻きで蝶の口吻を表している珍しいあやとりです。親指と人差し指を開閉することで蝶が羽ばたきます', 
      en: 'This string figure comes from the Navajo people. Its spiral design represents the butterfly’s proboscis, making it quite a unique figure. By opening and closing your thumbs and index fingers, the butterfly appears to flap its wings.' },
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“A Butterfly”\nC. F. Jayne\n<i>String Figures</i> (1906)',
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
      source: '“あみ・お琴・ハンモック・バリカン”\n野口広\n<i>あやとり</i> (1973)',
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
    premiumCourseId: 2, // コレクション2
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“A Rabbit”\nC. F. Jayne\n<i>String Figures</i> (1906)',
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
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: 'パプアニューギニア', en: 'Papua New Guinea' },
      source: '“かめ”\n野口広\n<i>あやとり 続々</i> (1975)',
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
      source: '“A Snow Shovel”\nD. Jenness\n<i>Eskimo String Figures</i> (1924)',
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
    description: { 
      ja: '北アメリカのトナカイである「カリブー」を表現したあやとりです。手順のほとんどを右手だけで行います', 
      en: 'This string figure represents the “caribou,” a reindeer native to North America. Most of the steps are performed using only the right hand.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“Tuktuqdjung (Cariboo)”\nF. Boas\n<i>The Game of Cat\'s Cradle</i>(1888)',
      author: null,
      references: null
    }
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
    description: { 
      ja: 'イヌイットのあやとりで、大きく翼を広げたかもめを表しています。完成系はシンプルですが、手順は意外と複雑です', 
      en: 'This string figure from Inuit tradition depicts a seagull stretching its wings wide. The final shape is simple, but the procedure to make it is unexpectedly complex.' 
    },
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: 'Sea Gull (t\'keyack)\nG. B. Gordon\n<i>Notes on the Western Eskimo</i> (1906)',
      author: null,
      references: null
    }
  },
  {
    id: '52',
    name: { ja: '口', en: 'A Mouth' },
    difficulty: 'medium',
    directory: '52_mouth',
    ...ASSETS_MAP['52_mouth'],
    description: { 
      ja: '完成系は非常にシンプルですが、手順は意外と複雑です。両手を動かすことで、くちが開閉します', 
      en: 'The final shape is very simple, but the sequence of steps is unexpectedly complex. By moving both hands, the mouth opens and closes.' 
    },
    premiumCourseId: 2, // コレクション2
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“A Mouth”\nC. F. Jayne\n<i>String Figures</i> (1906)',
      author: null,
      references: null
    }
  },
  // {
  //   id: '53',
  //   name: { ja: '2匹の子鹿', en: 'Two Fawns' },
  //   difficulty: 'hard',
  //   directory: '53_2fawns',
  //   ...ASSETS_MAP['53_2fawns'],
  //   description: { ja: '2匹の子鹿の説明文です。', en: 'Description for Two Fawns.' },
  //   premiumCourseId: 0, // 無料
  //   data: null
  // },
  {
    id: '54',
    name: { ja: '柳の中のカリブー', en: 'A Caribou in the Willows' },
    difficulty: 'hard',
    directory: '54_caribou-in-willows',
    ...ASSETS_MAP['54_caribou-in-willows'],
    description: { 
      ja: 'カリブーが柳の下で涼んでいる様子を表しています。後半から「カリブー」と同じ手順で形を作っていきます', 
      en: 'A Caribou is resting under the willow. The same procedure as <i>A Caribou</i> is used from the second half.' 
    },
    premiumCourseId: 2, // コレクション2
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“The Caribou in the Willows”\nDiamond Jenness\n<i>Eskimo String Figures</i> (1924)',
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
      source: '“An Apache Teepee”\nC. F. Jayne\n<i>String Figures</i> (1906)',
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
    premiumCourseId: 1, // コレクション1
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“Lightning”\nA. C. Haddon\n<i>A Few American String Figures and Tricks</i> (1903)',
      author: null,
      references: null
    }
  },
  {
    id: '58',
    name: { ja: '天と地', en: 'Earth and the Sky' },
    difficulty: 'medium',
    directory: '58_earth-and-sky',
    ...ASSETS_MAP['58_earth-and-sky'],
    description: { 
      ja: '上下2層に分かれた平面が天と地を表している、美しいあやとりです。南アメリカのマプチェ族に伝わるあやとりです', 
      en: 'This beautiful string figure represents heaven and earth with two horizontal layers—an upper and a lower plane. It comes from the Mapuche people of South America.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '南アメリカ', en: 'South America' },
      source: '“casa abandonada”\nJ. Braunstein, I. Balducci, M. Reca, O. Sturzenegger\n<i>Juegos y Lenguajes de Hilo en el Gran Chaco</i>(2017)',
      author: null,
      references: null
    }
  },
  {
    id: '59',
    name: { ja: 'カヤックをこぐ人', en: 'The Kayaker' },
    difficulty: 'hard',
    directory: '59_kayaker',
    ...ASSETS_MAP['59_kayaker'],
    description: { 
      ja: '両手の人差し指を左右に動かすことで、カヤックに乗っている人が漕ぎ出します。イヌイットのあやとりで、このあと「山並み」へと続けて取ることができます', 
      en: 'By moving both index fingers from side to side, the person in the kayak appears to paddle forward. This is an Inuit string figure, and from it you can continue on to make <i>The Mountains.</i>' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“The Clothes Line (iniarl)”\nG. B. Gordon\n<i>Notes on the Western Eskimo</i> (1906)',
      author: null,
      references: null
    }
  },
  {
    id: '64',
    name: { ja: '上腕二頭筋を動かす男', en: 'A Man Flexing His Biceps' },
    difficulty: 'hard',
    directory: '64_a-man-flexing-his-biceps',
    ...ASSETS_MAP['64_a-man-flexing-his-biceps'],
    description: { 
      ja: '力自慢のイヌイットを表したユーモラスなあやとりです。人差し指に合わせて男の腕が動きます', 
      en: 'This humorous string figure represents a strong Inuit man. His arms move in sync with your index fingers.' 
    },
    premiumCourseId: 2, // コレクション2
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“Aksatquligaciaq (Celui qui a le haut du bras)”\nG. Mary-Rousselière\n <i>Les Jeux de Ficelle des Arviligjuarmiut</i> (1969)',
      author: null,
      references: null
    }
  },
  {
    id: '65',
    name: { ja: '耳の大きな犬', en: 'A Dog with Large Ears' },
    difficulty: 'hard',
    directory: '65_dog-walking',
    ...ASSETS_MAP['65_dog-walking'],
    description: { 
      ja: 'カナダに住むコパーイヌイットに伝わるあやとりです。右手を引くと、耳の大きな犬が歩き出します。ひもを戻して何回でも散歩させることができます', 
      en: 'This string figure comes from the Copper Inuit of Canada. When you pull your right hand, the large-eared dog begins to walk. You can return the string and take it for a walk again and again.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“A Dog with Large Ears”\nD. Jenness\n <i>Eskimo String Figures</i> (1924)',
      author: null,
      references: null
    }
  },
  {
    id: '66',
    name: { ja: 'ネズミ', en: 'A Mouse' },
    difficulty: 'medium',
    directory: '66_mouse',
    ...ASSETS_MAP['66_mouse'],
    description: { ja: 'ネズミの説明文です。', en: 'Description for A Mouse.' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '67',
    name: { ja: 'モア島', en: 'The Island of Moa' },
    difficulty: 'medium',
    directory: '67_island-moa',
    ...ASSETS_MAP['67_island-moa'],
    description: { 
      ja: 'モア島はトレス海峡に浮かぶ、小高い山がある島です。頂上にいつも雲がかかっている山の姿を表したあやとりです。', 
      en: '<i>The Island of Moa</i> is an island with a modest mountain located in the Torres Strait. This string figure represents the mountain, which is always covered with clouds at its summit.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'メラネシア', en: 'Melanesia' },
      source: '“The Island of Moa”\nK. Haddon\n<i>String Games for Beginners</i> (1934)',
      author: null,
      references: null
    }
  },
  {
    id: '68',
    name: { ja: 'ライアの花', en: 'The Laia Flower' },
    difficulty: 'medium',
    directory: '68_laia-flower',
    ...ASSETS_MAP['68_laia-flower'],
    description: { 
      ja: '立体的な六角錐が出来上がる、非常に美しいあやとりです。全ての手順を手前と奥を逆にして取ることで、逆さまの「ライアの実」が出来上がります', 
      en: 'This elegant string figure produces a three-dimensional hexagonal pyramid. If you perform every step in reverse (front and back switched), you will obtain an upside-down variation known as “The Liar Fruit.”' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'メラネシア', en: 'Melanesia' },
      source: '“The Laia Fruit, the Laia Flower”\nW. W. R. Ball\n<i>String Figures 3rd ed.</i> (1929)',
      author: null,
      references: null
    }
  },
  {
    id: '69',
    name: { ja: '山間の月', en: 'The Moon Between the Mountains' },
    difficulty: 'medium',
    directory: '69_moon-between-mountains',
    ...ASSETS_MAP['69_moon-between-mountains'],
    description: { 
      ja: '山間の月の説明文です。', 
      en: 'Description for The Moon Between the Mountains.' 
    },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '70',
    name: { ja: '山並み', en: 'The Mountains' },
    difficulty: 'hard',
    directory: '70_mountains',
    ...ASSETS_MAP['70_mountains'],
    description: { 
      ja: '「カヤックを漕ぐ人」から続けてとるあやとりで、漕いで行った人が遥か向こうに見た山並みを表しています。ここでは「カヤックを漕ぐ人」の完成形からの手順を紹介していますので、「カヤックを漕ぐ人」の作り方を先に習得してから始めて下さい', 
      en: 'This string figure continues from <i>The Kayaker</i> and represents the mountain range seen far in the distance by the paddler. The instructions here begin from the finished form of <i>The Kayaker,</i> so please learn how to make <i>The Kayaker</i> first before starting.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“The Range of the Mountains”\nD. Jenness\n<i>Eskimo String Figures</i> (1924)',
      author: null,
      references: null
    }
  },
  {
    id: '71',
    name: { ja: 'シベリアの家', en: 'The Siberian House' },
    difficulty: 'easy',
    directory: '71_siberian-house',
    ...ASSETS_MAP['71_siberian-house'],
    description: { ja: 'シベリアの家の説明文です。', en: 'Description for The Siberian House.' },
    premiumCourseId: 0, // 無料
    data: null
  },
  {
    id: '72',
    name: { ja: '糸つむぎ', en: 'Spindle' },
    difficulty: 'easy',
    directory: '72_spindle',
    ...ASSETS_MAP['72_spindle'],
    description: { 
      ja: 'ひもを2重にして、指に巻きつけて作成するあやとりです。手を開閉することで糸を紡いでいるように見えます', 
      en: 'This figure is created by folding the string in half and wrapping it around your fingers. When you open and close your hands, the motion resembles spinning yarn.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“Spindle”\nF. D. McCarthy 1960\n <i>The String Figures of Yirrkalla</i> (1960)',
      author: null,
      references: null
    }
  },
  {
    id: '73',
    name: { ja: 'ベッドの男', en: 'The Sleeper' },
    difficulty: 'easy',
    directory: '73_sleeper',
    ...ASSETS_MAP['73_sleeper'],
    description: { 
      ja: 'ベッドの中央で男が眠っている様子を表現したあやとりです。小指の糸を外すことで、ベッドが壊れて男が転げ落ちます', 
      en: 'This string figure shows a man sleeping at the center of a bed. When you release the strings from your little fingers, the bed collapses and the man falls off.' },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'メラネシア', en: 'Melanesia' },
      source: '“A Man and a Bed”\nC. F. Jayne\n <i>String Figures</i> (1906)',
      author: null,
      references: null
    }
  },
  {
    id: '74',
    name: { ja: 'カヌー', en: 'A Canoe' },
    difficulty: 'easy',
    directory: '74_canoe',
    ...ASSETS_MAP['74_canoe'],
    description: { 
      ja: 'アボリジニのあやとりです。立体的なカヌーが出来上がります。この後「たつまき」へと続けて取ることができます', 
      en: 'This string figure from Aboriginal tradition creates a three-dimensional canoe. After completing it, you can go straight into the next figure, <i>A Waterspout.</i>' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'オーストラリア', en: 'Australia' },
      source: '“A Canoe (Auto)”\nK. Haddon\n <i>Some Australian String Figures</i> (1912)',
      author: null,
      references: null
    }
  },
  {
    id: '75',
    name: { ja: 'たつまき', en: 'A Waterspout' },
    difficulty: 'medium',
    directory: '75_tornado',
    ...ASSETS_MAP['75_tornado'],
    description: { 
      ja: 'たつまきの形が立体的に表現された見事なあやとりです。ここでは「カヌー」の完成形からの手順を紹介していますので、「カヌー」の作り方を先に習得してから始めて下さい', 
      en: 'This is a remarkable string figure that expresses the shape of a tornado in three dimensions. The instructions here begin from the completed form of <i>A Canoe,</i> so please learn how to make <i>A Canoe</i> first before starting.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'オーストラリア', en: 'Australia' },
      source: '“The Waterspout (Mare)”\nK. Haddon\n <i>Some Australian String Figures</i> (1912)',
      author: null,
      references: null
    }
  },
  {
    id: '77',
    name: { ja: 'コウモリの群れ', en: 'Bats' },
    difficulty: 'medium',
    directory: '77_bats',
    ...ASSETS_MAP['77_bats'],
    description: { 
      ja: 'こうもりが群れになってぶら下がっている様子を表しているあやとりです。最後にこうもりは次々と飛び立って行きます', 
      en: 'This string figure represents a group of bats hanging together. In the final steps, the bats fly away one after another.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '南アメリカ', en: 'South America' },
      source: '“t\'afoloc (muchos pecaríes)”\nJ. Braunstein\n <i>Figuras y Juegos de Hilos de los Indios Maká </i> (1992)',
      author: null,
      references: null
    }
  },
  {
    id: '80',
    name: { ja: 'テリハボクの花', en: 'Blossom of the Calophyllum' },
    difficulty: 'hard',
    directory: '80_calophyllum',
    ...ASSETS_MAP['80_calophyllum'],
    description: { 
      ja: '太平洋諸島などに自生する常緑高木「テリハボク」の花を表したあやとりです。テリハボクはナウルの"国の木"に指定されています', 
      en: 'This figure depicts the flower of <i>Calophyllum</i>, an evergreen tree found in places such as the Pacific Islands. In Nauru, this tree is recognized as the national tree.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: 'ナウル', en: 'Nauru' },
      source: '“Die Blüte des Calophyllum (e bŭr ĭn íjọ)”\nP. Hambruch\n<i>Nauru</i> (1914)',
      author: null,
      references: null
    }
  },
  {
    id: '81',
    name: { ja: 'コウモリ', en: 'Bat' },
    difficulty: 'medium',
    directory: '81_bat',
    ...ASSETS_MAP['81_bat'],
    description: { 
      ja: '北アメリカのナバホ族に伝わるあやとりです。後半は「たくさんの星」と同じ手順で作成します', 
      en: 'This string figure comes from the Navajo people of North America. The second half is made using the same steps as <i>Many Stars.</i>' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“Bat”\nW. Wirt, M. Sherman, M. Mitchell (BISFA 7)\n <i>String Games of the Navajo : 1999</i> (2000)',
      author: null,
      references: null
    }
  },
  {
    id: '82',
    name: { ja: '嵐の雲', en: 'Storm Clouds' },
    difficulty: 'hard',
    directory: '82_storm-clouds',
    ...ASSETS_MAP['82_storm-clouds'],
    description: { 
      ja: 'ナバホ族のあやとりです。同じ操作を繰り返すことで、雲はいくつでも作ることができます', 
      en: 'This is a Navajo string figure. By repeating the same motion, you can create as many clouds as you like.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北アメリカ', en: 'North America' },
      source: '“Storm Clouds”\nC. F. Jayne\n <i>String Figures</i> (1906)',
      author: null,
      references: null
    }
  },
  {
    id: '83',
    name: { ja: 'ダンスハウスで踊る人々', en: 'Eskimos in a Dancehouse' },
    difficulty: 'hard',
    directory: '83_dancers',
    ...ASSETS_MAP['83_dancers'],
    description: { 
      ja: '男女のダンサーが列を作って踊っているあやとりです。列の最後の輪はドラムを表しています。ダンサー達は次々と退場していき、最後はダンスハウスは無人になります', 
      en: 'This string figure shows male and female dancers lined up in a row. The last loop represents a drum. The dancers leave the line one by one, and in the end the dance house is left empty.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“The Children (a series of dancers, the last one carrying the drum)”\nD. Jenness\n <i>Eskimo String Figures</i> (1924)',
      author: null,
      references: null
    }
  },
  {
    id: '84',
    name: { ja: '白鳥', en: 'A Swan' },
    difficulty: 'hard',
    directory: '84_swan',
    ...ASSETS_MAP['84_swan'],
    description: { 
      ja: '長い手順と複雑な操作が必要なあやとりですが、最後の手順で白鳥が首を伸ばす動きはとても優雅です。地域によっては白鳥が飛び立つ所まであやとりが続き、後には波紋だけが残ります', 
      en: 'This string figure involves many steps and intricate moves, but the final moment—when the swan gracefully extends its neck—is truly beautiful. In certain regions, the sequence goes on to show the swan taking flight, with only the ripples left in its wake.' 
    },
    premiumCourseId: 0, // 無料
    data: {
      region: { ja: '北極圏', en: 'Arctic Circle' },
      source: '“The Swan”\nD. Jenness\n <i>Eskimo String Figures</i> (1924)',
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
