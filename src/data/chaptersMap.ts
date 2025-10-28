import { Chapter } from '../types';

export const CHAPTERS_MAP: { [key: string]: Chapter[] } = {
  '1_star': require('../../assets/string-figures/1_star/chapters.json'),
  '2_jacobs-ladder': require('../../assets/string-figures/2_jacobs-ladder/chapters.json'),
  '3_spiderweb': require('../../assets/string-figures/3_spiderweb/chapters.json'),
  '4_volcano': require('../../assets/string-figures/4_volcano/chapters.json'),
  '5_many-stars': require('../../assets/string-figures/5_many-stars/chapters.json'),
  '6_tieup': require('../../assets/string-figures/6_tieup/chapters.json'),
  '7_snail': require('../../assets/string-figures/7_snail/chapters.json'),
};
