import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { TranslateIcon } from './icons';

type Language = 'ja' | 'en';

interface LanguageSwitchButtonProps {
  currentLanguage: Language;
  onSelectLanguage: (language: Language) => void | Promise<void>;
  isTablet?: boolean;
  /** 明るい背景上のデフォルト / 濃色・オレンジ等のヘッダー上で白系 */
  appearance?: 'default' | 'inverse';
}

export const showLanguageSelectionDialog = (
  currentLanguage: Language,
  onSelectLanguage: (language: Language) => void | Promise<void>,
) => {
  Alert.alert(
    currentLanguage === 'ja' ? '言語を選択してください' : 'Select Language',
    '',
    [
      {
        text: 'English',
        onPress: () => onSelectLanguage('en'),
      },
      {
        text: '日本語',
        onPress: () => onSelectLanguage('ja'),
      },
      {
        text: currentLanguage === 'ja' ? 'キャンセル' : 'Cancel',
        style: 'cancel',
      },
    ],
    { cancelable: true },
  );
};

const LanguageSwitchButton: React.FC<LanguageSwitchButtonProps> = ({
  currentLanguage,
  onSelectLanguage,
  isTablet = false,
  appearance = 'default',
}) => {
  const handlePress = () => {
    showLanguageSelectionDialog(currentLanguage, onSelectLanguage);
  };

  const inverse = appearance === 'inverse';
  const iconColor = inverse ? '#FFFFFF' : '#57534D';
  const textStyle = [
    styles.buttonText,
    isTablet && styles.buttonTextTablet,
    inverse && styles.buttonTextInverse,
  ];
  const buttonStyle = [
    styles.button,
    isTablet && styles.buttonTablet,
    inverse && styles.buttonInverse,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <TranslateIcon
        width={isTablet ? 28 : 20}
        height={isTablet ? 28 : 20}
        fillColor={iconColor}
        strokeColor={iconColor}
        strokeWidth={0}
      />
      <Text maxFontSizeMultiplier={1.25} style={textStyle}>
        {currentLanguage === 'ja' ? '日本語' : 'English'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5D4037',
  },
  buttonTablet: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#57534D'
  },
  buttonTextTablet: {
    fontSize: 18,
  },
  buttonInverse: {
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  buttonTextInverse: {
    color: '#FFFFFF',
  },
});

export default LanguageSwitchButton;


