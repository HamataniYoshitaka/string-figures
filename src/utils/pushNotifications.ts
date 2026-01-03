import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import Constants from 'expo-constants';

const PUSH_PERMISSION_REQUESTED_KEY = 'pushPermissionRequested';
const REGISTER_URL = 'https://hamahouse.sakura.ne.jp/stringfigures/push/register.php';
const API_KEY = 'cX1%8S&pagBMp2D%';

/**
 * 既にプッシュ通知の許可をリクエストしたかチェック
 */
export const getHasRequestedPushPermission = async (): Promise<boolean> => {
  try {
    const hasRequested = await AsyncStorage.getItem(PUSH_PERMISSION_REQUESTED_KEY);
    return hasRequested === 'true';
  } catch (error) {
    console.error('プッシュ通知許可リクエストフラグの読み込みに失敗しました:', error);
    return false;
  }
};

/**
 * プッシュ通知許可リクエスト済みフラグを保存
 */
export const saveHasRequestedPushPermission = async (hasRequested: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(PUSH_PERMISSION_REQUESTED_KEY, hasRequested.toString());
  } catch (error) {
    console.error('プッシュ通知許可リクエストフラグの保存に失敗しました:', error);
  }
};

/**
 * プッシュ通知の許可をリクエスト
 */
export const requestPushNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('プッシュ通知の許可リクエスト中にエラーが発生しました:', error);
    return false;
  }
};

/**
 * プッシュ通知トークンを取得
 */
export const getPushToken = async (): Promise<string | null> => {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('EAS projectIdが見つかりません');
      return null;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenData.data;
  } catch (error) {
    console.error('プッシュ通知トークンの取得に失敗しました:', error);
    return null;
  }
};

/**
 * サーバーにプッシュ通知トークンを登録
 */
export const registerPushToken = async (
  token: string,
  language: 'ja' | 'en',
  locale: string | undefined
): Promise<boolean> => {
  try {
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
      },
      body: JSON.stringify({
        token,
        platform,
        language,
        locale: locale || Localization.getLocales()?.[0]?.languageTag || 'en',
      }),
    });

    if (!response.ok) {
      console.error('トークン登録に失敗しました:', response.status, response.statusText);
      return false;
    }

    console.log('プッシュ通知トークンをサーバーに登録しました');
    return true;
  } catch (error) {
    console.error('トークン登録中にエラーが発生しました:', error);
    return false;
  }
};

/**
 * プッシュ通知の許可をリクエストし、トークンを取得してサーバーに登録
 */
export const requestAndRegisterPushNotification = async (
  language: 'ja' | 'en'
): Promise<boolean> => {
  try {
    // 許可をリクエスト
    const granted = await requestPushNotificationPermission();
    if (!granted) {
      console.log('プッシュ通知の許可が得られませんでした');
      return false;
    }

    // トークンを取得
    const token = await getPushToken();
    if (!token) {
      console.error('プッシュ通知トークンの取得に失敗しました');
      return false;
    }

    // サーバーに登録
    const locale = Localization.getLocales()?.[0]?.languageTag;
    const success = await registerPushToken(token, language, locale);
    
    if (success) {
      // リクエスト済みフラグを保存
      await saveHasRequestedPushPermission(true);
    }

    return success;
  } catch (error) {
    console.error('プッシュ通知の設定中にエラーが発生しました:', error);
    return false;
  }
};

