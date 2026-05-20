import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Animated,
    Text,
    Image,
    Platform,
    Dimensions,
    StatusBar,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';
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

/** Figma 準拠のアーチ装飾（viewBox 428×345） */
const ARCH_VIEWBOX = { w: 428, h: 345 };
const ARCH_PATH_D = 'M0 0H428V344.5C356.986 221.5 68.416 226 0 344.5V0Z';
const ARCH_FILL_COLOR = '#FF623F';
/** CloseIcon 28 + backButton padding 8×2 — タイトル中央揃え用の左右対称幅 */
const HEADER_BACK_BUTTON_WIDTH = 28 + 8 * 2;

const INTRO_VOICE_ILLUSTRATION = require('../../assets/introduction/02.webp');
const introVoiceIllustrationSource = Image.resolveAssetSource(INTRO_VOICE_ILLUSTRATION);
const INTRO_VOICE_ILLUSTRATION_ASPECT =
    introVoiceIllustrationSource.width / introVoiceIllustrationSource.height;
const INTRO_VOICE_BALLOON_TSUGI = require('../../assets/string-figures/0_introduction/balloon-tsugi.png');
const introVoiceBalloonSource = Image.resolveAssetSource(INTRO_VOICE_BALLOON_TSUGI);
const INTRO_VOICE_BALLOON_ASPECT =
    introVoiceBalloonSource.width / introVoiceBalloonSource.height;

const INTRO_VOICE_TEXT = {
    keyword: { ja: 'つぎ', en: 'next' },
    particle: { ja: 'と', en: '' },
    instruction: {
        ja: '話しかけてください',
        en: 'Please say "next"',
    },
} as const;

const BALLOON_FADE_IN_DURATION_MS = 500;
const BALLOON_VISIBLE_DURATION_MS = 4000;
const BALLOON_FADE_OUT_DURATION_MS = 500;
const BALLOON_HIDDEN_DURATION_MS = 1000;
const BALLOON_SCALE_MIN = 0.88;

