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
  onPress?: () => void;
}

const PurchaseButton: React.FC<PurchaseButtonProps> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  };

  const handlePress = () => {
    onPress?.();
  };

  // 定数
  const COLLECTION_NAME = 'コレクション2';
  const PURCHASE_TEXT = 'を購入する';
  const PRICE = '¥480';

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
        ]}
      >
        {/* 左側: アイコン */}
        <View style={styles.iconContainer}>
          <LockOpenIcon
            width={32}
            height={32}
            strokeColor="#FFFFFF"
            fillColor="transparent"
            strokeWidth={1.5}
          />
        </View>

        {/* 中央: テキスト */}
        <View style={styles.textContainer}>
          <Text style={styles.collectionName}>{COLLECTION_NAME}</Text>
          <Text style={styles.purchaseText}>{PURCHASE_TEXT}</Text>
        </View>

        {/* 右側: 価格 */}
        <Text style={styles.price}>{PRICE}</Text>
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
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 0,
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
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: 16,
    gap: 4,
  },
  collectionName: {
    fontFamily: 'KleeOne-SemiBold',
    fontSize: 20,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  purchaseText: {
    fontFamily: 'KleeOne-SemiBold',
    fontSize: 14,
    lineHeight: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  price: {
    fontFamily: 'KleeOne-SemiBold',
    fontSize: 24,
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PurchaseButton;

