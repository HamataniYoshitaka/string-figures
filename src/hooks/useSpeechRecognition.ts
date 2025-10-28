import { useState, useRef, useEffect } from 'react';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface UseSpeechRecognitionProps {
  /** 音声認識でキーワードが検出された時のコールバック */
  onKeywordDetected?: (keyword: string) => void;
  /** アプリの言語設定 */
  language?: 'ja' | 'en';
  /** 音声認識の無活動時間（ミリ秒）。この時間経過後に自動再起動（デフォルト: 20000） */
  inactivityTimeout?: number;
  /** キーワード検出後の一時停止時間（ミリ秒）（デフォルト: 1500） */
  pauseAfterKeywords?: number;
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
  /** すべてのタイマーをキャンセルして完全に停止する関数 */
  cleanup: () => void;
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
  language = 'ja',
  inactivityTimeout = 20000,
  pauseAfterKeywords = 1500,
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn => {
  // 言語に応じたキーワードマッピング
  const keywordMap = {
    ja: {
      next: ['つぎ', '次'],
      previous: ['まえ', '前'],
      replay: ['もういちど', 'もう一度'],
      slower: ['ゆっくり'],
      faster: ['はやく', '早く', '速く'],
      restart: ['はじめから', '初めから', '始めから'],
    },
    en: {
      next: ['next'],
      previous: ['previous'],
      replay: ['replay'],
      slower: ['slower'],
      faster: ['faster'],
      restart: ['restart'],
    },
  };

  // 現在の言語のキーワードを取得
  const currentKeywords = keywordMap[language];
  const keywords = [
    ...currentKeywords.next,
    ...currentKeywords.previous,
    ...currentKeywords.replay,
    ...currentKeywords.slower,
    ...currentKeywords.faster,
    ...currentKeywords.restart,
  ];

  // 音声認識の状態管理
  const [recognizing, setRecognizing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isIntentionallyStopped, setIsIntentionallyStopped] = useState(false);
  const [isProcessingKeyword, setIsProcessingKeyword] = useState(false);
  
  // 音声認識活動監視用のタイマー
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  // キーワード検出後の再開用タイマー
  const keywordRestartTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        console.log('settimeout 音声認識を一時停止します');
        stopRecognition();
        
        // 少し遅延してから再開（ユーザーのアクションが完了するのを待つ）
        setTimeout(() => {
          if (isSupported) {
            setIsIntentionallyStopped(false);
            setIsProcessingKeyword(false);
            startRecognition();
          }
        }, pauseAfterKeywords);
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

      // 言語設定に基づいて音声認識の言語を設定
      const deviceLanguage = language === 'ja' ? 'ja-JP' : 'en-US';
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
    console.log('stop called');
    await stopRecognition();

    // 活動監視タイマーをクリア
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }

    // キーワード再開タイマーをクリア
    if (keywordRestartTimerRef.current) {
      clearTimeout(keywordRestartTimerRef.current);
      keywordRestartTimerRef.current = null;
    }
  };

  // すべてのタイマーをキャンセルして完全に停止する関数
  const cleanup = () => {
    setIsIntentionallyStopped(true);
    setIsProcessingKeyword(true);

    // すべてのタイマーをクリア
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = null;
    }
    if (keywordRestartTimerRef.current) {
      clearTimeout(keywordRestartTimerRef.current);
      keywordRestartTimerRef.current = null;
    }

    // 音声認識を停止（非同期だが待たない）
    if (recognizing) {
      Promise.resolve(ExpoSpeechRecognitionModule.stop()).catch((error) => {
        console.error('クリーンアップ時の音声認識停止エラー:', error);
      });
      setRecognizing(false);
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
      const transcriptLower = transcript.toLowerCase();
      const matchedKeyword = keywords.find(keyword => 
        transcriptLower.includes(keyword.toLowerCase())
      );
      
      if (matchedKeyword) {
        console.log('キーワード検出:', matchedKeyword);
        
        // 処理中フラグを設定（連続処理を防ぐ）
        setIsProcessingKeyword(true);
        
        // 音声認識を一時停止（意図的な停止フラグを設定）
        setIsIntentionallyStopped(true);
        console.log('keyword match. 音声認識を一時停止します');
        stopRecognition();
        
        // 検出されたキーワードがどのアクションに対応するか判定
        let actionKeyword = matchedKeyword;
        if (currentKeywords.next.includes(matchedKeyword)) {
          actionKeyword = language === 'ja' ? 'つぎ' : 'next';
        } else if (currentKeywords.previous.includes(matchedKeyword)) {
          actionKeyword = language === 'ja' ? 'まえ' : 'previous';
        } else if (currentKeywords.replay.includes(matchedKeyword)) {
          actionKeyword = language === 'ja' ? 'もういちど' : 'replay';
        } else if (currentKeywords.slower.includes(matchedKeyword)) {
          actionKeyword = language === 'ja' ? 'ゆっくり' : 'slower';
        } else if (currentKeywords.faster.includes(matchedKeyword)) {
          actionKeyword = language === 'ja' ? 'はやく' : 'faster';
        } else if (currentKeywords.restart.includes(matchedKeyword)) {
          actionKeyword = language === 'ja' ? 'はじめから' : 'restart';
        }
        
        // コールバックを呼び出し
        onKeywordDetected?.(actionKeyword);
        
        // 少し遅延してから再開（ユーザーのアクションが完了するのを待つ）
        keywordRestartTimerRef.current = setTimeout(() => {
          if (isSupported) {
            setIsIntentionallyStopped(false);
            setIsProcessingKeyword(false);
            startRecognition();
          }
        }, pauseAfterKeywords);
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
      cleanup();
    };
  }, [language]); // languageが変更されたら再初期化

  return {
    recognizing,
    isSupported,
    start,
    stop,
    cleanup,
    isIntentionallyStopped,
    isProcessingKeyword,
  };
};
