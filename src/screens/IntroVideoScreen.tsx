import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Dimensions, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, SkipNextIcon } from '../components/icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import ProgressDots from '../components/ProgressDots';
import NextChapterButton from '../components/NextChapterButton';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

type IntroVideoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'IntroVideo'
>;
type IntroVideoScreenRouteProp = RouteProp<RootStackParamList, 'IntroVideo'>;

interface Props {
  navigation: IntroVideoScreenNavigationProp;
  route: IntroVideoScreenRouteProp;
}

const chapters = [
    {
        title: { ja: 'このアプリの特徴', en: 'Features of this app' },
        subtitle: { ja: 'これは「あやとり」の取り方を解説するアプリです。\n両手の指に糸がかかったままでも\n画面に触らずに「声」で操作できます', en: 'This is an app that explains how to play "String figures". You can operate it by voice without touching the screen even if the string is caught on your fingers.' },
        video: {ja: require('../../assets/string-figures/0_introduction/intro1.mp4'), en: require('../../assets/string-figures/0_introduction/intro1-en.mp4')}
    },
    {
        title: { ja: '音声認識について', en: 'About voice recognition' },
        subtitle: { ja: '音声認識とマイクの使用確認画面が出ますので、どちらも許可して下さい\n（音声の保存・収集は一切行なっておりません）', en: 'Please allow both the voice recognition and microphone usage confirmation screens to appear.\n(No voice recording or collection is performed.)' },
        video: {ja: require('../../assets/string-figures/0_introduction/intro2.mp4'), en: require('../../assets/string-figures/0_introduction/intro2-en.mp4')}
    },
    {
        title: { ja: 'マイクの利用許可', en: 'Permission to use microphone' },
        subtitle: { ja: '', en: '' },
        video: require('../../assets/string-figures/0_introduction/intro2.mp4')
    },
    {
        title: { ja: '', en: '' },
        subtitle: { ja: '', en: '' },
        video: require('../../assets/string-figures/0_introduction/intro2.mp4')
    },
];  

const chapters_android = [
    {
        title: { ja: 'このアプリの特徴', en: 'Features of this app' },
        subtitle: { ja: 'これは「あやとり」の取り方を解説するアプリです。\n両手の指に糸がかかったままでも\n画面に触らずに「声」で操作できます', en: 'This is an app that explains how to play "String figures". You can operate it by voice without touching the screen even if the string is caught on your fingers.' },
        video: {ja: require('../../assets/string-figures/0_introduction/intro1.mp4'), en: require('../../assets/string-figures/0_introduction/intro1-en.mp4')}
    },
    {
        title: { ja: '音声認識について', en: 'About voice recognition'  },
        subtitle: { ja: 'マイクの使用確認画面が出ますので許可して下さい\n（音声の保存・収集は一切行なっておりません）', en: 'Please allow the microphone usage confirmation screen to appear.\n(No voice recording or collection is performed.)' },
        video: {ja: require('../../assets/string-figures/0_introduction/intro2-android.mp4'), en: require('../../assets/string-figures/0_introduction/intro2-android-en.mp4')}
    },
    {
        title: { ja: 'マイクの利用許可', en: 'Permission to use microphone' },
        subtitle: { ja: '', en: '' },
        video: require('../../assets/string-figures/0_introduction/intro2.mp4')
    },
    {
        title: { ja: '', en: '' },
        subtitle: { ja: '', en: '' },
        video: require('../../assets/string-figures/0_introduction/intro2.mp4')
    },
];  

