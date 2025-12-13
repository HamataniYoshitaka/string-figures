import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Animated, Text, Dimensions, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import ProgressDots from '../components/ProgressDots';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Provider as PaperProvider, Snackbar } from 'react-native-paper';

type IntroVoiceScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'IntroVoice'
>;
type IntroVoiceScreenRouteProp = RouteProp<RootStackParamList, 'IntroVoice'>;

interface Props {
  navigation: IntroVoiceScreenNavigationProp;
  route: IntroVoiceScreenRouteProp;
}

const chapters = [
    {
        title: { ja: '', en: '' },
        subtitle: { ja: '', en: '' },
        video: require('../../assets/string-figures/0_introduction/intro2-ios-ja.mp4')
    },
    {
        title: { ja: '', en: '' },
        subtitle: { ja: '', en: '' },
        video: require('../../assets/string-figures/0_introduction/intro2-ios-ja.mp4')
    },
    {
        title: { ja: '音声テスト', en: 'Voice test' },
        subtitle: { ja: '「つぎ」と話しかけて下さい', en: 'Please say "next"' },
        video: {ja: require('../../assets/string-figures/0_introduction/intro3.mp4'), en: require('../../assets/string-figures/0_introduction/intro3-en.mp4')}
    },
    {
        title: { ja: '', en: '' },
        subtitle: { ja: 'このアプリを使う準備が完了しました!\n世界中に伝承されている\n「あやとり」をお楽しみ下さい!', en: 'The preparation for using this app is complete!\nEnjoy the "String figures" that have been passed down through generations around the world!' },
        video: require('../../assets/string-figures/0_introduction/intro3.mp4')
    }
];  

