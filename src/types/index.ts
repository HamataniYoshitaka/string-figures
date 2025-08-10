import { ImageSourcePropType } from 'react-native';

export interface StringFigure {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  thumbnail: ImageSourcePropType | string;
  patternImage: string;
  previewUrl: string;
  videoUrl: string;
  description: string;
  isBookmarked: boolean;
  premiumCourseId: number; // 0=無料、0以外のID=有料コース
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