const IntroVideoScreen: React.FC<Props> = ({ navigation, route }) => {
    const { currentLanguage } = route.params;
    const videoRef = useRef<Video>(null);
    const nextChapterButtonRef = useRef<any>(null);
    const [playbackRate, setPlaybackRate] = useState<number>(1.0);
    const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    
    const { isTablet, isDeviceLandscape } = useDeviceInfo();
    const isAndroid = Platform.OS === 'android';
    console.log('isAndroid', isAndroid);
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
        navigation.goBack();
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

    const onNextChapter = async () => {
        if (currentChapterIndex === 0) {
            setCurrentChapterIndex(1);
            try {
                // 動画を最初の位置（0秒）にセットしてから再生
                await videoRef.current?.setPositionAsync(0);
                await videoRef.current?.playAsync();
            } catch (error) {
                console.error('Error playing video:', error);
            }
        } else if (currentChapterIndex === 1) {
            // マイクと音声認識の許可を求める
            try {
                const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

                if (!granted) {
                    // IntroErrorScreenへ遷移
                    navigation.replace('IntroError');
                    return;
                }

                // 権限が許可された場合、次の処理へ
                console.log('マイクと音声認識の許可が付与されました');
                // 遷移処理
                navigation.replace('IntroVoice', { currentLanguage: currentLanguage });
            } catch (error) {
                console.error('音声認識の許可リクエストエラー:', error);
            }
        }
    }

    return (    
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
                <Text style={[
                    styles.title, 
                    { 
                        fontSize: isTablet ? 22 : 18,
                        fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold'
                    }
                ]} numberOfLines={1}>
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
                    source={isAndroid ? 
                        currentLanguage === 'ja' ? chapters_android[currentChapterIndex].video.ja : chapters_android[currentChapterIndex].video.en : 
                        currentLanguage === 'ja' ? chapters[currentChapterIndex].video.ja : chapters[currentChapterIndex].video.en }
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

            {/* 字幕エリア */}
            <View style={styles.subtitleContainer}>
                {(() => {
                    const currentChapter = isAndroid ? chapters_android[currentChapterIndex] : chapters[currentChapterIndex];
                    const title = currentChapter.title ? getLocalizedText(currentChapter.title) : '';
                    const subtitle = getLocalizedText(currentChapter.subtitle);
                    
                    return (
                        <>
                            {title && (
                                <View style={styles.titleContainer}>
                                    <Text style={styles.stepNumber}>
                                        Step. {currentChapterIndex + 1}
                                    </Text>
                                    <Text style={styles.stepTitle}>
                                        {title}
                                    </Text>
                                </View>
                            )}
                            {subtitle && (
                                <Text style={styles.subtitleText}>
                                    {subtitle}
                                </Text>
                            )}
                        </>
                    );
                })()}
            </View>

            {/* コントロールボタンエリア */}
            <View style={styles.controlsContainer}>
                <TouchableWithoutFeedback onPress={onNextChapter}>
                    <View style={styles.nextStepButton}>
                        <Text style={styles.nextStepLabel}>
                            Next Step
                        </Text>
                        {(() => {
                            const currentChapter = isAndroid ? chapters_android[currentChapterIndex+1] : chapters[currentChapterIndex+1];
                            const title = currentChapter.title ? getLocalizedText(currentChapter.title) : '';
                            return title ? (
                                <Text style={styles.nextStepTitle} numberOfLines={1}>
                                    {title}
                                </Text>
                            ) : null;
                        })()}
                        <SkipNextIcon
                            width={27}
                            height={27}
                            fillColor="#FFFFFF"
                            strokeColor="#FFFFFF"
                            strokeWidth={0}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            
        </SafeAreaView>
        
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
    subtitleContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 24,
        justifyContent: 'center',
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
        fontSize: 16,
        color: '#57534d',
        lineHeight: 32,
        fontWeight: '600',
        textAlign: 'left',
    },
    controlsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    nextStepButton: {
        backgroundColor: '#57534d',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.35,
        shadowRadius: 3,
        elevation: 3,
    },
    nextStepLabel: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 24,
        color: '#FFFFFF',
        lineHeight: 32,
    },
    nextStepTitle: {
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Hiragino Kaku Gothic ProN' : 'Roboto',
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 15,
        textAlign: 'center',
        fontWeight: '600',
    },

});

export default IntroVideoScreen;