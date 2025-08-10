export interface StringFigure {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  thumbnail: string;
  image: string;
  videoUrl: string;
  description: string;
  isBookmarked: boolean;
  isPremium?: boolean;
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
