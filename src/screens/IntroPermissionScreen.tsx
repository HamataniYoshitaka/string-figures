import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    Text,
    Platform,
    Dimensions,
    StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRightIcon, CloseIcon } from '../components/icons';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

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

type IntroPermissionScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'IntroPermission'
>;
type IntroPermissionScreenRouteProp = RouteProp<RootStackParamList, 'IntroPermission'>;

interface Props {
    navigation: IntroPermissionScreenNavigationProp;
    route: IntroPermissionScreenRouteProp;
}

/** Figma 準拠のアーチ装飾（viewBox 428×345） */
const ARCH_VIEWBOX = { w: 428, h: 345 };
const ARCH_PATH_D =
    'M0 0H428V344.5C356.986 221.5 68.416 226 0 344.5V0Z';
const ARCH_FILL_COLOR = '#FF623F';
const NEXT_STEP_BUTTON_COLOR = '#FF623F';
const NEXT_STEP_BUTTON_SHADOW_OFFSET = 4;
const PHONE_FRAME_SHADOW_OFFSET = 4;
const PHONE_FRAME_SHADOW_COLOR = '#292524';

const IntroPermissionScreen: React.FC<Props> = ({ navigation, route }) => {
    const { currentLanguage } = route.params;

    const backButtonScale = useRef(new Animated.Value(1)).current;
    const nextStepButtonPressAnim = useRef(new Animated.Value(0)).current;
    const [nextStepButtonLayout, setNextStepButtonLayout] = useState({ width: 0, height: 0 });

    const { isTablet } = useDeviceInfo();
    const insets = useSafeAreaInsets();

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const headerPaddingTop =
        insets.top + (isTablet ? 16 : Platform.OS === 'android' ? 12 : 8);
    const archDisplayHeight = screenWidth * (ARCH_VIEWBOX.h / ARCH_VIEWBOX.w);
    const archTop = screenHeight / 2 - archDisplayHeight;
    const archTopFillHeight = Math.max(0, archTop);
    const headerContentHeight = isTablet ? 56 : 48;
    const bottomChromeEstimate = 88;
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

    const onGoBack = () => {
        navigation.goBack();
    };

    const getLocalizedText = (textObj: { ja: string; en: string }) => {
        return textObj[currentLanguage];
    };

    const onNextStep = async () => {
        try {
            const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

            if (!granted) {
                navigation.replace('IntroError');
                return;
            }

            navigation.replace('IntroVoice', { currentLanguage });
        } catch (error) {
            console.error('音声認識の許可リクエストエラー:', error);
        }
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
                                { transform: [{ scale: backButtonScale }] },
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
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {getLocalizedText({ ja: 'はじめに', en: 'Introduction' })}
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.page2TopSection}>
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
                            {getLocalizedText(INTRO_PAGE2_TEXT.line1)}
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

                <View style={styles.bottomChrome}>
                    <View style={styles.controlsContainer}>
                        <TouchableWithoutFeedback
                            onPress={onNextStep}
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
                                                { fontSize: currentLanguage === 'ja' ? 24 : 22 },
                                            ]}
                                        >
                                            Next Step
                                        </Text>
                                        <View style={styles.nextStepTitleContainer}>
                                            <Text
                                                maxFontSizeMultiplier={1.25}
                                                style={[
                                                    styles.nextStepTitle,
                                                    { fontSize: currentLanguage === 'ja' ? 15 : 14 },
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
    title: {
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    content: {
        flex: 1,
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
    bottomChrome: {
        maxWidth: 500,
        width: '100%',
        marginHorizontal: 'auto',
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

export default IntroPermissionScreen;
