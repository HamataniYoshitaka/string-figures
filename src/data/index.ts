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
  {
    id: '13',
    name: { ja: 'かんたんほうき', en: 'Easy Broom' },
    difficulty: 'easy',
    directory: '13_easy-broom',
    ...ASSETS_MAP['13_easy-broom'],
    description: { ja: 'かんたんほうきの説明文です。', en: 'Description for Easy Broom.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '14',
    name: { ja: '足あと', en: 'Footprint' },
    difficulty: 'easy',
    directory: '14_footprint',
    ...ASSETS_MAP['14_footprint'],
    description: { ja: '足あとの説明文です。', en: 'Description for Footprint.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '15',
    name: { ja: 'バナナ', en: 'Banana' },
    difficulty: 'easy',
    directory: '15_banana',
    ...ASSETS_MAP['15_banana'],
    description: { ja: 'バナナの説明文です。', en: 'Description for Banana.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '16',
    name: { ja: 'せんす', en: 'Sensu' },
    difficulty: 'easy',
    directory: '16_sensu',
    ...ASSETS_MAP['16_sensu'],
    description: { ja: '扇子の説明文です。', en: 'Description for Sensu.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '17',
    name: { ja: 'ほうき', en: 'Broom' },
    difficulty: 'easy',
    directory: '17_broom',
    ...ASSETS_MAP['17_broom'],
    description: { ja: 'ほうきの説明文です。', en: 'Description for Broom.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '18',
    name: { ja: '富士山', en: 'Mt. Fuji' },
    difficulty: 'easy',
    directory: '18_mt-fuji',
    ...ASSETS_MAP['18_mt-fuji'],
    description: { ja: '富士山の説明文です。', en: 'Description for Mt. Fuji.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '19',
    name: { ja: '二人の首長', en: 'Two Chiefs' },
    difficulty: 'easy',
    directory: '19_two-chiefs',
    ...ASSETS_MAP['19_two-chiefs'],
    description: { ja: '二人の首長の説明文です。', en: 'Description for Two Chiefs.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '20',
    name: { ja: 'つづみ', en: 'Tuzumi' },
    difficulty: 'easy',
    directory: '20_tuzumi',
    ...ASSETS_MAP['20_tuzumi'],
    description: { ja: 'つづみの説明文です。', en: 'Description for Tuzumi.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '21',
    name: { ja: '菊水', en: 'Kikusui' },
    difficulty: 'easy',
    directory: '21_kikusui',
    ...ASSETS_MAP['21_kikusui'],
    description: { ja: '菊水の説明文です。', en: 'Description for Kikusui.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '22',
    name: { ja: 'やり投げ', en: 'Spear' },
    difficulty: 'easy',
    directory: '22_spear',
    ...ASSETS_MAP['22_spear'],
    description: { ja: 'やり投げの説明文です。', en: 'Description for Spear.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '23',
    name: { ja: '指の散歩', en: 'Finger Stroll' },
    difficulty: 'easy',
    directory: '23_finger-stroll',
    ...ASSETS_MAP['23_finger-stroll'],
    description: { ja: '指の散歩の説明文です。', en: 'Description for Finger Stroll.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '24',
    name: { ja: '流れ星', en: 'Shooting Star' },
    difficulty: 'easy',
    directory: '24_shooting-star',
    ...ASSETS_MAP['24_shooting-star'],
    description: { ja: '流れ星の説明文です。', en: 'Description for Shooting Star.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '25',
    name: { ja: '指ぬき', en: 'Fingers Magic' },
    difficulty: 'easy',
    directory: '25_fingers-magic',
    ...ASSETS_MAP['25_fingers-magic'],
    description: { ja: '指ぬきの説明文です。', en: 'Description for Fingers Magic.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '26',
    name: { ja: 'ハンモック', en: 'Hammock' },
    difficulty: 'easy',
    directory: '26_hammock',
    ...ASSETS_MAP['26_hammock'],
    description: { ja: 'ハンモックの説明文です。', en: 'Description for Hammock.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '27',
    name: { ja: 'さかな', en: 'Fish' },
    difficulty: 'easy',
    directory: '27_fish',
    ...ASSETS_MAP['27_fish'],
    description: { ja: 'さかなの説明文です。', en: 'Description for Fish.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '28',
    name: { ja: 'アタヌアの家', en: 'Atanua House' },
    difficulty: 'easy',
    directory: '28_atanua-house',
    ...ASSETS_MAP['28_atanua-house'],
    description: { ja: 'アタヌアの家の説明文です。', en: 'Description for Atanua House.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '29',
    name: { ja: '二匹の魚', en: 'Two Fishes' },
    difficulty: 'easy',
    directory: '29_two-fishes',
    ...ASSETS_MAP['29_two-fishes'],
    description: { ja: '二匹の魚の説明文です。', en: 'Description for Two Fishes.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '30',
    name: { ja: '星', en: 'Star' },
    difficulty: 'easy',
    directory: '30_star',
    ...ASSETS_MAP['30_star'],
    description: { ja: '星の説明文です。', en: 'Description for Star.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '31',
    name: { ja: 'はたおり', en: 'Weaving' },
    difficulty: 'easy',
    directory: '31_weaving',
    ...ASSETS_MAP['31_weaving'],
    description: { ja: 'はたおりの説明文です。', en: 'Description for Weaving.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '35',
    name: { ja: '1段ばしご', en: '1 Ladder' },
    difficulty: 'easy',
    directory: '35_jacobs-ladder1',
    ...ASSETS_MAP['35_jacobs-ladder1'],
    description: { ja: '1段ばしごの説明文です。', en: 'Description for 1 Ladder.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '36',
    name: { ja: '2段ばしご', en: '2 Ladder' },
    difficulty: 'easy',
    directory: '36_jacobs-ladder2',
    ...ASSETS_MAP['36_jacobs-ladder2'],
    description: { ja: '2段ばしごの説明文です。', en: 'Description for 2 Ladder.' },
    premiumCourseId: 0, // 無料
  },
  { 
    id: '37',
    name: { ja: '3段ばしご', en: '3 Ladder' },
    difficulty: 'easy',
    directory: '37_jacobs-ladder3',
    ...ASSETS_MAP['37_jacobs-ladder3'],
    description: { ja: '3段ばしごの説明文です。', en: 'Description for 3 Ladder.' },
    premiumCourseId: 0, // 無料
  },
  { 
    id: '38',
    name: { ja: 'ダンスの舞台', en: 'Dance Stage' },
    difficulty: 'easy',
    directory: '38_dance-stage',
    ...ASSETS_MAP['38_dance-stage'],
    description: { ja: 'ダンスの舞台の説明文です。', en: 'Description for Dance Stage.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '39',
    name: { ja: '太陽', en: 'The Sun' },
    difficulty: 'easy',
    directory: '39_the-sun',
    ...ASSETS_MAP['39_the-sun'],
    description: { ja: '太陽の説明文です。', en: 'Description for The Sun.' },
    premiumCourseId: 0, // 無料
  },
  {
    id: '40',
    name: { ja: '山の上の月', en: 'Moon Over Mountain' },
    difficulty: 'easy',
    directory: '40_moon-over-mountain',
    ...ASSETS_MAP['40_moon-over-mountain'],
    description: { ja: '山の上の月の説明文です。', en: 'Description for Moon Over Mountain.' },
    premiumCourseId: 0, // 無料
  },
  { 
    id: '41',
    name: { ja: 'たんぽぽ', en: 'Dandelion' },
    difficulty: 'easy',
    directory: '41_dandelion',
    ...ASSETS_MAP['41_dandelion'],
    description: { ja: 'たんぽぽの説明文です。', en: 'Description for Dandelion.' },
    premiumCourseId: 0, // 無料
  },
];
