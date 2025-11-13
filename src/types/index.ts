import { ImageSourcePropType } from 'react-native';

export interface StringFigure {
  id: string;
  name: { ja: string; en: string };
  difficulty: 'basic' | 'easy' | 'medium' | 'hard';
  directory: string;
  thumbnail: ImageSourcePropType | string;
  patternImage: ImageSourcePropType | string;
  previewUrl: string;
  description: { ja: string; en: string };
  premiumCourseId: number; // 0=無料、0以外のID=有料コース
  directNavigationDestination?: string;
}

export interface Chapter {
  subtitle: { ja: string; en: string };
}

export interface AppSettings {
  language: 'ja' | 'en';
  subtitlesEnabled: boolean;
  purchasedItems: string[];
  introductionCompleted: boolean;
}

export interface DropdownMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
}

export type RootStackParamList = {
  Intro: undefined;
  IntroVideo: { currentLanguage: 'ja' | 'en' };
  IntroVoice: { currentLanguage: 'ja' | 'en' };
  IntroComplete: undefined;
  IntroError: undefined;
  Home: undefined;
  VideoPlayer: { stringFigure: StringFigure, currentLanguage: 'ja' | 'en' };
  Additional: undefined;  
};

export type BottomSheetState = {
  isVisible: boolean;
  selectedItem: StringFigure | null;
};
