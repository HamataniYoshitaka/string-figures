import { useState, useRef, useEffect } from 'react';
import { Platform, NativeModules } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface UseSpeechRecognitionProps {
  /** 音声認識でキーワードが検出された時のコールバック */
  onKeywordDetected?: (keyword: string) => void;
  /** 検出対象のキーワード一覧（デフォルト: ['まえ', 'つぎ', 'もういちど', 'ゆっくり', 'はやく']） */
  keywords?: string[];
  /** 音声認識の無活動時間（ミリ秒）。この時間経過後に自動再起動（デフォルト: 20000） */
  inactivityTimeout?: number;
  /** キーワード検出後の一時停止時間（ミリ秒）（デフォルト: 1500） */
  pauseAfterKeywordMs?: number;
}

interface UseSpeechRecognitionReturn {
  /** 音声認識が現在動作中かどうか */
  recognizing: boolean;
  /** 音声認識がサポートされているかどうか */
  isSupported: boolean;
  /** 音声認識を手動で開始する関数 */
  start: () => Promise<void>;
  /** 音声認識を手動で停止する関数 */
  stop: () => Promise<void>;
  /** 意図的に停止されているかどうか（内部処理用） */
  isIntentionallyStopped: boolean;
  /** キーワード処理中かどうか（内部処理用） */
  isProcessingKeyword: boolean;
}

/**
 * 音声認識機能を管理するカスタムフック
 * 
 * 機能：
 * - 自動的な音声認識の開始/停止
 * - キーワード検出
 * - 無活動時の自動再起動
 * - デバイス言語の自動検出
 */
