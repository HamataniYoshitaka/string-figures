import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { LockOpenIcon } from './icons';

interface PurchaseButtonProps {
  onPress?: (collectionId: number) => void;
  collectionId: number;
  currentLanguage: 'ja' | 'en';
  backgroundColor?: string;
  disabled?: boolean;
  priceString?: string;
}

const SHADOW_OFFSET = 4;

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ onPress, collectionId, currentLanguage, backgroundColor, disabled = false, priceString }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const [buttonLayout, setButtonLayout] = useState({ width: 0, height: 0 });

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(pressAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const pressTranslate = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SHADOW_OFFSET],
  });

  const handlePress = () => {
    if (disabled) return;
    onPress?.(collectionId);
  };

  // 定数
  const COLLECTION_NAME_JA = `コレクション${collectionId}`;
  const COLLECTION_NAME_EN = `Collection ${collectionId}`;
  const PURCHASE_TEXT_JA = 'を購入する';
  const PURCHASE_TEXT_EN = 'Purchase';
  const PURCHASED_TEXT_JA = '購入済';
  const PURCHASED_TEXT_EN = 'Purchased';

  // priceStringから通貨記号と金額を分離する関数
  const parsePriceString = (priceStr: string): { currency: string; amount: string; isCurrencyBefore: boolean } => {
    if (!priceStr) {
      return { currency: '$', amount: '0', isCurrencyBefore: true };
    }
    
    // 数字、カンマ、ピリオド、スペース以外の文字を抽出（通貨記号）
    // 前後のどちらにも来る可能性がある
    const currencyMatch = priceStr.match(/[^\d\s.,]+/g);
    const currency = currencyMatch ? currencyMatch.join('') : '';
    
    // 数字、カンマ、ピリオドを抽出（金額）
    const amountMatch = priceStr.match(/[\d.,]+/);
    const amount = amountMatch ? amountMatch[0] : '0';
    
    // 通貨記号が前にあるか後ろにあるかを判定
    const currencyIndex = priceStr.indexOf(currency);
    const amountIndex = priceStr.indexOf(amount);
    
    return {
      currency: currency || '$',
      amount: amount || '0',
      isCurrencyBefore: currencyIndex < amountIndex,
    };
  };

  const priceParts = parsePriceString(priceString || '$0');

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
      <View style={[styles.buttonWrapper, !disabled && styles.buttonWrapperEnabled]}>
        <View style={styles.buttonContainer}>
          {!disabled && buttonLayout.width > 0 && (
            <View
              style={[
                styles.buttonShadow,
                {
                  width: buttonLayout.width,
                  height: buttonLayout.height,
                },
              ]}
            />
          )}
          <Animated.View
            style={[
              styles.button,
              disabled ? styles.buttonDisabled : styles.buttonEnabled,
              { backgroundColor: buttonBackgroundColor },
              !disabled && {
                transform: [{ translateX: pressTranslate }, { translateY: pressTranslate }],
              },
            ]}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setButtonLayout((prev) =>
                prev.width === width && prev.height === height ? prev : { width, height },
              );
            }}
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
              <Text style={[styles.collectionName, { color: textColor }]}>
                {currentLanguage === 'ja' ? COLLECTION_NAME_JA : COLLECTION_NAME_EN}
              </Text>
              {!disabled && (
                <Text style={styles.purchaseText}>
                  {currentLanguage === 'ja' ? PURCHASE_TEXT_JA : PURCHASE_TEXT_EN}
                </Text>
              )}
            </View>

            {/* 右側: 価格または購入済 */}
            <View style={styles.priceContainer}>
              {disabled ? (
                <Text style={[styles.price, { color: textColor }, currentLanguage === 'en' && { fontSize: 15 }]}>
                  {currentLanguage === 'ja' ? PURCHASED_TEXT_JA : PURCHASED_TEXT_EN}
                </Text>
              ) : (
                <>
                  {priceParts.isCurrencyBefore && (
                    <Text style={[styles.currency, { color: textColor }]}>{priceParts.currency}</Text>
                  )}
                  <Text style={[styles.price, { color: textColor }]}>{priceParts.amount}</Text>
                  {!priceParts.isCurrencyBefore && (
                    <Text style={[styles.currency, { color: textColor }]}>{priceParts.currency}</Text>
                  )}
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: 'stretch',
  },
  buttonWrapperEnabled: {
    paddingRight: SHADOW_OFFSET,
    paddingBottom: SHADOW_OFFSET,
  },
  buttonContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  buttonShadow: {
    position: 'absolute',
    left: SHADOW_OFFSET,
    top: SHADOW_OFFSET,
    borderRadius: 32,
    backgroundColor: '#000000',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonEnabled: {
    borderWidth: 2,
    borderColor: '#292524',
  },
  buttonDisabled: {
    borderWidth: 0,
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

