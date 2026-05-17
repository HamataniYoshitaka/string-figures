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

const INTRO_PAGE2_TEXT = {
    line1: {
        ja: '両手に糸がかかったままでも',
        en: 'Even with string on your hands',
    },
    line2: {
        ja: '「声」で操作できます',
        en: 'you can control it by voice',
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
const PHONE_FRAME_SHADOW_OFFSET = 4;
/** CloseIcon 28 + backButton padding 8×2 — タイトル中央揃え用の左右対称幅 */
const HEADER_BACK_BUTTON_WIDTH = 28 + 8 * 2;
const PHONE_FRAME_SHADOW_COLOR = '#292524';
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
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    const nextStepButtonPressAnim = useRef(new Animated.Value(0)).current;
    const [nextStepButtonLayout, setNextStepButtonLayout] = useState({ width: 0, height: 0 });
    
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
    const illustrationWidth = Math.min(screenWidth * 0.58, isTablet ? 360 : 280);
    const illustrationHeight = illustrationWidth / INTRO_ILLUSTRATION_ASPECT;
    /** ProgressDots・ボタンを除いた画面下半分の中央（75vh − bottomChrome/2）にイラスト中心を合わせる */
    const illustrationCenterY =
        screenHeight * 0.75 - bottomChromeTotalHeight / 2;
    const illustrationTop =
        illustrationCenterY - headerTotalHeight - illustrationHeight / 2;
    const page2TopSectionEstimate = 88;
    const maxPhoneFrameHeight = Math.max(
        120,
        screenHeight
            - headerPaddingTop
            - headerContentHeight
            - page2TopSectionEstimate
            - bottomChromeEstimate
            - insets.bottom
            - PHONE_FRAME_SHADOW_OFFSET
            - 36,
    );
    let phoneFrameWidth = Math.min(screenWidth * 0.56, isTablet ? 260 : 232);
    let phoneFrameHeight = phoneFrameWidth * (19 / 9);
    if (phoneFrameHeight > maxPhoneFrameHeight) {
        phoneFrameHeight = maxPhoneFrameHeight;
        phoneFrameWidth = phoneFrameHeight * (9 / 19);
    }
    const phoneFrameBorderRadius = phoneFrameWidth * 0.14;
    
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
        return chapterIndex < currentPageIndex ? 1 : 0;
    };

    const handlePageSelected = (position: number) => {
        setCurrentPageIndex(position);
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

            <PagerView
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
                            { top: Math.max(introHeroTop, 0) },
                        ]}
                    >
                        <Text
                            maxFontSizeMultiplier={1.25}
                            style={[
                                styles.introHeroLine,
                                {
                                    fontSize: currentLanguage === 'ja' ? 24 : 22,
                                    fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'KiwiMaru-Medium',
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
                                    fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'KiwiMaru-Medium',
                                },
                            ]}
                        >
                            {getLocalizedText(INTRO_HERO_TEXT.line2)}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.illustrationContainer,
                            { top: Math.max(illustrationTop, 0) },
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
                    </View>
                </View>

                <View key="intro-page-2" style={styles.pagerPage} collapsable={false}>
                    <View style={styles.page2TopSection}>
                        <Text
                            maxFontSizeMultiplier={1.25}
                            style={[
                                styles.introHeroLine,
                                {
                                    fontSize: currentLanguage === 'ja' ? 24 : 22,
                                    fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'KiwiMaru-Medium',
                                },
                            ]}
                        >
                            {getLocalizedText(INTRO_PAGE2_TEXT.line1)}
                        </Text>
                        <Text
                            maxFontSizeMultiplier={1.25}
                            style={[
                                styles.introHeroLine,
                                styles.introHeroLineSecond,
                                {
                                    fontSize: currentLanguage === 'ja' ? 24 : 22,
                                    fontFamily: currentLanguage === 'en' ? 'KronaOne-Regular' : 'KiwiMaru-Medium',
                                },
                            ]}
                        >
                            {getLocalizedText(INTRO_PAGE2_TEXT.line2)}
                        </Text>
                    </View>

                    <View style={styles.phoneFrameContainer}>
                        <View
                            style={{
                                width: phoneFrameWidth + PHONE_FRAME_SHADOW_OFFSET,
                                height: phoneFrameHeight + PHONE_FRAME_SHADOW_OFFSET,
                            }}
                        >
                            <View
                                style={[
                                    styles.phoneFrameHardShadow,
                                    {
                                        width: phoneFrameWidth,
                                        height: phoneFrameHeight,
                                        borderRadius: phoneFrameBorderRadius,
                                        left: PHONE_FRAME_SHADOW_OFFSET,
                                        top: PHONE_FRAME_SHADOW_OFFSET,
                                    },
                                ]}
                            />
                            <View
                                style={[
                                    styles.phoneFrame,
                                    {
                                        width: phoneFrameWidth,
                                        height: phoneFrameHeight,
                                        borderRadius: phoneFrameBorderRadius,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </PagerView>

            <View style={styles.bottomChrome}>
                <View style={styles.progressContainer}>
                    <ProgressDots
                        chapters={chapters}
                        currentChapterIndex={currentPageIndex}
                        getChapterProgress={getChapterProgress}
                    />
                </View>

                <View style={styles.controlsContainer}>
                    <TouchableWithoutFeedback 
                        onPress={onNextChapter}
                        onPressIn={handleNextStepPressIn}
                        onPressOut={handleNextStepPressOut}
                    >
                        <View style={styles.nextStepButtonWrapper}>
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
                        </View>
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
    page2TopSection: {
        paddingTop: 8,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    phoneFrameContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    phoneFrameHardShadow: {
        position: 'absolute',
        backgroundColor: PHONE_FRAME_SHADOW_COLOR,
    },
    phoneFrame: {
        position: 'absolute',
        left: 0,
        top: 0,
        borderWidth: 3,
        borderColor: '#292524',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
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
