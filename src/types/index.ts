import { ImageSourcePropType } from 'react-native';

export interface StringFigure {
  id: string;
  name: { ja: string; en: string };
  difficulty: 'easy' | 'medium' | 'hard';
  directory: string;
  thumbnail: ImageSourcePropType | string;
  patternImage: ImageSourcePropType | string;
  previewUrl: string;
  description: { ja: string; en: string };
  premiumCourseId: number; // 0=無料、0以外のID=有料コース
  chapters: {
    subtitle: { ja: string; en: string };
    videoUrl: string;
  }[];
}

export interface Chapter {
  subtitle: { ja: string; en: string };
}

export interface AppSettings {
  language: 'ja' | 'en';
  subtitlesEnabled: boolean;
  purchasedItems: string[];
}

export interface DropdownMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
}

export type RootStackParamList = {
  Home: undefined;
  VideoPlayer: { stringFigure: StringFigure };
};

export type BottomSheetState = {
  isVisible: boolean;
  selectedItem: StringFigure | null;
};
