import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Image, Platform, Dimensions, StatusBar, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Video } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon, CloseIcon } from '../components/icons';
import ProgressDots from '../components/ProgressDots';
import IntroVideoPage2 from './IntroVideoPage2';

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
const NEXT_STEP_BUTTON_COLOR = '#FF623F';
const NEXT_STEP_BUTTON_SHADOW_OFFSET = 4;
/** CloseIcon 28 + backButton padding 8×2 — タイトル中央揃え用の左右対称幅 */
const HEADER_BACK_BUTTON_WIDTH = 28 + 8 * 2;
const INTRO_ILLUSTRATION = require('../../assets/introduction/01.webp');
const introIllustrationSource = Image.resolveAssetSource(INTRO_ILLUSTRATION);
const INTRO_ILLUSTRATION_ASPECT =
    introIllustrationSource.width / introIllustrationSource.height;

const chapters = [
    { subtitle: { ja: '', en: '' } },
    { subtitle: { ja: '', en: '' } },
];

const AUTO_SCROLL_TO_P2_DELAY_MS = 4000;
const AUTO_SCROLL_TO_P2_DURATION_MS = 600;
const NEXT_STEP_BUTTON_REVEAL_DELAY_MS = 9000;
const PAGE_INDEX_P2 = 1;

const easeInOut = (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const INTRO_HERO_FADE_IN_DELAY_MS = 600;
const INTRO_ILLUSTRATION_FADE_IN_DELAY_MS = 1000;
const INTRO_FADE_IN_DURATION_MS = 500;
const INTRO_FADE_IN_TRANSLATE_Y = 16;
const INTRO_PAGE2_TEXT_FADE_IN_DELAY_MS = 300;
const INTRO_PAGE2_PHONE_FADE_IN_DELAY_MS = 900;

const IntroVideoScreen: React.FC<Props> = ({ navigation, route }) => {
    const { currentLanguage } = route.params;
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isNextStepButtonVisible, setIsNextStepButtonVisible] = useState(false);
    const [page1Progress, setPage1Progress] = useState(0);
    const [page2Progress, setPage2Progress] = useState(0);

    const pagerScrollRef = useRef<ScrollView>(null);
    const autoScrollRafRef = useRef<number | null>(null);
    const isAutoScrollingRef = useRef(false);
    const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const buttonRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasStartedButtonRevealTimerRef = useRef(false);
    const hasStartedPage2ProgressRef = useRef(false);
    const page1ProgressRafRef = useRef<number | null>(null);
    const page2ProgressRafRef = useRef<number | null>(null);
    const page1ProgressStartMsRef = useRef<number | null>(null);
    const page2ProgressStartMsRef = useRef<number | null>(null);

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    const nextStepButtonPressAnim = useRef(new Animated.Value(0)).current;
    const introHeroOpacity = useRef(new Animated.Value(0)).current;
    const introHeroTranslateY = useRef(new Animated.Value(INTRO_FADE_IN_TRANSLATE_Y)).current;
    const illustrationOpacity = useRef(new Animated.Value(0)).current;
    const illustrationTranslateY = useRef(new Animated.Value(INTRO_FADE_IN_TRANSLATE_Y)).current;
    const page2TextOpacity = useRef(new Animated.Value(0)).current;
    const page2TextTranslateY = useRef(new Animated.Value(INTRO_FADE_IN_TRANSLATE_Y)).current;
    const page2PhoneOpacity = useRef(new Animated.Value(0)).current;
    const page2PhoneTranslateY = useRef(new Animated.Value(INTRO_FADE_IN_TRANSLATE_Y)).current;
    const nextStepButtonOpacity = useRef(new Animated.Value(0)).current;
    const nextStepButtonFadeTranslateY = useRef(new Animated.Value(INTRO_FADE_IN_TRANSLATE_Y)).current;
    const hasPlayedPage2EntranceAnimRef = useRef(false);
    const page2TextFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const page2PhoneFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const introPhoneVideoRef = useRef<Video>(null);
    const [nextStepButtonLayout, setNextStepButtonLayout] = useState({ width: 0, height: 0 });
    
    const { isTablet } = useDeviceInfo();
    const insets = useSafeAreaInsets();

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const pagerWidthRef = useRef(screenWidth);
    const [pagerWidth, setPagerWidth] = useState(screenWidth);
    const [isPagerAutoScrolling, setIsPagerAutoScrolling] = useState(false);
    const headerPaddingTop =
        insets.top + (isTablet ? 16 : Platform.OS === 'android' ? 12 : 8);
    const archDisplayHeight = screenWidth * (ARCH_VIEWBOX.h / ARCH_VIEWBOX.w);
    /** アーチ下端（viewBox 底辺）を画面垂直中央に合わせる */
    const archTop = screenHeight / 2 - archDisplayHeight;
    /** SVG 上端より上だけ埋める（画面半分だとアーチ曲線が同色で見えなくなる） */
    const archTopFillHeight = Math.max(0, archTop);
    const headerContentHeight = isTablet ? 56 : 48;
    const headerTotalHeight = headerPaddingTop + headerContentHeight + 16;
    const INTRO_HERO_LINE_HEIGHT = 34;
    const INTRO_HERO_LINE_GAP = 4;
    const introHeroTextBlockHalfHeight =
        (INTRO_HERO_LINE_HEIGHT * 2 + INTRO_HERO_LINE_GAP) / 2;
    /** 画面上半分の中央（25vh）にヒーロー文の中心を合わせる */
    const introHeroTop =
        screenHeight * 0.25 - headerTotalHeight - introHeroTextBlockHalfHeight;
    const bottomChromeEstimate = 152;
    const bottomChromeTotalHeight = bottomChromeEstimate + insets.bottom;
    const illustrationWidth = Math.min(screenWidth * 0.68, isTablet ? 360 : 280);
    const illustrationHeight = illustrationWidth / INTRO_ILLUSTRATION_ASPECT;
    /** ProgressDots・ボタンを除いた画面下半分の中央（75vh − bottomChrome/2）にイラスト中心を合わせる */
    const illustrationCenterY =
        screenHeight * 0.75 - bottomChromeTotalHeight / 2;
    const illustrationTop =
        illustrationCenterY - headerTotalHeight - illustrationHeight / 2;

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

    const handleNextStepPressIn = () => {
        Animated.spring(nextStepButtonPressAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
        }).start();
    };

    const handleNextStepPressOut = () => {
        Animated.spring(nextStepButtonPressAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
        }).start();
    };

    const nextStepPressTranslate = nextStepButtonPressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, NEXT_STEP_BUTTON_SHADOW_OFFSET],
    });

    const onGoBack = async () => {
        console.log('onGoBack');
        navigation.goBack();
    };

    // 多言語対応のヘルパー関数
    const getLocalizedText = (textObj: { ja: string; en: string }) => {
        return textObj[currentLanguage];
    };

    const getChapterProgress = (chapterIndex: number) => {
        if (chapterIndex === 0) {
            return page1Progress;
        }
        if (chapterIndex === 1) {
            return page2Progress;
        }
        return 0;
    };

    const stopPage1ProgressAnimation = () => {
        if (page1ProgressRafRef.current !== null) {
            cancelAnimationFrame(page1ProgressRafRef.current);
            page1ProgressRafRef.current = null;
        }
    };

    const stopPage2ProgressAnimation = () => {
        if (page2ProgressRafRef.current !== null) {
            cancelAnimationFrame(page2ProgressRafRef.current);
            page2ProgressRafRef.current = null;
        }
    };

    const completePage1Progress = () => {
        stopPage1ProgressAnimation();
        setPage1Progress(1);
    };

    const startPage1ProgressAnimation = () => {
        page1ProgressStartMsRef.current = Date.now();
        const tick = () => {
            const startMs = page1ProgressStartMsRef.current ?? Date.now();
            const elapsed = Date.now() - startMs;
            const progress = Math.min(elapsed / AUTO_SCROLL_TO_P2_DELAY_MS, 1);
            setPage1Progress(progress);
            if (progress < 1) {
                page1ProgressRafRef.current = requestAnimationFrame(tick);
            } else {
                page1ProgressRafRef.current = null;
            }
        };
        page1ProgressRafRef.current = requestAnimationFrame(tick);
    };

    const startPage2ProgressAnimation = () => {
        if (hasStartedPage2ProgressRef.current) {
            return;
        }
        hasStartedPage2ProgressRef.current = true;
        page2ProgressStartMsRef.current = Date.now();
        const tick = () => {
            const startMs = page2ProgressStartMsRef.current ?? Date.now();
            const elapsed = Date.now() - startMs;
            const progress = Math.min(elapsed / NEXT_STEP_BUTTON_REVEAL_DELAY_MS, 1);
            setPage2Progress(progress);
            if (progress < 1) {
                page2ProgressRafRef.current = requestAnimationFrame(tick);
            } else {
                page2ProgressRafRef.current = null;
            }
        };
        page2ProgressRafRef.current = requestAnimationFrame(tick);
    };

    const stopAutoScrollAnimation = () => {
        if (autoScrollRafRef.current !== null) {
            cancelAnimationFrame(autoScrollRafRef.current);
            autoScrollRafRef.current = null;
        }
        isAutoScrollingRef.current = false;
        setIsPagerAutoScrolling(false);
    };

    const clearAutoScrollTimer = () => {
        if (autoScrollTimerRef.current) {
            clearTimeout(autoScrollTimerRef.current);
            autoScrollTimerRef.current = null;
        }
    };

    const autoScrollToP2 = () => {
        const pageWidth = pagerWidthRef.current;
        if (pageWidth <= 0) {
            return;
        }

        stopAutoScrollAnimation();
        isAutoScrollingRef.current = true;
        setIsPagerAutoScrolling(true);
        const startMs = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startMs;
            const linearProgress = Math.min(elapsed / AUTO_SCROLL_TO_P2_DURATION_MS, 1);
            const easedProgress = easeInOut(linearProgress);
            pagerScrollRef.current?.scrollTo({
                x: pageWidth * easedProgress,
                animated: false,
            });

            if (linearProgress < 1) {
                autoScrollRafRef.current = requestAnimationFrame(tick);
                return;
            }

            autoScrollRafRef.current = null;
            isAutoScrollingRef.current = false;
            setIsPagerAutoScrolling(false);
            handlePageSelected(PAGE_INDEX_P2);
        };

        autoScrollRafRef.current = requestAnimationFrame(tick);
    };

    const handlePagerScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (isAutoScrollingRef.current) {
            return;
        }

        const pageWidth = pagerWidthRef.current;
        if (pageWidth <= 0) {
            return;
        }

        const position = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
        handlePageSelected(position);
    };

    const revealNextStepButton = () => {
        setIsNextStepButtonVisible(true);
        Animated.parallel([
            Animated.timing(nextStepButtonOpacity, {
                toValue: 1,
                duration: INTRO_FADE_IN_DURATION_MS,
                useNativeDriver: true,
            }),
            Animated.timing(nextStepButtonFadeTranslateY, {
                toValue: 0,
                duration: INTRO_FADE_IN_DURATION_MS,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const startButtonRevealTimer = () => {
        if (hasStartedButtonRevealTimerRef.current) {
            return;
        }
        hasStartedButtonRevealTimerRef.current = true;
        buttonRevealTimerRef.current = setTimeout(() => {
            buttonRevealTimerRef.current = null;
            revealNextStepButton();
        }, NEXT_STEP_BUTTON_REVEAL_DELAY_MS);
    };

    const clearPage2EntranceTimers = () => {
        if (page2TextFadeTimerRef.current) {
            clearTimeout(page2TextFadeTimerRef.current);
            page2TextFadeTimerRef.current = null;
        }
        if (page2PhoneFadeTimerRef.current) {
            clearTimeout(page2PhoneFadeTimerRef.current);
            page2PhoneFadeTimerRef.current = null;
        }
    };

    const startPage2EntranceAnimations = () => {
        if (hasPlayedPage2EntranceAnimRef.current) {
            return;
        }
        hasPlayedPage2EntranceAnimRef.current = true;

        page2TextOpacity.setValue(0);
        page2TextTranslateY.setValue(INTRO_FADE_IN_TRANSLATE_Y);
        page2PhoneOpacity.setValue(0);
        page2PhoneTranslateY.setValue(INTRO_FADE_IN_TRANSLATE_Y);

        page2TextFadeTimerRef.current = setTimeout(() => {
            page2TextFadeTimerRef.current = null;
            Animated.parallel([
                Animated.timing(page2TextOpacity, {
                    toValue: 1,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
                Animated.timing(page2TextTranslateY, {
                    toValue: 0,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
            ]).start();
        }, INTRO_PAGE2_TEXT_FADE_IN_DELAY_MS);

        page2PhoneFadeTimerRef.current = setTimeout(() => {
            page2PhoneFadeTimerRef.current = null;
            Animated.parallel([
                Animated.timing(page2PhoneOpacity, {
                    toValue: 1,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
                Animated.timing(page2PhoneTranslateY, {
                    toValue: 0,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
            ]).start();
        }, INTRO_PAGE2_PHONE_FADE_IN_DELAY_MS);
    };

    useEffect(() => {
        const heroFadeInTimer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(introHeroOpacity, {
                    toValue: 1,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
                Animated.timing(introHeroTranslateY, {
                    toValue: 0,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
            ]).start();
        }, INTRO_HERO_FADE_IN_DELAY_MS);

        return () => clearTimeout(heroFadeInTimer);
    }, [introHeroOpacity, introHeroTranslateY]);

    useEffect(() => {
        const illustrationFadeInTimer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(illustrationOpacity, {
                    toValue: 1,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
                Animated.timing(illustrationTranslateY, {
                    toValue: 0,
                    duration: INTRO_FADE_IN_DURATION_MS,
                    useNativeDriver: true,
                }),
            ]).start();
        }, INTRO_ILLUSTRATION_FADE_IN_DELAY_MS);

        return () => clearTimeout(illustrationFadeInTimer);
    }, [illustrationOpacity, illustrationTranslateY]);

    useEffect(() => {
        startPage1ProgressAnimation();
        autoScrollTimerRef.current = setTimeout(() => {
            autoScrollTimerRef.current = null;
            autoScrollToP2();
        }, AUTO_SCROLL_TO_P2_DELAY_MS);

        return () => {
            clearAutoScrollTimer();
            stopAutoScrollAnimation();
            stopPage1ProgressAnimation();
            stopPage2ProgressAnimation();
            clearPage2EntranceTimers();
            if (buttonRevealTimerRef.current) {
                clearTimeout(buttonRevealTimerRef.current);
            }
        };
    }, []);

    const pauseIntroPhoneVideo = useCallback(async () => {
        const video = introPhoneVideoRef.current;
        if (!video) {
            return;
        }
        try {
            await video.pauseAsync();
            await video.setPositionAsync(0);
        } catch (error) {
            console.error('Error pausing intro phone video:', error);
        }
    }, []);

    const playIntroPhoneVideo = useCallback(async () => {
        const video = introPhoneVideoRef.current;
        if (!video) {
            return;
        }
        try {
            await video.setPositionAsync(0);
            await video.playAsync();
        } catch (error) {
            console.error('Error playing intro phone video:', error);
        }
    }, []);

    const handleIntroPhoneVideoLoad = useCallback(async () => {
        if (currentPageIndex === PAGE_INDEX_P2) {
            await playIntroPhoneVideo();
            return;
        }
        await pauseIntroPhoneVideo();
    }, [currentPageIndex, pauseIntroPhoneVideo, playIntroPhoneVideo]);

    useEffect(() => {
        if (currentPageIndex === PAGE_INDEX_P2) {
            void playIntroPhoneVideo();
            return;
        }
        void pauseIntroPhoneVideo();
    }, [currentPageIndex, pauseIntroPhoneVideo, playIntroPhoneVideo]);

    useEffect(() => {
        return () => {
            void pauseIntroPhoneVideo();
        };
    }, [pauseIntroPhoneVideo]);

    const handlePageSelected = (position: number) => {
        setCurrentPageIndex(position);

        if (position === PAGE_INDEX_P2) {
            completePage1Progress();
            clearAutoScrollTimer();
            startButtonRevealTimer();
            startPage2ProgressAnimation();
            startPage2EntranceAnimations();
        }
    };

    const onNextChapter = () => {
        navigation.navigate('IntroPermission', { currentLanguage });
    };

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
                <View
                    style={styles.headerSideSpacer}
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                />
            </View>

            <ScrollView
                ref={pagerScrollRef}
                horizontal
                pagingEnabled
                bounces={false}
                scrollEnabled={!isPagerAutoScrolling}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                style={styles.pagerView}
                onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    if (width > 0 && width !== pagerWidthRef.current) {
                        pagerWidthRef.current = width;
                        setPagerWidth(width);
                    }
                }}
                onMomentumScrollEnd={handlePagerScrollEnd}
            >
                <View
                    key="intro-page-1"
                    style={[styles.pagerPage, { width: pagerWidth }]}
                    collapsable={false}
                >
                    <Animated.View
                        style={[
                            styles.introHero,
                            { top: Math.max(introHeroTop, 0) },
                            {
                                opacity: introHeroOpacity,
                                transform: [{ translateY: introHeroTranslateY }],
                            },
                        ]}
                    >
                        <Text
                            maxFontSizeMultiplier={1.25}
                            style={[
                                styles.introHeroLine,
                                {
                                    fontSize: currentLanguage === 'ja' ? 24 : 22,
                                    fontFamily: currentLanguage === 'en' ? 'LineSeed-Regular' : 'KiwiMaru-Medium',
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
                                    fontFamily: currentLanguage === 'en' ? 'LineSeed-Regular' : 'KiwiMaru-Medium',
                                },
                            ]}
                        >
                            {getLocalizedText(INTRO_HERO_TEXT.line2)}
                        </Text>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.illustrationContainer,
                            { top: Math.max(illustrationTop, 0) },
                            {
                                opacity: illustrationOpacity,
                                transform: [{ translateY: illustrationTranslateY }],
                            },
                        ]}
                    >
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
                    </Animated.View>
                </View>

                <IntroVideoPage2
                    pagerWidth={pagerWidth}
                    currentLanguage={currentLanguage}
                    page2TextOpacity={page2TextOpacity}
                    page2TextTranslateY={page2TextTranslateY}
                    page2PhoneOpacity={page2PhoneOpacity}
                    page2PhoneTranslateY={page2PhoneTranslateY}
                    introPhoneVideoRef={introPhoneVideoRef}
                    onIntroPhoneVideoLoad={handleIntroPhoneVideoLoad}
                    getLocalizedText={getLocalizedText}
                />
            </ScrollView>

            <View style={styles.bottomChrome}>
                <View style={styles.progressContainer}>
                    <ProgressDots
                        chapters={chapters}
                        currentChapterIndex={currentPageIndex}
                        getChapterProgress={getChapterProgress}
                        progressAnimationDuration={0}
                    />
                </View>

                <View style={styles.controlsContainer}>
                    <TouchableWithoutFeedback
                        disabled={!isNextStepButtonVisible}
                        onPress={onNextChapter}
                        onPressIn={handleNextStepPressIn}
                        onPressOut={handleNextStepPressOut}
                    >
                        <Animated.View
                            style={[
                                styles.nextStepButtonWrapper,
                                {
                                    opacity: nextStepButtonOpacity,
                                    transform: [{ translateY: nextStepButtonFadeTranslateY }],
                                },
                            ]}
                            pointerEvents={isNextStepButtonVisible ? 'auto' : 'none'}
                        >
                            <View style={styles.nextStepButtonContainer}>
                                {nextStepButtonLayout.width > 0 && (
                                    <View
                                        style={[
                                            styles.nextStepButtonShadow,
                                            {
                                                width: nextStepButtonLayout.width,
                                                height: nextStepButtonLayout.height,
                                            },
                                        ]}
                                    />
                                )}
                                <Animated.View
                                    style={[
                                        styles.nextStepButton,
                                        {
                                            transform: [
                                                { translateX: nextStepPressTranslate },
                                                { translateY: nextStepPressTranslate },
                                            ],
                                        },
                                    ]}
                                    onLayout={(event) => {
                                        const { width, height } = event.nativeEvent.layout;
                                        setNextStepButtonLayout((prev) =>
                                            prev.width === width && prev.height === height
                                                ? prev
                                                : { width, height },
                                        );
                                    }}
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
                            </View>
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
    headerSideSpacer: {
        width: HEADER_BACK_BUTTON_WIDTH,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    introHero: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 1,
    },
    introHeroLine: {
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 34,
    },
    introHeroLineSecond: {
        marginTop: 4,
    },
    pagerView: {
        flex: 1,
    },
    pagerPage: {
        flex: 1,
        position: 'relative',
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
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 0,
    },
    illustrationImage: {
        backgroundColor: 'transparent',
        mixBlendMode: 'multiply',
    },
    controlsContainer: {
        marginTop: 24,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    nextStepButtonWrapper: {
        alignSelf: 'stretch',
        paddingRight: NEXT_STEP_BUTTON_SHADOW_OFFSET,
        paddingBottom: NEXT_STEP_BUTTON_SHADOW_OFFSET,
    },
    nextStepButtonContainer: {
        position: 'relative',
        overflow: 'visible',
    },
    nextStepButtonShadow: {
        position: 'absolute',
        left: NEXT_STEP_BUTTON_SHADOW_OFFSET,
        top: NEXT_STEP_BUTTON_SHADOW_OFFSET,
        borderRadius: 12,
        backgroundColor: '#000000',
    },
    nextStepButton: {
        backgroundColor: NEXT_STEP_BUTTON_COLOR,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#292524',
        paddingLeft: 16,
        paddingRight: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
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
