import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import StringFigureCard from './StringFigureCard';
import PurchaseButton from './PurchaseButton';
import { stringFigures } from '../data';
import { StringFigure } from '../types';
import { LockIcon } from './icons';

interface CollectionCardProps {
  collectionId: number;
  backgroundColor: string;
  imageDimensions: { [key: string]: { width: number; height: number } };
  currentLanguage: 'ja' | 'en';
  purchasedItems: number[];
  onPurchasePress: (collectionId: number) => void;
  onItemPress: (item: StringFigure) => void;
  onImageLoad: (itemId: string, event: any) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collectionId,
  backgroundColor,
  imageDimensions,
  currentLanguage,
  purchasedItems,
  onPurchasePress,
  onItemPress,
  onImageLoad,
}) => {
  const collectionFigures = stringFigures.filter(figure => figure.premiumCourseId === collectionId);

  return (
    <View style={styles.collectionCard}>
      <ScrollView 
        style={styles.cardScrollView}
        contentContainerStyle={styles.cardScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.collectionHeader}>
          <View style={styles.titleContainer}>
            {!purchasedItems.includes(collectionId) && (
              <View style={[styles.lockIconContainer, { backgroundColor }]}>
                <LockIcon 
                  width={16} 
                  height={16} 
                  fillColor="#FFFFFF"
                  strokeColor="#FFFFFF"
                  strokeWidth={0}
                />
              </View>
            )}
            <Text style={[styles.collectionTitle, { color: backgroundColor }]} maxFontSizeMultiplier={1.25}>
              コレクション{collectionId}
            </Text>
          </View>
          <View style={styles.descriptionSpacer} />
          <Text style={styles.collectionDescription} maxFontSizeMultiplier={1.25} >
            コレクション{collectionId}には、以下のあやとり{collectionFigures.length}パターンが収録されています。
          </Text>
        </View>
        
        <View style={styles.thumbnailContainer}>
          {collectionFigures.map((item) => {
            const imageInfo = imageDimensions[item.id];
            let itemWidth = 180; // デフォルト値
            let calculatedHeight = 200;
            
            if (imageInfo) {
              const aspectRatio = imageInfo.width / imageInfo.height;
              
              if (aspectRatio < 0.7) {
                // height が width の0.7倍以下の場合
                itemWidth = 140;
              } else if (aspectRatio <= 1.8) {
                // width : height が0.7 ~ 1.8 の場合
                itemWidth = 200;
              } else {
                // widthの方が大きい場合
                itemWidth = 236;
              }
              
              calculatedHeight = (imageInfo.height / imageInfo.width) * itemWidth;
            }
            
            return (
              <View key={item.id} style={[styles.thumbnailItem, { width: itemWidth }]}>
                <StringFigureCard
                  item={item}
                  bookmarked={false}
                  calculatedHeight={calculatedHeight}
                  currentLanguage={currentLanguage}
                  hideTitle={true}
                  purchasedItems={purchasedItems}
                  onPress={onItemPress}
                  onImageLoad={onImageLoad}
                />
                <View style={styles.captionSpacer} />
                <Text style={styles.thumbnailCaption} maxFontSizeMultiplier={1.35}>
                  {item.name[currentLanguage]}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.purchaseButtonContainer}>
        <PurchaseButton 
          onPress={onPurchasePress} 
          collectionId={collectionId}
          backgroundColor={backgroundColor}
          disabled={purchasedItems.includes(collectionId)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  collectionCard: {
    width: 260,
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
  },
  cardScrollView: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: 80,
  },
  collectionHeader: {
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionTitle: {
    fontFamily: 'KleeOne-SemiBold',
    fontSize: 24,
    fontWeight: '600',
  },
  descriptionSpacer: {
    height: 4,
  },
  collectionDescription: {
    fontFamily: 'KleeOne-Regular',
    fontSize: 16,
    color: '#292524',
    lineHeight: 24,
    fontWeight: '500',
  },
  thumbnailContainer: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingVertical: 0,
    alignItems: 'center',
  },
  thumbnailItem: {
    marginBottom: 24,
    alignItems: 'center',
  },
  captionSpacer: {
    height: 8,
  },
  thumbnailCaption: {
    fontFamily: 'KleeOne-SemiBold',
    fontSize: 16,
    color: '#292524',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
    width: '100%',
  },
  purchaseButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});

export default CollectionCard;
