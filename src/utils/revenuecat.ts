/**
 * コレクションIDからRevenueCatのProduct IDに変換する関数
 * @param collectionId - コレクションID（1, 2, 3など）
 * @returns RevenueCatのProduct ID
 */
export const getProductIdForCollection = (collectionId: number): string => {
  // 形式1（優先）: collection_1, collection_2, collection_3
  return `collection_${collectionId}`;
  
  // フォールバック形式が必要な場合は、以下のように変更できます：
  // return `com.hamahouse.stringfigures.collection${collectionId}`;
};

