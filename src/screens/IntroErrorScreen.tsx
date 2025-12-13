import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Image, Linking, Pressable, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

type IntroErrorScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'IntroError'
>;
type IntroErrorScreenRouteProp = RouteProp<RootStackParamList, 'IntroError'>;

interface Props {
  navigation: IntroErrorScreenNavigationProp;
  route: IntroErrorScreenRouteProp;
}


const IntroErrorScreen: React.FC<Props> = ({ navigation, route }) => {
    const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');
    const isAndroid = Platform.OS === 'android';
    const videoRef = useRef<Video>(null);

    const setCompleted = async () => {
        try {
            await AsyncStorage.setItem('introduction_completed', 'true');
        } catch (error) {
            console.error('イントロ完了状態の保存に失敗しました:', error);
        }
    }
    
    // アプリ起動時に保存された言語設定を読み込む
    useEffect(() => {

        loadLanguageSetting();
    
        // 画面スリープを防止
        activateKeepAwakeAsync();
        setCompleted();

        // クリーンアップ
        return () => {
          // 画面スリープ防止を解除
          deactivateKeepAwake();
        };
    }, []);

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
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const onOpenSettings = async () => {
        try {
            await Linking.openSettings();
        } catch (e) {
            console.error('設定アプリを開けませんでした:', e);
        }
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

    // 動画がロードされた時の処理
    const handleVideoLoad = async () => {
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
                <Text 
                    maxFontSizeMultiplier={1.35}
                    style={[styles.title, { fontSize: isTablet ? 22 : 18, fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }]} numberOfLines={1}>
                    {getLocalizedText({ja: 'はじめに', en: 'Introduction'})}
                </Text>
            </View>

            {/* 画像エリア */}
            <View style={styles.imageContainer}>
                <View style={styles.imageWrapper}>
                    {isAndroid ? (
                        <Video
                            key={`intro-error`}
                            ref={videoRef}
                            source={currentLanguage === 'ja' ? require('../../assets/introduction/android-settings-ja.mp4') : require('../../assets/introduction/android-settings-en.mp4')}
                            style={styles.video}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={true}
                            isLooping={true}
                            isMuted={true}
                            useNativeControls={false}
                            onLoad={handleVideoLoad}
                        />
                    ) : (
                    <Image
                        source={currentLanguage === 'ja' ? require('../../assets/introduction/setting-ja.webp') : require('../../assets/introduction/setting-en.jpg')}
                        style={[
                            styles.errorImage
                        ]}
                        resizeMode="contain"
                    />
                    )}
                </View>
            </View>

            {/* 字幕エリア */}
            <View style={styles.subtitleContainer}>
                <Text 
                    maxFontSizeMultiplier={1.25}
                    style={styles.subtitleText}
                >
                    {getLocalizedText({ ja: '音声認識とマイクが使用できませんでした。\nこのままでもアプリをお楽しみいただけますが、\n「設定」アプリからアクセスを許可することをおすすめめします。', en: 'Voice recognition and microphone are not available. You can still enjoy the app, but we recommend allowing access from the "Settings" app.' })}
                </Text>
                <Text 
                    maxFontSizeMultiplier={1.25}
                    style={[styles.subtitleText, { marginTop: 12, fontSize: 14 }]}
                >
                    {getLocalizedText({ ja: '（音声の保存・収集は一切行なっておりません）', en: '(We do not record or collect any voice data.)' })}
                </Text>
            </View>

            {/* ボタンエリア */}
            <View style={styles.controlsContainer}>
                <View style={styles.controlButton}>
                    <Pressable
                        onPress={onOpenSettings}
                        style={({ pressed }) => [
                            styles.outlinedButton,
                            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                        ]}
                    >
                        <Text 
                            maxFontSizeMultiplier={1.25}
                            style={styles.outlinedButtonText}
                        >
                            {getLocalizedText({ ja: '設定アプリを開く', en: 'Open Settings' })}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={onGoBack}
                        style={({ pressed }) => [styles.textButton, pressed && { opacity: 0.6 }]}
                    >
                        <Text 
                            maxFontSizeMultiplier={1.25}
                            style={styles.textButtonLabel}
                        >
                            {getLocalizedText({ ja: 'このままはじめる', en: 'Start anyway' })}
                        </Text>
                    </Pressable>
                </View>
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
        fontFamily: 'KleeOne-SemiBold',
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginHorizontal: 16,
    },

    subtitleContainer: {
        flex: 2,
        paddingHorizontal: 24,
        paddingVertical: 6,
        justifyContent: 'center',
    },
    subtitleText: {
        fontFamily: 'KleeOne-Regular',
        fontSize: 16,
        color: '#222',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    controlsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        flex: 2,
        justifyContent: 'center',
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
    outlinedButton: {
        width: '80%',
        maxWidth: 360,
        borderWidth: 2,
        borderColor: '#57534D',
        borderRadius: 28,
        backgroundColor: '#F7F5F2',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlinedButtonText: {
        // fontFamily: 'KleeOne-SemiBold',
        fontWeight: '600',
        fontSize: 18,
        color: '#57534D',
    },
    textButton: {
        marginTop: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    textButtonLabel: {
        // fontFamily: 'KleeOne-SemiBold',
        fontWeight: '600',
        fontSize: 18,
        color: '#57534D',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 0,
    },
    imageWrapper: {
        width: '100%',
        maxWidth: 400,
        aspectRatio: 16 / 9,
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    errorImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 16 / 9,
    },
    video: {
        width: '100%',
        height: undefined,
        aspectRatio: 16 / 9,
    },

});

export default IntroErrorScreen;