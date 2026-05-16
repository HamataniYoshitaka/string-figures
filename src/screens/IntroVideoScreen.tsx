import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRightIcon, CloseIcon } from '../components/icons';
import ProgressDots from '../components/ProgressDots';
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
    { subtitle: { ja: '', en: '' } },
    { subtitle: { ja: '', en: '' } },
];

const IntroVideoScreen: React.FC<Props> = ({ navigation, route }) => {
    const { currentLanguage } = route.params;
    const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    const nextStepButtonScale = useRef(new Animated.Value(1)).current;
    
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

    const getChapterProgress = (chapterIndex: number) => {
        if (chapterIndex < currentChapterIndex) {
            return 1;
        }
        return 0;
    };

    const onNextChapter = async () => {
        if (currentChapterIndex === 0) {
            setCurrentChapterIndex(1);
        } else if (currentChapterIndex === 1) {
            try {
                const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

                if (!granted) {
                    navigation.replace('IntroError');
                    return;
                }

                console.log('マイクと音声認識の許可が付与されました');
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
                    <CloseIcon width={24} height={24} fillColor="#292524" />
                    </Animated.View>
                </TouchableWithoutFeedback>
                <Text 
                    maxFontSizeMultiplier={1.35}
                    style={[
                        styles.title, 
                        { 
                            fontSize: isTablet ? 22 : 18,
                            fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold'
                        }
                    ]} numberOfLines={1}
                >
                    {getLocalizedText({ja: 'はじめに', en: 'Introduction'})}
                </Text>
            </View>

            <View style={[
                styles.videoArea,
                !isTablet && { paddingHorizontal: 0 },
                (isTablet && isDeviceLandscape) && styles.videoAreaTabletLandscape
            ]}>
                <View style={styles.progressContainer}>
                    <ProgressDots 
                        chapters={chapters}
                        currentChapterIndex={currentChapterIndex}
                        getChapterProgress={getChapterProgress}
                    />
                </View>
            </View>

            <View style={styles.subtitleContainerWrapper}>
                <View style={styles.controlsContainer}>
                    <TouchableWithoutFeedback 
                        onPress={onNextChapter}
                        onPressIn={createPressInHandler(nextStepButtonScale)}
                        onPressOut={createPressOutHandler(nextStepButtonScale)}
                    >
                        <Animated.View 
                            style={[
                                styles.nextStepButton,
                                { transform: [{ scale: nextStepButtonScale }] }
                            ]}
                        >
                            <Text 
                                maxFontSizeMultiplier={1.25}
                                style={[
                                    styles.nextStepLabel,
                                    { fontSize: currentLanguage === 'ja' ? 24 : 22 }
                                ]}
                            >
                                Next Step
                            </Text>
                            <View style={styles.nextStepTitleContainer}>
                                <Text 
                                    maxFontSizeMultiplier={1.25}
                                    style={[
                                        styles.nextStepTitle,
                                        { fontSize: currentLanguage === 'ja' ? 15 : 14 }
                                    ]}
                                    numberOfLines={2}
                                >
                                    {getLocalizedText({ ja: '音声認識について', en: 'About voice recognition' })}
                                </Text>
                            </View>
                            <ChevronRightIcon
                                width={27}
                                height={27}
                                fillColor="#FFFFFF"
                                strokeColor="#FFFFFF"
                                strokeWidth={0}
                            />
                        </Animated.View>
                    </TouchableWithoutFeedback>
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
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    videoArea: {
        paddingHorizontal: 16,
    },
    videoAreaTabletLandscape: {
        paddingTop: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 340,
    },
    progressContainer: {
        marginTop: 16,
        paddingLeft: 16,
    },
    subtitleContainerWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
        maxWidth: 500,
        marginHorizontal: 'auto',
    },
    controlsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    nextStepButton: {
        backgroundColor: '#57534d',
        borderRadius: 12,
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.35,
        shadowRadius: 3,
        elevation: 3,
        gap: 4
    },
    nextStepLabel: {
        fontFamily: 'Montserrat-SemiBold',
        color: '#FFFFFF',
        lineHeight: 32,
    },
    nextStepTitleContainer: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
    },
    nextStepTitle: {
        fontFamily: Platform.OS === 'ios' ? 'Hiragino Kaku Gothic ProN' : 'Roboto',
        color: '#FFFFFF',
        lineHeight: 16,
        textAlign: 'center',
        fontWeight: '600',
    },

});

export default IntroVideoScreen;
