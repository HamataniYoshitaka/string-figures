import { FIGURE_1_STAR_VIDEOS } from './figure-1_star';
import { FIGURE_2_JACOBS_LADDER_VIDEOS } from './figure-2_jacobs-ladder';
import { FIGURE_3_SPIDERWEB_VIDEOS } from './figure-3_spiderweb';
import { FIGURE_4_VOLCANO_VIDEOS } from './figure-4_volcano';
import { FIGURE_5_MANY_STARS_VIDEOS } from './figure-5_many-stars';

export const CHAPTER_VIDEOS: Record<string, Record<number, any>> = {
  '1_star': FIGURE_1_STAR_VIDEOS,
  '2_jacobs-ladder': FIGURE_2_JACOBS_LADDER_VIDEOS,
  '3_spiderweb': FIGURE_3_SPIDERWEB_VIDEOS,
  '4_volcano': FIGURE_4_VOLCANO_VIDEOS,
  '5_many-stars': FIGURE_5_MANY_STARS_VIDEOS,
};
