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
    description: { ja: 'まずはあやとりに使う紐の結び方を学びましょう', en: 'First, learn how to tie the strings used for string figures.' },
    premiumCourseId: 0, // 無料

  },
  {
    id: '1',
    name: { ja: '星', en: 'Star' },
    difficulty: 'easy',
    directory: '1_star',
    ...ASSETS_MAP['1_star'],
    description: { ja: '手のひらにかわいい星ができます。短め、太めの紐を使うと良いでしょう', en: 'A cute star can be made on the palm. It is good to use short and thick string.' },
    premiumCourseId: 0, // 無料

  },
  {
    id: '2',
    name: { ja: '四段ばしご', en: 'Jacob\'s Ladder' },
    difficulty: 'easy',
    directory: '2_jacobs-ladder',
    ...ASSETS_MAP['2_jacobs-ladder'],
    description: { ja: '日本では中指を主に使う「四段ばしご」、世界では人差し指を使う「ヤコブの梯子」という名前で知られています。ここでは人差し指を使ってとる方法を紹介します。', en: 'Description for Jacob\'s Ladder.' },
    premiumCourseId: 0, // 無料

  },
  {
    id: '3',
    name: { ja: '蜘蛛の巣', en: 'Spiderweb' },
    difficulty: 'easy',
    directory: '3_spiderweb',
    ...ASSETS_MAP['3_spiderweb'],
    description: { ja: '蜘蛛の巣の説明文です。', en: 'Description for Spiderweb.' },
    premiumCourseId: 1, // 有料コース1

  },
  {
    id: '4',
    name: { ja: '火山', en: 'Volcano' },
    difficulty: 'medium',
    directory: '4_volcano',
    ...ASSETS_MAP['4_volcano'],
    description: { ja: '火山の説明文です。', en: 'Description for Volcano.' },
    premiumCourseId: 2, // 有料コース2

  },
  {
    id: '5',
    name: { ja: 'たくさんの星', en: 'Many Stars' },
    difficulty: 'easy',
    directory: '5_many-stars',
    ...ASSETS_MAP['5_many-stars'],
    description: { ja: 'たくさんの星の説明文です。', en: 'Description for Many Stars.' },
    premiumCourseId: 0, // 無料

  },
  {
    id: '7',
    name: { ja: 'カタツムリ', en: 'Snail' },
    difficulty: 'easy',
    directory: '7_snail',
    ...ASSETS_MAP['7_snail'],
    description: { ja: '小さなかわいいカタツムリが出来上がります', en: 'A small and cute snail is completed.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '8',
    name: { ja: 'ゴム', en: 'Elastic Band' },
    difficulty: 'easy',
    directory: '8_elastic-band',
    ...ASSETS_MAP['8_elastic-band'],
    description: { ja: 'ゴムの説明文です。', en: 'Description for Elastic Band.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '9',
    name: { ja: '菊', en: 'Chrysanthemum' },
    difficulty: 'easy',
    directory: '9_chrysanthemum',
    ...ASSETS_MAP['9_chrysanthemum'],
    description: { ja: '菊の説明文です。', en: 'Description for Chrysanthemum.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '10',
    name: { ja: '指ぬき', en: 'Magic Fingers' },
    difficulty: 'easy',
    directory: '10_magic-fingers',
    ...ASSETS_MAP['10_magic-fingers'],
    description: { ja: '指ぬきの説明文です。', en: 'Description for Magic Fingers.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '11',
    name: { ja: 'ウインク', en: 'Wink' },
    difficulty: 'easy',
    directory: '11_wink',
    ...ASSETS_MAP['11_wink'],
    description: { ja: 'ウインクの説明文です。', en: 'Description for Wink.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '12',
    name: { ja: '9つダイヤ', en: 'Nine Diamonds' },
    difficulty: 'easy',
    directory: '12_9-diamonds',
    ...ASSETS_MAP['12_9-diamonds'],
    description: { ja: '9つダイヤの説明文です。', en: 'Description for Nine Diamonds.' },
    premiumCourseId: 0, // 無料
  },
];
