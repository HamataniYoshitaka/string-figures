import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { EasyIcon } from './icons';

interface IconButtonProps {
  onPress?: () => void;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onPress, title = 'Button' }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    setIsActive(!isActive);
    onPress?.();
  };

  // 状態に応じてアイコンの色を決定
  const getIconColors = () => {
    if (isPressed) {
      return {
        strokeColor: '#3B82F6', // 押下時: 青
        fillColor: '#DBEAFE',   // 押下時: 薄い青
      };
    }
    
    if (isActive) {
      return {
        strokeColor: '#10B981', // アクティブ時: 緑
        fillColor: '#D1FAE5',   // アクティブ時: 薄い緑
      };
    }
    
    return {
      strokeColor: '#6B7280',   // デフォルト: グレー
      fillColor: 'none',        // デフォルト: 塗りつぶしなし
    };
  };

  const { strokeColor, fillColor } = getIconColors();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPressed && styles.buttonPressed,
        isActive && styles.buttonActive,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <EasyIcon
        width={24}
        height={25}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={isPressed ? 2 : 1}
      />
      <Text style={[
        styles.buttonText,
        isActive && styles.buttonTextActive,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  buttonPressed: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  buttonActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  buttonTextActive: {
    color: '#10B981',
  },
});

export default IconButton;