const IntroVideoScreen: React.FC<Props> = ({ navigation, route }) => {
    const { currentLanguage } = route.params;
    const videoRef = useRef<Video>(null);
    const [playbackRate, setPlaybackRate] = useState<number>(1.0);
    const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(2);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
    const isSmallScreen = screenDimensions.height <= 667;


    // 音声認識フック
    const {
        recognizing,
        isSupported: isRecognitionSupported,
        start: startRecognition,
        stop: stopRecognition,
        cleanup,
      } = useSpeechRecognition({
        language: currentLanguage,
        onKeywordDetected: async (keyword) => {
          // キーワードに応じたアクションを実行
          if (keyword === 'つぎ' || keyword === 'next') {
            await handleNextScreen();
          } 
        },
        onNetworkError: () => {
          // ネットワークエラー時にSnackbarを表示
          setSnackbarVisible(true);
        },
    });

    // アプリ起動時に保存された言語設定を読み込む
    useEffect(() => {
    
        // 画面スリープを防止
        activateKeepAwakeAsync();
    
        // クリーンアップ: スマホの場合はアンマウント時に画面の向きをportraitに戻す
        return () => {
          // 画面スリープ防止を解除
          deactivateKeepAwake();
        };
    }, []);

    const handleNextScreen = async () => {
        // 音声認識を停止
        if (recognizing) {
            await stopRecognition();
        }
        cleanup();
        // 300ms待機してから進む
        await new Promise(resolve => setTimeout(resolve, 300));

        navigation.navigate('IntroComplete');
    }

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    
    const { isTablet, isDeviceLandscape } = useDeviceInfo();

    // アニメーションヘルパー関数
    const createPressInHandler = (scale: Animated.Value) => () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
        }).start();
    };

    const createPressOutHandler = (scale: Animated.Value) => () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
        }).start();
    };

    const onGoBack = async () => {
        console.log('onGoBack');
        // 音声認識を停止
        if (recognizing) {
            await stopRecognition();
        }
        cleanup();
        // 300ms待機してから戻る
        await new Promise(resolve => setTimeout(resolve, 300));
        navigation.goBack();
    };

    const onSkip = async () => {
        console.log('onSkip to HomeScreen');
        try {
            await AsyncStorage.setItem('introduction_completed', 'true');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error('イントロ完了状態の保存に失敗しました:', error);
        }
    };

    // 多言語対応のヘルパー関数
    const getLocalizedText = (textObj: { ja: string; en: string }) => {
        return textObj[currentLanguage];
    };


    // 動画の再生状況を監視
    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis || 0);
            setVideoDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
                // 動画が終了した場合
                console.log('Video finished');
                // 最初に戻してループ再生
                setPlaybackPosition(0);
                videoRef.current?.setPositionAsync(0);
                videoRef.current?.playAsync();
            }
        }
    };
    // 動画がロードされた時の処理
    const handleVideoLoad = async () => {
        setPlaybackPosition(0); // 新しい動画読み込み時は進捗をリセット
        try {
            // videoRef.currentがnullでないことを確認してからメソッドを呼ぶ
            const video = videoRef.current;
            if (!video) return;
            // 動画を最初の位置（0秒）にセットしてから再生
            await video.setPositionAsync(0);
            await video.playAsync();
        } catch (error) {
            console.error('Error auto-playing video:', error);
        }
    };

        // 進捗計算のヘルパー関数
    const getChapterProgress = (chapterIndex: number) => {
        if (chapterIndex < currentChapterIndex) {
        // 完了したチャプター
        return 1;
        } else if (chapterIndex === currentChapterIndex) {
        // 現在のチャプター
        return videoDuration > 0 ? playbackPosition / videoDuration : 0;
        } else {
        // 未開始のチャプター
        return 0;
        }
    };    


    // ネットワークエラーメッセージ
    const networkErrorMessage = getLocalizedText({
        ja: 'ネットワーク接続がありません。音声認識機能を使用できません。',
        en: 'No network connection. Speech recognition is unavailable.',
    });

    return (    
        <PaperProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableWithoutFeedback 
                        onPress={onGoBack}
                        onPressIn={createPressInHandler(backButtonScale)}
                        onPressOut={createPressOutHandler(backButtonScale)}
                    >
                        <Animated.View 
                        style={[
                            styles.backButton,
                            { transform: [{ scale: backButtonScale }] }
                        ]}
                        >
                        <CloseIcon width={24} height={24} fillColor="#79716B" />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    <Text 
                        maxFontSizeMultiplier={1.35}
                        style={[
                            styles.title, 
                            { 
                                fontSize: isTablet ? 22 : 18,
                                fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold'
                            }
                        ]} numberOfLines={1}
                    >
                        {getLocalizedText({ja: 'はじめに', en: 'Introduction'})}
                    </Text>
                </View>

                {/* 動画エリア */}
                <View style={[
                    styles.videoArea,
                    !isTablet && { paddingHorizontal: 0 },
                    (isTablet && isDeviceLandscape) && styles.videoAreaTabletLandscape
                ]}>
                    <View style={[
                        styles.videoPlayer,
                        !isTablet && { borderRadius: 0 },
                    ]}>
                    <Video
                        key={`chapter-${currentChapterIndex}`}
                        ref={videoRef}
                        source={ currentLanguage === 'ja' ? chapters[currentChapterIndex].video.ja : chapters[currentChapterIndex].video.en }
                        style={styles.video}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isLooping={false}
                        isMuted={true}
                        useNativeControls={false}
                        rate={playbackRate}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        onLoad={handleVideoLoad}
                    />
                    
                    </View>

                    {/* 進捗バー */}
                    <View style={[
                        styles.progressContainer,
                    ]}>
                    <ProgressDots 
                        chapters={chapters}
                        currentChapterIndex={currentChapterIndex}
                        getChapterProgress={getChapterProgress}
                    />
                    </View>

                </View>

                <ScrollView 
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 字幕エリア */}
                    <View style={styles.subtitleContainer}>
                        {(() => {
                            const currentChapter = chapters[currentChapterIndex];
                            const title = currentChapter.title ? getLocalizedText(currentChapter.title) : '';
                            const subtitle = getLocalizedText(currentChapter.subtitle);
                            
                            return (
                                <>
                                    {title && (
                                        <View style={styles.titleContainer}>
                                            <Text 
                                                maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                                style={styles.stepNumber}
                                            >
                                                Step {currentChapterIndex + 1}
                                            </Text>
                                            <Text 
                                                maxFontSizeMultiplier={1.25}
                                                style={styles.stepTitle}
                                            >
                                                {title}
                                            </Text>
                                        </View>
                                    )}
                                    {subtitle && (
                                        <Text 
                                            maxFontSizeMultiplier={isSmallScreen? 1.0 : 1.25}
                                            style={styles.subtitleText}
                                        >
                                            {subtitle}
                                        </Text>
                                    )}
                                </>
                            );
                        })()}
                    </View>

                    <View style={styles.voiceFallbackCard}>
                        <View style={styles.voiceFallbackHeader}>
                            <View style={styles.voiceFallbackDivider} />
                            <Text 
                                maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                style={styles.voiceFallbackHeaderText}
                            >{getLocalizedText({ja: 'または', en: 'Or'})}</Text>
                            <View style={styles.voiceFallbackDivider} />
                        </View>

                        <View style={styles.voiceFallbackDescription}>
                            <Text 
                                maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                style={styles.voiceFallbackDescriptionText}
                            >{getLocalizedText({ja: 'あなたの声に反応しないですか？', en: 'Is your voice not responding?'})}</Text>
                            <Text 
                                maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                style={styles.voiceFallbackDescriptionText}
                            >{getLocalizedText({ja: 'このアプリは音声認識無しでも楽しむことができます', en: 'This app can be enjoyed without voice recognition'})}</Text>
                        </View>

                        <TouchableOpacity activeOpacity={0.7} style={styles.voiceFallbackButton} onPress={onSkip}>
                            <Text 
                                maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                style={styles.voiceFallbackButtonText}
                            >{getLocalizedText({ja: 'このまま次に進む', en: 'Skip to next'})}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                
            </SafeAreaView>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={4000}
                style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
            >
                {networkErrorMessage}
            </Snackbar>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F5F2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderRadius: 20,
    },
    title: {
        flex: 1,
        fontSize: 18,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    videoArea: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    videoAreaTabletLandscape: {
        paddingTop: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 340,
    },
    videoPlayer: {
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    progressContainer: {
        marginTop: 16,
        paddingLeft: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    subtitleContainer: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        justifyContent: 'center',
        maxWidth: 560,
        marginHorizontal: 'auto',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 12,
    },
    stepNumber: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 40,
        color: '#292524',
        lineHeight: 40,
        marginRight: 12,
    },
    stepTitle: {
        flex: 1,
        fontSize: 18,
        color: '#000',
        fontWeight: '600',
        lineHeight: 18,
    },
    subtitleText: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 24,
        color: '#57534d',
        lineHeight: 32,
        fontWeight: '600',
        textAlign: 'center',
    },
    controlsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    controlButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        paddingVertical: 12,
        gap: 10,
    },
    buttonContainer: {
        position: 'relative',
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    floatingButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F7F5F2',
        borderWidth: 2,
        borderColor: '#57534D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    balloon: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        position: 'relative',
    },
    balloonTopLeft: {
        borderTopLeftRadius: 0,
    },
    controlButtonText: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
        fontWeight: '500',
    },
    voiceFallbackCard: {
        marginHorizontal: 24,
        marginBottom: 32,
        alignItems: 'center',
    },
    voiceFallbackHeader: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    voiceFallbackDivider: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#79716B',
    },
    voiceFallbackHeaderText: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 16,
        lineHeight: 32,
        color: '#79716B',
        textAlign: 'center',
        marginHorizontal: 12,
    },
    voiceFallbackDescription: {
        marginTop: 16,
        alignItems: 'center',
    },
    voiceFallbackDescriptionText: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 16,
        lineHeight: 32,
        color: '#222',
        textAlign: 'center',
    },
    voiceFallbackButton: {
        width: '100%',
        alignItems: 'center',
        marginTop: 24,
    },
    voiceFallbackButtonText: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 18,
        lineHeight: 32,
        color: '#292524',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});

export default IntroVideoScreen;