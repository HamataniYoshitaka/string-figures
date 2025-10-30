import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, PlayIcon } from '../components/icons';

type IntroCompleteScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'IntroComplete'
>;
type IntroCompleteScreenRouteProp = RouteProp<RootStackParamList, 'IntroComplete'>;

interface Props {
  navigation: IntroCompleteScreenNavigationProp;
  route: IntroCompleteScreenRouteProp;
}



const IntroVideoScreen: React.FC<Props> = ({ navigation, route }) => {
    const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');

    // アプリ起動時に保存された言語設定を読み込む
    useEffect(() => {
        loadLanguageSetting();
        setCompleted();
    }, []);

    const setCompleted = async () => {
        try {
            await AsyncStorage.setItem('introduction_completed', 'true');
        } catch (error) {
            console.error('イントロ完了状態の保存に失敗しました:', error);
        }
    }
    
    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    const startButtonScale = useRef(new Animated.Value(1)).current;
    
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
        console.log('onGoBack to HomeScreen');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
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
                    <CloseIcon width={24} height={24} fillColor="#222" />
                    </Animated.View>
                </TouchableWithoutFeedback>
                <Text style={[styles.title, { fontSize: isTablet ? 22 : 18 }]} numberOfLines={1}>
                    {getLocalizedText({ja: 'はじめに', en: 'Introduction'})}
                </Text>
            </View>

            

            {/* 字幕エリア */}
            {!isDeviceLandscape && (
                <View style={styles.subtitleContainer}>
                    <Text style={styles.titleText}>
                        {getLocalizedText({ ja: '準備が完了しました！', en: 'Preparation is complete!' })}
                    </Text>

                    <Text style={styles.subtitleText}>
                        {getLocalizedText({ ja: '世界中に伝承されている\n「あやとり」をお楽しみ下さい!', en: 'Enjoy the string figures that have been passed down through generations around the world!' })}
                    </Text>
                </View>
            )}

            {/* コントロールボタンエリア */}
            <View style={styles.controlsContainer}>
                <View style={styles.controlButton}>
                    <View style={styles.buttonContainer}>
                        <TouchableWithoutFeedback
                            onPress={onGoBack}
                            onPressIn={createPressInHandler(startButtonScale)}
                            onPressOut={createPressOutHandler(startButtonScale)}
                        >
                            <Animated.View
                                style={[
                                    styles.startButton,
                                    { transform: [{ scale: startButtonScale }] },
                                ]}
                            >
                                <Text style={styles.startButtonText}>
                                    {getLocalizedText({ ja: 'はじめる', en: 'Start' })}
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>
            
        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFB86A',
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
        flex: 1,
        paddingHorizontal: 0,
        paddingVertical: 6,
        justifyContent: 'center',
        gap: 20
    },
    titleText: {
        fontFamily: 'KleeOne-Regular',
        fontSize: 32,
        color: '#333',
        textAlign: 'center',
        // lineHeight: 24,
        fontWeight: '600',
    },
    subtitleText: {
        fontFamily: 'KleeOne-Regular',
        fontSize: 20,
        color: '#333',
        textAlign: 'center',
        lineHeight: 32,
        fontWeight: '500',
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
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    startButton: {
        backgroundColor: '#FF6A00',
        borderRadius: 9999,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignSelf: 'stretch',
    },
    startButtonText: {
        fontWeight: '600',
        fontSize: 20,
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 1,
    },
    floatingButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e8e6e0',
        borderWidth: 2,
        borderColor: '#57534D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
});

export default IntroVideoScreen;