import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Image, Platform, Dimensions, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { ChevronRightIcon, CloseIcon } from '../components/icons';
import ProgressDots from '../components/ProgressDots';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

const INTRO_HERO_TEXT = {
    line1: {
        ja: '世界中のあやとり',
        en: 'String figures from around the world',
    },
    line2: {
        ja: 'を紹介します',
        en: '— introduced here',
    },
} as const;

type IntroVideoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'IntroVideo'
>;
type IntroVideoScreenRouteProp = RouteProp<RootStackParamList, 'IntroVideo'>;

interface Props {
  navigation: IntroVideoScreenNavigationProp;
  route: IntroVideoScreenRouteProp;
}

/** Figma 準拠のアーチ装飾（viewBox 428×345） */
const ARCH_VIEWBOX = { w: 428, h: 345 };
const ARCH_PATH_D =
  'M0 0H428V344.5C356.986 221.5 68.416 226 0 344.5V0Z';
const ARCH_FILL_COLOR = '#FF623F';
const INTRO_ILLUSTRATION = require('../../assets/introduction/01.png');
const introIllustrationSource = Image.resolveAssetSource(INTRO_ILLUSTRATION);
const INTRO_ILLUSTRATION_ASPECT =
    introIllustrationSource.width / introIllustrationSource.height;

const chapters = [
    { subtitle: { ja: '', en: '' } },
    { subtitle: { ja: '', en: '' } },
];

const IntroVideoScreen: React.FC<Props> = ({ navigation, route }) => {
    const { currentLanguage } = route.params;
    const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
    const pagerRef = useRef<PagerView>(null);

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    const nextStepButtonScale = useRef(new Animated.Value(1)).current;
    
    const { isTablet } = useDeviceInfo();
    const insets = useSafeAreaInsets();

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const headerPaddingTop =
        insets.top + (isTablet ? 16 : Platform.OS === 'android' ? 12 : 8);
    const archDisplayHeight = screenWidth * (ARCH_VIEWBOX.h / ARCH_VIEWBOX.w);
    /** アーチ下端（viewBox 底辺）を画面垂直中央に合わせる */
    const archTop = screenHeight / 2 - archDisplayHeight;
    /** SVG 上端より上だけ埋める（画面半分だとアーチ曲線が同色で見えなくなる） */
    const archTopFillHeight = Math.max(0, archTop);
    const headerContentHeight = isTablet ? 56 : 48;
    const introHeroHeight =
        screenHeight / 2 - headerPaddingTop - headerContentHeight;
    const illustrationWidth = Math.min(screenWidth * 0.58, isTablet ? 360 : 280);
    const illustrationHeight = illustrationWidth / INTRO_ILLUSTRATION_ASPECT;
    
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

    const handlePageSelected = (position: number) => {
        setCurrentChapterIndex(position);
    };

    const onNextChapter = async () => {
        if (currentChapterIndex === 0) {
            pagerRef.current?.setPage(1);
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
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            {archTopFillHeight > 0 && (
                <View
                    pointerEvents="none"
                    style={[
                        styles.archTopFill,
                        { height: archTopFillHeight },
                    ]}
                />
            )}
            <Svg
                width={screenWidth}
                height={archDisplayHeight}
                viewBox={`0 0 ${ARCH_VIEWBOX.w} ${ARCH_VIEWBOX.h}`}
                preserveAspectRatio="xMidYMin meet"
                pointerEvents="none"
                style={[
                    styles.archSvg,
                    {
                        width: screenWidth,
                        height: archDisplayHeight,
                        top: archTop,
                    },
                ]}
            >
                <Path d={ARCH_PATH_D} fill={ARCH_FILL_COLOR} />
            </Svg>

            <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
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
                    <CloseIcon width={28} height={28} fillColor="#FFFFFF" strokeWidth={0} strokeColor="#FFFFFF" />
                    </Animated.View>
                </TouchableWithoutFeedback>
                <Text 
                    maxFontSizeMultiplier={1.35}
                    style={[
                        styles.title, 
                        { 
                            fontSize: isTablet ? 22 : 18,
                            fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold',
                            color: '#FFFFFF',
                        }
                    ]} numberOfLines={1}
                >
                    {getLocalizedText({ja: 'はじめに', en: 'Introduction'})}
                </Text>
            </View>

            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                scrollEnabled
                overdrag={false}
                onPageSelected={(event) => handlePageSelected(event.nativeEvent.position)}
            >
                <View key="intro-page-1" style={styles.pagerPage} collapsable={false}>
                    <View
                        style={[
                            styles.introHero,
                            { height: Math.max(introHeroHeight, 0) },
                        ]}
                    >
                        <Text
                            maxFontSizeMultiplier={1.25}
                            style={[
                                styles.introHeroLine,
                                {
                                    fontSize: currentLanguage === 'ja' ? 24 : 22,
                                    fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold',
                                },
                            ]}
                        >
                            {getLocalizedText(INTRO_HERO_TEXT.line1)}
                        </Text>
                        <Text
                            maxFontSizeMultiplier={1.25}
                            style={[
                                styles.introHeroLine,
                                styles.introHeroLineSecond,
                                {
                                    fontSize: currentLanguage === 'ja' ? 24 : 22,
                                    fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'LineSeed-Bold',
                                },
                            ]}
                        >
                            {getLocalizedText(INTRO_HERO_TEXT.line2)}
                        </Text>
                    </View>

                    <View style={styles.illustrationContainer}>
                        <Image
                            source={INTRO_ILLUSTRATION}
                            style={[
                                styles.illustrationImage,
                                {
                                    width: illustrationWidth,
                                    height: illustrationHeight,
                                },
                            ]}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <View key="intro-page-2" style={styles.pagerPage} collapsable={false} />
            </PagerView>

            <View style={styles.bottomChrome}>
                <View style={styles.progressContainer}>
                    <ProgressDots
                        chapters={chapters}
                        currentChapterIndex={currentChapterIndex}
                        getChapterProgress={getChapterProgress}
                    />
                </View>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F5F2',
    },
    safeArea: {
        flex: 1,
        zIndex: 1,
        backgroundColor: 'transparent',
    },
    archTopFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: ARCH_FILL_COLOR,
        zIndex: 0,
        elevation: 0,
    },
    archSvg: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 1,
        elevation: 1,
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
    introHero: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    introHeroLine: {
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 34,
        fontWeight: '600',
    },
    introHeroLineSecond: {
        marginTop: 4,
    },
    pagerView: {
        flex: 1,
    },
    pagerPage: {
        flex: 1,
    },
    bottomChrome: {
        maxWidth: 500,
        width: '100%',
        marginHorizontal: 'auto',
    },
    progressContainer: {
        marginTop: 16,
        paddingLeft: 16,
    },
    illustrationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    illustrationImage: {
        backgroundColor: 'transparent',
        mixBlendMode: 'multiply',
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