const IntroVoiceScreen: React.FC<Props> = ({ navigation, route }) => {
    const { currentLanguage } = route.params;
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const isSmallScreen = Dimensions.get('window').height <= 667;

    const {
        recognizing,
        stop: stopRecognition,
        cleanup,
    } = useSpeechRecognition({
        language: currentLanguage,
        onKeywordDetected: async (keyword) => {
            if (keyword === 'つぎ' || keyword === 'next') {
                await handleNextScreen();
            }
        },
        onNetworkError: () => {
            setSnackbarVisible(true);
        },
    });

    const backButtonScale = useRef(new Animated.Value(1)).current;
    const balloonOpacity = useRef(new Animated.Value(0)).current;
    const balloonScale = useRef(new Animated.Value(BALLOON_SCALE_MIN)).current;

    useEffect(() => {
        activateKeepAwakeAsync();
        return () => {
            deactivateKeepAwake();
        };
    }, []);

    useEffect(() => {
        const balloonLoop = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(balloonOpacity, {
                        toValue: 1,
                        duration: BALLOON_FADE_IN_DURATION_MS,
                        useNativeDriver: true,
                    }),
                    Animated.timing(balloonScale, {
                        toValue: 1,
                        duration: BALLOON_FADE_IN_DURATION_MS,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(BALLOON_VISIBLE_DURATION_MS),
                Animated.parallel([
                    Animated.timing(balloonOpacity, {
                        toValue: 0,
                        duration: BALLOON_FADE_OUT_DURATION_MS,
                        useNativeDriver: true,
                    }),
                    Animated.timing(balloonScale, {
                        toValue: BALLOON_SCALE_MIN,
                        duration: BALLOON_FADE_OUT_DURATION_MS,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(BALLOON_HIDDEN_DURATION_MS),
            ]),
        );

        balloonLoop.start();
        return () => {
            balloonLoop.stop();
        };
    }, [balloonOpacity, balloonScale]);
    const { isTablet } = useDeviceInfo();
    const insets = useSafeAreaInsets();

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const headerPaddingTop =
        insets.top + (isTablet ? 16 : Platform.OS === 'android' ? 12 : 8);
    const archDisplayHeight = screenWidth * (ARCH_VIEWBOX.h / ARCH_VIEWBOX.w);
    const archTop = screenHeight / 2 - archDisplayHeight;
    const archTopFillHeight = Math.max(0, archTop);
    const headerContentHeight = isTablet ? 56 : 48;
    const headerTotalHeight = headerPaddingTop + headerContentHeight + 16;
    const INTRO_HERO_KEYWORD_LINE_HEIGHT = 72;
    const INTRO_HERO_INSTRUCTION_MARGIN_TOP = 8;
    const INTRO_HERO_INSTRUCTION_LINE_HEIGHT = 32;
    const introHeroTextBlockHeight =
        INTRO_HERO_KEYWORD_LINE_HEIGHT +
        INTRO_HERO_INSTRUCTION_MARGIN_TOP +
        INTRO_HERO_INSTRUCTION_LINE_HEIGHT;
    const introHeroTextBlockHalfHeight = introHeroTextBlockHeight / 2;
    /** 画面上半分の中央（25vh）にヒーロー文の中心を合わせる */
    const introHeroTop =
        screenHeight * 0.25 - headerTotalHeight - introHeroTextBlockHalfHeight;
    const scrollContentPaddingTop =
        Math.max(introHeroTop, 0) + introHeroTextBlockHeight + 8;
    const illustrationWidth = Math.min(screenWidth * 0.72, isTablet ? 360 : 300);
    const illustrationHeight = illustrationWidth / INTRO_VOICE_ILLUSTRATION_ASPECT;
    const illustrationBalloonWidth = illustrationWidth * 0.40;
    const illustrationBalloonHeight = illustrationBalloonWidth / INTRO_VOICE_BALLOON_ASPECT;
    const keywordFontSize = isTablet ? 72 : currentLanguage === 'ja' ? 64 : 56;
    const particleFontSize = isTablet ? 32 : 28;

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

    const handleNextScreen = async () => {
        if (recognizing) {
            await stopRecognition();
        }
        cleanup();
        await new Promise((resolve) => setTimeout(resolve, 300));
        navigation.navigate('IntroComplete');
    };

    const onGoBack = async () => {
        if (recognizing) {
            await stopRecognition();
        }
        cleanup();
        await new Promise((resolve) => setTimeout(resolve, 300));
        navigation.goBack();
    };

    const onSkip = async () => {
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

    const getLocalizedText = (textObj: { ja: string; en: string }) => {
        return textObj[currentLanguage];
    };

    const networkErrorMessage = getLocalizedText({
        ja: 'ネットワーク接続がありません。音声認識機能を使用できません。',
        en: 'No network connection. Speech recognition is unavailable.',
    });

    const keywordFontFamily =
        currentLanguage === 'en' ? 'Montserrat-SemiBold' : 'KiwiMaru-Medium';
    const instructionFontFamily =
        currentLanguage === 'en' ? 'Roboto-Medium' : 'KiwiMaru-Medium';

    return (
        <PaperProvider>
            <View style={styles.container}>
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                {archTopFillHeight > 0 && (
                    <View
                        pointerEvents="none"
                        style={[styles.archTopFill, { height: archTopFillHeight }]}
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
                                    { transform: [{ scale: backButtonScale }] },
                                ]}
                            >
                                <CloseIcon
                                    width={28}
                                    height={28}
                                    fillColor="#FFFFFF"
                                    strokeWidth={0}
                                    strokeColor="#FFFFFF"
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                        <Text
                            maxFontSizeMultiplier={1.35}
                            style={[
                                styles.title,
                                {
                                    fontSize: isTablet ? 22 : 18,
                                    fontFamily:
                                        currentLanguage === 'en'
                                            ? 'KronaOne-Regular'
                                            : 'LineSeed-Bold',
                                    color: '#FFFFFF',
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {getLocalizedText({ ja: 'はじめに', en: 'Introduction' })}
                        </Text>
                        <View
                            style={styles.headerSideSpacer}
                            pointerEvents="none"
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                        />
                    </View>

                    <View style={styles.mainContent}>
                        <View
                            style={[
                                styles.introHero,
                                { top: Math.max(introHeroTop, 0) },
                            ]}
                        >
                            <View style={styles.keywordRow}>
                                <Text
                                    maxFontSizeMultiplier={1.15}
                                    style={[
                                        styles.keywordText,
                                        {
                                            fontSize: keywordFontSize,
                                            fontFamily: keywordFontFamily,
                                        },
                                    ]}
                                >
                                    {getLocalizedText(INTRO_VOICE_TEXT.keyword)}
                                </Text>
                                {currentLanguage === 'ja' && (
                                    <Text
                                        maxFontSizeMultiplier={1.15}
                                        style={[
                                            styles.particleText,
                                            {
                                                fontSize: particleFontSize,
                                                fontFamily: keywordFontFamily,
                                            },
                                        ]}
                                    >
                                        {INTRO_VOICE_TEXT.particle.ja}
                                    </Text>
                                )}
                            </View>
                            <Text
                                maxFontSizeMultiplier={1.25}
                                style={[
                                    styles.instructionText,
                                    {
                                        fontSize: currentLanguage === 'ja' ? 22 : 20,
                                        fontFamily: instructionFontFamily,
                                    },
                                ]}
                            >
                                {getLocalizedText(INTRO_VOICE_TEXT.instruction)}
                            </Text>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={[
                                styles.scrollContent,
                                { paddingTop: scrollContentPaddingTop },
                            ]}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            <View style={styles.illustrationContainer}>
                                <View
                                    style={[
                                        styles.illustrationWrapper,
                                        {
                                            width: illustrationWidth,
                                            height: illustrationHeight,
                                        },
                                    ]}
                                >
                                    <Image
                                        source={INTRO_VOICE_ILLUSTRATION}
                                        style={{
                                            width: illustrationWidth,
                                            height: illustrationHeight,
                                        }}
                                        resizeMode="contain"
                                    />
                                    <Animated.Image
                                        source={INTRO_VOICE_BALLOON_TSUGI}
                                        style={[
                                            styles.illustrationBalloon,
                                            {
                                                width: illustrationBalloonWidth,
                                                height: illustrationBalloonHeight,
                                                opacity: balloonOpacity,
                                                transform: [{ scale: balloonScale }],
                                            },
                                        ]}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>

                            <View style={styles.voiceFallbackCard}>
                                <View style={styles.voiceFallbackHeader}>
                                    <View style={styles.voiceFallbackDivider} />
                                    <Text
                                        maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                        style={styles.voiceFallbackHeaderText}
                                    >
                                        {getLocalizedText({ ja: 'または', en: 'Or' })}
                                    </Text>
                                    <View style={styles.voiceFallbackDivider} />
                                </View>

                                <View style={styles.voiceFallbackDescription}>
                                    <Text
                                        maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                        style={styles.voiceFallbackDescriptionText}
                                    >
                                        {getLocalizedText({
                                            ja: 'あなたの声に反応しないですか？',
                                            en: 'Is your voice not responding?',
                                        })}
                                    </Text>
                                    <Text
                                        maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                        style={styles.voiceFallbackDescriptionText}
                                    >
                                        {getLocalizedText({
                                            ja: 'このアプリは音声認識無しでも楽しむことができます',
                                            en: 'This app can be enjoyed without voice recognition',
                                        })}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.voiceFallbackButton}
                                    onPress={onSkip}
                                >
                                    <Text
                                        maxFontSizeMultiplier={isSmallScreen ? 1.0 : 1.25}
                                        style={styles.voiceFallbackButtonText}
                                    >
                                        {getLocalizedText({
                                            ja: 'このまま次に進む',
                                            en: 'Skip to next',
                                        })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </View>
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
};

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
    headerSideSpacer: {
        width: HEADER_BACK_BUTTON_WIDTH,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    mainContent: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    introHero: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 1,
    },
    keywordRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    keywordText: {
        color: '#FFFFFF',
        lineHeight: 72,
        includeFontPadding: false,
    },
    particleText: {
        color: '#FFFFFF',
        marginLeft: 4,
        marginBottom: 10,
        lineHeight: 32,
        includeFontPadding: false,
    },
    instructionText: {
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 32,
        fontWeight: '600',
    },
    illustrationContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 36,
    },
    illustrationWrapper: {
        position: 'relative',
    },
    illustrationBalloon: {
        position: 'absolute',
        top: -30,
        right: -30,
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
        fontFamily: 'LineSeed-Bold',
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
        fontFamily: 'LineSeed-Bold',
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
        fontFamily: 'LineSeed-Bold',
        fontSize: 18,
        lineHeight: 32,
        color: '#292524',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});

export default IntroVoiceScreen;
