import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import ProgressDots from '../components/ProgressDots';

type IntroVideoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'IntroVideo'
>;
type IntroVideoScreenRouteProp = RouteProp<RootStackParamList, 'IntroVideo'>;

interface Props {
  navigation: IntroVideoScreenNavigationProp;
  route: IntroVideoScreenRouteProp;
}

const IntroVideoScreen: React.FC<Props> = ({ navigation, route }) => {
    const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');
    const videoRef = useRef<Video>(null);
    const [playbackRate, setPlaybackRate] = useState<number>(1.0);
    const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);

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
        navigation.goBack();
    };

    // 多言語対応のヘルパー関数
    const getLocalizedText = (textObj: { ja: string; en: string }) => {
        return textObj[currentLanguage];
    };

    const loadLanguageSetting = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('app_language');
            if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'en')) {
                setCurrentLanguage(savedLanguage);
            }
        } catch (error) {
            console.error('言語設定の読み込みに失敗しました:', error);
        }
    };

    // 動画の再生状況を監視
    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis || 0);
            setVideoDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
                // 動画が終了した場合
                console.log('Video finished');
            }
        }
    };
    // 動画がロードされた時の処理
    const handleVideoLoad = async () => {
        setPlaybackPosition(0); // 新しい動画読み込み時は進捗をリセット
        try {
            // 動画を最初の位置（0秒）にセットしてから再生
            await videoRef.current.setPositionAsync(0);
            await videoRef.current.playAsync();
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
                <Text style={[styles.title, { fontSize: isTablet ? 22 : 18 }]} numberOfLines={1}>
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
                    source={require('../../assets/string-figures/0_introduction/intro1.mp4')}
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
                    chapters={[
                        { subtitle: { ja: '操作方法', en: 'How to use' } },
                        { subtitle: { ja: 'あやとりを見る', en: 'Viewing String Figures' } },
                        { subtitle: { ja: 'コースについて', en: 'About Courses' } },
                    ]}
                    currentChapterIndex={currentChapterIndex}
                    getChapterProgress={getChapterProgress}
                />
                </View>

            </View>
        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8e6e0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderRadius: 20,
    },
    title: {
        fontFamily: 'KleeOne-SemiBold',
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
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

});

export default IntroVideoScreen;