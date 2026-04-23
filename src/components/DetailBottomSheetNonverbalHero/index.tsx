import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { StringFigure } from '../../types';
import PurchaseButton from '../PurchaseButton';
import { LockIcon, PlayIcon } from '../icons';

interface DetailBottomSheetNonverbalHeroProps {
  item: StringFigure;
  currentLanguage: 'ja' | 'en';
  isLocked: boolean;
  isAdditionalScene: boolean;
  purchasedItems: number[];
  priceString?: string;
  onPlayPress: () => void;
  onAdditionalCollectionPress?: () => void;
  onPurchasePress?: (collectionId: number) => void;
  getLocalizedText: (textObj: { ja: string; en: string }) => string;
  getButtonBackgroundColor: () => string;
}

const DetailBottomSheetNonverbalHero: React.FC<DetailBottomSheetNonverbalHeroProps> = ({
  item,
  currentLanguage,
  isLocked,
  isAdditionalScene,
  purchasedItems,
  priceString,
  onPlayPress,
  onAdditionalCollectionPress,
  onPurchasePress,
  getLocalizedText,
  getButtonBackgroundColor,
}) => {
  return (
    <View style={styles.container}>
      <Text
        maxFontSizeMultiplier={1.35}
        style={[
          styles.title,
          { fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold' },
        ]}
      >
        {getLocalizedText(item.name)}
      </Text>

      <View style={styles.thumbnail}>
        {item.patternImage ? (
          <Image
            source={typeof item.patternImage === 'string'
              ? { uri: item.patternImage }
              : item.patternImage}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.thumbnailText}>
            {getLocalizedText({ ja: '完成図', en: 'Pattern' })}
          </Text>
        )}
      </View>

      <View style={styles.actionContainer}>
        {isAdditionalScene && item.premiumCourseId !== 0 ? (
          <View style={styles.purchaseButtonWrapper}>
            <PurchaseButton
              onPress={onPurchasePress}
              collectionId={item.premiumCourseId}
              currentLanguage={currentLanguage}
              backgroundColor={getButtonBackgroundColor()}
              disabled={purchasedItems.includes(item.premiumCourseId)}
              priceString={priceString}
            />
          </View>
        ) : isLocked ? (
          <TouchableOpacity
            style={[styles.additionalCollectionButton, { backgroundColor: getButtonBackgroundColor() }]}
            onPress={onAdditionalCollectionPress}
          >
            <LockIcon width={20} height={20} strokeWidth={0} fillColor="#ffffff" />
            <Text style={styles.additionalCollectionButtonText} maxFontSizeMultiplier={1.25}>
              {getLocalizedText({ ja: '追加コレクションを見る', en: 'See Additional Collection' })}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.playButton}
            onPress={onPlayPress}
          >
            <Text style={styles.playButtonText} maxFontSizeMultiplier={1.2}>
              PLAY
            </Text>
            <PlayIcon width={16} height={18} strokeWidth={1.5} strokeColor="#FFFFFF" fillColor="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#333',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 38,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1.78,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailText: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  actionContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  purchaseButtonWrapper: {
    width: '100%',
    paddingHorizontal: 36,
  },
  additionalCollectionButton: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    minWidth: 240,
  },
  additionalCollectionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  playButton: {
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#292524',
    backgroundColor: '#FF5B3A',
    paddingVertical: 9,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.8,
    elevation: 3,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 25,
    letterSpacing: 0.4,
    fontFamily: 'KronaOne-Regular',
  },
});

export default DetailBottomSheetNonverbalHero;
