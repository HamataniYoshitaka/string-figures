import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 難易度からクリアポイントを計算
 */
export const getDifficultyPoints = (difficulty: 'basic' | 'easy' | 'medium' | 'hard' | 'two_people'): number => {
  switch (difficulty) {
    case 'basic':
      return 0;
    case 'easy':
      return 1;
    case 'medium':
      return 2;
    case 'hard':
      return 3;
    case 'two_people':
      return 3;
    default:
      return 0;
  }
};

/**
 * 現在のクリアポイントを取得
 */
export const getClearPoints = async (): Promise<number> => {
  try {
    const points = await AsyncStorage.getItem('clearPoints');
    return points ? parseInt(points, 10) : 0;
  } catch (error) {
    console.error('クリアポイントの読み込みに失敗しました:', error);
    return 0;
  }
};

/**
 * クリアポイントを保存
 */
export const saveClearPoints = async (points: number): Promise<void> => {
  try {
    await AsyncStorage.setItem('clearPoints', points.toString());
  } catch (error) {
    console.error('クリアポイントの保存に失敗しました:', error);
  }
};

/**
 * クリアポイントを加算
 */
export const addClearPoints = async (points: number): Promise<number> => {
  const currentPoints = await getClearPoints();
  const newPoints = currentPoints + points;
  await saveClearPoints(newPoints);
  return newPoints;
};

/**
 * レビュー済みフラグを取得
 */
export const getHasReviewed = async (): Promise<boolean> => {
  try {
    const hasReviewed = await AsyncStorage.getItem('hasReviewed');
    return hasReviewed === 'true';
  } catch (error) {
    console.error('レビュー済みフラグの読み込みに失敗しました:', error);
    return false;
  }
};

/**
 * レビュー済みフラグを保存
 */
export const saveHasReviewed = async (hasReviewed: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('hasReviewed', hasReviewed.toString());
  } catch (error) {
    console.error('レビュー済みフラグの保存に失敗しました:', error);
  }
};

/**
 * ポイントが15n+0〜15n+2の範囲（n >= 1）にあるかチェック
 */
export const shouldShowReviewDialog = (points: number): boolean => {
  // n >= 1 なので、ポイントが15以上である必要がある
  if (points < 15) {
    return false;
  }
  
  // ポイントを15で割った余りが0, 1, 2のいずれか
  const remainder = points % 15;
  return remainder === 0 || remainder === 1 || remainder === 2;
};

/**
 * ポイントが13n+0〜13n+2の範囲（n >= 1）にあるかチェック
 */
export const shouldShowPushPermissionDialog = (points: number): boolean => {
  // n >= 1 なので、ポイントが13以上である必要がある
  if (points < 13) {
    return false;
  }
  
  // ポイントを13で割った余りが0, 1, 2のいずれか
  const remainder = points % 13;
  return remainder === 0 || remainder === 1 || remainder === 2;
};


