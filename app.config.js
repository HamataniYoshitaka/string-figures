require('dotenv').config();

module.exports = {
  expo: {
    name: 'String Figures',
    slug: 'string-figures',
    locales: {
      en: './locales/en.json',
      ja: './locales/ja.json',
    },
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#F7F5F2',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.hamahouse.string-figures',
      infoPlist: {
        NSSpeechRecognitionUsageDescription: 'このアプリは、動画の操作を音声で行うために音声認識機能を使用します。',
        NSMicrophoneUsageDescription: 'このアプリは、音声認識のためにマイクへのアクセスが必要です。',
        NSPhotoLibraryUsageDescription: 'このアプリは、一部の機能で画像を選択・保存する可能性があるため、写真ライブラリへのアクセスが必要になる場合があります。',
        CFBundleAllowMixedLocalizations: true,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F7F5F2',
      },
      icon: './assets/icon.png',
      edgeToEdgeEnabled: true,
      package: 'com.hamahouse.stringfigures',
      permissions: ['android.permission.RECORD_AUDIO'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-font', 'expo-speech-recognition', 'expo-localization'],
    extra: {
      eas: {
        projectId: 'dbcd5e01-54ee-4bd0-aeff-5ddc545ca364',
      },
      // iOS用APIキー: EASのSecrets/Environment variablesから読み込み（ビルド時）
      // ローカル開発時は.envファイルから読み込み
      revenueCatIosApiKey: process.env.REVENUECAT_IOS_API_KEY || '',
      // Android用APIキー: EASのSecrets/Environment variablesから読み込み（ビルド時）
      // ローカル開発時は.envファイルから読み込み
      revenueCatAndroidApiKey: process.env.REVENUECAT_ANDROID_API_KEY || '',
    },
  },
};

