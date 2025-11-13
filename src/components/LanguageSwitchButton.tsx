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
}) => {
  const handlePress = () => {
    showLanguageSelectionDialog(currentLanguage, onSelectLanguage);
  };

  return (
    <TouchableOpacity
      style={[styles.button, isTablet && styles.buttonTablet]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <TranslateIcon
        width={isTablet ? 28 : 20}
        height={isTablet ? 28 : 20}
        fillColor="#57534D"
        strokeColor="#57534D"
        strokeWidth={0}
      />
      <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
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
});

export default LanguageSwitchButton;


