import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Platform,
} from 'react-native';
import { LockOpenIcon } from './icons';

interface PurchaseButtonProps {
  onPress?: (collectionId: number) => void;
  collectionId: number;
  backgroundColor?: string;
  disabled?: boolean;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ onPress, collectionId, backgroundColor, disabled = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    onPress?.(collectionId);
  };

  // 定数
  const COLLECTION_NAME = `コレクション${collectionId}`;
  const PURCHASE_TEXT = 'を購入する';
  const PRICE = '0';
  const PURCHASED_TEXT = '購入済';

  // disabled時の背景色とテキスト色
  const buttonBackgroundColor = disabled ? '#E5E5E5' : backgroundColor;
  const textColor = disabled ? '#A1A1A1' : '#FFFFFF';
  const iconColor = disabled ? '#A1A1A1' : '#FFFFFF';

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          { transform: [{ scale: scaleAnim }] },
          { backgroundColor: buttonBackgroundColor },
          disabled && styles.buttonDisabled,
        ]}
      >
        {/* 左側: アイコン */}
        <View style={styles.iconContainer}>
          <LockOpenIcon
            width={24}
            height={24}
            strokeColor="transparent"
            fillColor={iconColor}
            strokeWidth={0}
          />
        </View>

        {/* 中央: テキスト */}
        <View style={styles.textContainer}>
          <Text style={[styles.collectionName, { color: textColor }]}>{COLLECTION_NAME}</Text>
          {!disabled && <Text style={styles.purchaseText}>{PURCHASE_TEXT}</Text>}
        </View>

        {/* 右側: 価格または購入済 */}
        <View style={styles.priceContainer}>
          {disabled ? (
            <Text style={[styles.price, { color: textColor }]}>
              {PURCHASED_TEXT}
            </Text>
          ) : (
            <>
              <Text style={[styles.currency, { color: textColor }]}>¥</Text>
              <Text style={[styles.price, { color: textColor }]}>{PRICE}</Text>
            </>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E17100',
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: 4,
    gap: 4,
  },
  collectionName: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '600',
  },
  purchaseText: {
    fontSize: 14,
    lineHeight: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  price: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '600',
  },
  currency: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '600',
  },
});

export default PurchaseButton;