export const useSpeechRecognition = ({
  onKeywordDetected,
  keywords = ['まえ', 'つぎ', 'もういちど', 'ゆっくり', 'はやく'],
  inactivityTimeout = 20000,
  pauseAfterKeywordMs = 1500,
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn => {
  // 音声認識の状態管理
  const [recognizing, setRecognizing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isIntentionallyStopped, setIsIntentionallyStopped] = useState(false);
  const [isProcessingKeyword, setIsProcessingKeyword] = useState(false);
  
  // 音声認識活動監視用のタイマー
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // デバイスの言語を取得する関数
  const getDeviceLanguage = () => {
    // iOSの場合
    if (Platform.OS === 'ios') {
      const locale = NativeModules.SettingsManager?.getConstants()?.settings?.AppleLocale ||
                     NativeModules.SettingsManager?.getConstants()?.settings?.AppleLanguages?.[0];
      return locale?.replace('_', '-') || 'en-US';
    }
    
    // Androidの場合
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.getConstants()?.localeIdentifier;
      return locale?.replace('_', '-') || 'en-US';
    }
    
    return 'en-US';
  };

  // 活動監視タイマーをリセットする関数
  const resetActivityTimer = () => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }
    
    // 指定時間後に音声認識を再起動
    activityTimerRef.current = setTimeout(() => {
      if (isSupported && recognizing && !isIntentionallyStopped && !isProcessingKeyword) {
        console.log(`${inactivityTimeout / 1000}秒間音声認識イベントが発生しないため、音声認識を再起動します`);
        
        // 処理中フラグを設定（連続処理を防ぐ）
        setIsProcessingKeyword(true);
        
        // 音声認識を一時停止（意図的な停止フラグを設定）
        setIsIntentionallyStopped(true);
        stopRecognition();
        
        // 少し遅延してから再開（ユーザーのアクションが完了するのを待つ）
        setTimeout(() => {
          if (isSupported) {
            setIsIntentionallyStopped(false);
            setIsProcessingKeyword(false);
            startRecognition();
          }
        }, pauseAfterKeywordMs);
      }
    }, inactivityTimeout);
  };

  // 音声認識開始（内部関数）
  const startRecognition = async () => {
    try {
      // マイクの権限をリクエスト
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      if (!granted) {
        console.log('マイクの使用許可が拒否されました');
        return;
      }

      // OSの言語設定を取得
      const deviceLanguage = getDeviceLanguage();
      console.log('音声認識開始、言語:', deviceLanguage);

      // 音声認識を開始
      await ExpoSpeechRecognitionModule.start({
        lang: deviceLanguage, // デバイスの言語設定を使用
        interimResults: true, // 途中結果も取得
        maxAlternatives: 5,
        continuous: true, // 継続的な認識を有効化
      });

      setRecognizing(true);
      
      // 音声認識開始時に活動監視タイマーを開始
      resetActivityTimer();
    } catch (error) {
      console.error('音声認識開始エラー:', error);
    }
  };

  // 音声認識停止（内部関数）
  const stopRecognition = async () => {
    // 既に処理中または停止済みの場合は何もしない
    if (isProcessingKeyword || !recognizing) {
      console.log('音声認識停止処理をスキップ（処理中または停止済み）');
      return;
    }

    try {
      await ExpoSpeechRecognitionModule.stop();
      setRecognizing(false);
      console.log('音声認識を停止しました');
      
      // 活動監視タイマーをクリア
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
        activityTimerRef.current = null;
      }
    } catch (error) {
      console.error('音声認識停止エラー:', error);
    }
  };

  // 外部公開用の開始関数
  const start = async () => {
    if (!isSupported) {
      console.log('音声認識はサポートされていません');
      return;
    }
    setIsIntentionallyStopped(false);
    setIsProcessingKeyword(false);
    await startRecognition();
  };

  // 外部公開用の停止関数
  const stop = async () => {
    setIsIntentionallyStopped(true);
    setIsProcessingKeyword(true);
    await stopRecognition();
    
    // 活動監視タイマーをクリア
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
  };

  // 音声認識の結果を受け取るイベントリスナー
  useSpeechRecognitionEvent('result', (event) => {
    // 活動監視タイマーをリセット
    resetActivityTimer();
    
    const transcript = event.results[0]?.transcript || '';
    if (transcript && !isProcessingKeyword) {
      console.log('音声認識結果:', transcript);
      
      // 指定のキーワードを検出した場合、一時的に音声認識を停止
      const matchedKeyword = keywords.find(keyword => transcript.includes(keyword));
      
      if (matchedKeyword) {
        console.log('キーワード検出:', matchedKeyword);
        
        // 処理中フラグを設定（連続処理を防ぐ）
        setIsProcessingKeyword(true);
        
        // 音声認識を一時停止（意図的な停止フラグを設定）
        setIsIntentionallyStopped(true);
        stopRecognition();
        
        // コールバックを呼び出し
        onKeywordDetected?.(matchedKeyword);
        
        // 少し遅延してから再開（ユーザーのアクションが完了するのを待つ）
        setTimeout(() => {
          if (isSupported) {
            setIsIntentionallyStopped(false);
            setIsProcessingKeyword(false);
            startRecognition();
          }
        }, pauseAfterKeywordMs);
      }
    }
  });

  // エラーハンドリング
  useSpeechRecognitionEvent('error', (event) => {
    // 意図的な停止の場合は、audio-captureエラーを無視
    if (isIntentionallyStopped && event.error === 'audio-capture') {
      console.log('音声認識停止に伴う予期されるエラー (無視):', event.error);
    } else {
      console.error('音声認識エラー:', event.error);
    }
    setRecognizing(false);
  });

  // 音声認識終了時
  useSpeechRecognitionEvent('end', () => {
    if (isIntentionallyStopped) {
      console.log('音声認識終了 (意図的な停止)');
    } else {
      console.log('音声認識終了');
    }
    setRecognizing(false);
  });

  // 音声認識サポート確認と自動開始
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        // 音声認識がサポートされているか確認
        const supported = await ExpoSpeechRecognitionModule.isRecognitionAvailable();
        setIsSupported(supported);
        
        if (supported) {
          console.log('音声認識をサポートしています');
          // 自動で音声認識を開始
          await startRecognition();
        } else {
          console.log('音声認識はサポートされていません');
        }
      } catch (error) {
        console.error('音声認識の初期化エラー:', error);
      }
    };

    initializeSpeechRecognition();

    // クリーンアップ関数
    return () => {
      if (recognizing) {
        setIsIntentionallyStopped(true);
        setIsProcessingKeyword(true);
        stopRecognition();
      }
      
      // タイマーのクリーンアップ
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
        activityTimerRef.current = null;
      }
    };
  }, []);

  return {
    recognizing,
    isSupported,
    start,
    stop,
    isIntentionallyStopped,
    isProcessingKeyword,
  };
};
