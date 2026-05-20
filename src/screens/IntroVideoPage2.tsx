import React from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Text,
    Platform,
    Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeviceInfo } from '../hooks/useDeviceInfo';

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

const PHONE_FRAME_SHADOW_OFFSET = 4;
const PHONE_FRAME_INSET = 4;
const PHONE_FRAME_INNER_BORDER_WIDTH = 2;
const PHONE_FRAME_HEADER_FILL = '#9BB262';
const PHONE_FRAME_HEADER_ARCH_VIEWBOX = { w: 428, h: 86 };
const PHONE_FRAME_HEADER_ARCH_PATH_D =
    'M0 0H428V86C302.976 63.1349 123.158 63.4762 0 86V0Z';
const INTRO_PHONE_MOCK_TITLE = { ja: 'たくさんの星', en: 'Many Stars' } as const;
const PHONE_FRAME_SHADOW_COLOR = '#292524';
const PHONE_FRAME_OUTER_BORDER_WIDTH = 3;
const INTRO_PHONE_MOCK_VIDEO = require('../../assets/string-figures/0_introduction/intro1.mp4');

const PAGE2_TOP_SECTION_ESTIMATE = 88;
const BOTTOM_CHROME_ESTIMATE = 152;

export interface IntroVideoPage2Props {
    pagerWidth: number;
    currentLanguage: 'ja' | 'en';
    page2TextOpacity: Animated.Value;
    page2TextTranslateY: Animated.Value;
    page2PhoneOpacity: Animated.Value;
    page2PhoneTranslateY: Animated.Value;
    introPhoneVideoRef: React.RefObject<Video | null>;
    onIntroPhoneVideoLoad: () => void | Promise<void>;
    getLocalizedText: (textObj: { ja: string; en: string }) => string;
}

const IntroVideoPage2: React.FC<IntroVideoPage2Props> = ({
    pagerWidth,
    currentLanguage,
    page2TextOpacity,
    page2TextTranslateY,
    page2PhoneOpacity,
    page2PhoneTranslateY,
    introPhoneVideoRef,
    onIntroPhoneVideoLoad,
    getLocalizedText,
}) => {
    const { isTablet } = useDeviceInfo();
    const insets = useSafeAreaInsets();
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const headerPaddingTop =
        insets.top + (isTablet ? 16 : Platform.OS === 'android' ? 12 : 8);
    const headerContentHeight = isTablet ? 56 : 48;

    const maxPhoneFrameHeight = Math.max(
        120,
        screenHeight
            - headerPaddingTop
            - headerContentHeight
            - PAGE2_TOP_SECTION_ESTIMATE
            - BOTTOM_CHROME_ESTIMATE
            - insets.bottom
            - PHONE_FRAME_SHADOW_OFFSET
            - 6,
    );
    let phoneFrameWidth = Math.min(screenWidth * 0.56, isTablet ? 260 : 232);
    let phoneFrameHeight = phoneFrameWidth * (19 / 9);
    if (phoneFrameHeight > maxPhoneFrameHeight) {
        phoneFrameHeight = maxPhoneFrameHeight;
        phoneFrameWidth = phoneFrameHeight * (10 / 19);
    }
    const phoneFrameBorderRadius = phoneFrameWidth * 0.14;
    const phoneFrameInnerBorderRadius = Math.max(
        8,
        phoneFrameBorderRadius - PHONE_FRAME_INSET,
    );
    const phoneFrameInnerContentRadius = Math.max(
        6,
        phoneFrameInnerBorderRadius - PHONE_FRAME_INNER_BORDER_WIDTH,
    );
    const phoneFrameInnerContentWidth =
        phoneFrameWidth
        - PHONE_FRAME_OUTER_BORDER_WIDTH * 2
        - PHONE_FRAME_INSET * 2
        - PHONE_FRAME_INNER_BORDER_WIDTH * 2;
    const phoneFrameHeaderHeight =
        phoneFrameInnerContentWidth
        * (PHONE_FRAME_HEADER_ARCH_VIEWBOX.h / PHONE_FRAME_HEADER_ARCH_VIEWBOX.w);

    return (
        <View
            key="intro-page-2"
            style={[styles.pagerPage, { width: pagerWidth }]}
            collapsable={false}
        >
            <Animated.View
                style={[
                    styles.page2TopSection,
                    {
                        opacity: page2TextOpacity,
                        transform: [{ translateY: page2TextTranslateY }],
                    },
                ]}
            >
                <Text
                    maxFontSizeMultiplier={1.25}
                    style={[
                        styles.introHeroLine,
                        {
                            fontSize: currentLanguage === 'ja' ? 24 : 20,
                            fontFamily: currentLanguage === 'en' ? 'LineSeed-Regular' : 'KiwiMaru-Medium',
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
                            fontSize: currentLanguage === 'ja' ? 24 : 20,
                            fontFamily: currentLanguage === 'en' ? 'LineSeed-Regular' : 'KiwiMaru-Medium',
                        },
                    ]}
                >
                    {getLocalizedText(INTRO_PAGE2_TEXT.line2)}
                </Text>
            </Animated.View>

            <View style={styles.phoneFrameContainer}>
                <Animated.View
                    style={{
                        width: phoneFrameWidth + PHONE_FRAME_SHADOW_OFFSET,
                        height: phoneFrameHeight + PHONE_FRAME_SHADOW_OFFSET,
                        opacity: page2PhoneOpacity,
                        transform: [{ translateY: page2PhoneTranslateY }],
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
                    >
                        <View
                            style={[
                                styles.phoneFrameInner,
                                {
                                    borderRadius: phoneFrameInnerBorderRadius,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.phoneFrameInnerContent,
                                    {
                                        borderRadius: phoneFrameInnerContentRadius,
                                    },
                                ]}
                            >
                                <View style={styles.phoneFrameBody}>
                                    <Video
                                        ref={introPhoneVideoRef}
                                        source={INTRO_PHONE_MOCK_VIDEO}
                                        style={styles.phoneFrameVideo}
                                        resizeMode={ResizeMode.CONTAIN}
                                        shouldPlay={false}
                                        isMuted
                                        useNativeControls={false}
                                        onLoad={onIntroPhoneVideoLoad}
                                    />
                                </View>
                                <View
                                    style={[
                                        styles.phoneFrameHeader,
                                        { height: phoneFrameHeaderHeight },
                                    ]}
                                    pointerEvents="none"
                                >
                                    <Svg
                                        width="100%"
                                        height={phoneFrameHeaderHeight}
                                        viewBox={`0 0 ${PHONE_FRAME_HEADER_ARCH_VIEWBOX.w} ${PHONE_FRAME_HEADER_ARCH_VIEWBOX.h}`}
                                        preserveAspectRatio="none"
                                        style={styles.phoneFrameHeaderArch}
                                    >
                                        <Path
                                            d={PHONE_FRAME_HEADER_ARCH_PATH_D}
                                            fill={PHONE_FRAME_HEADER_FILL}
                                        />
                                    </Svg>
                                    <View style={styles.phoneFrameTitleWrap}>
                                        <Text
                                            maxFontSizeMultiplier={1.25}
                                            numberOfLines={1}
                                            style={[
                                                styles.phoneFrameTitle,
                                                {
                                                    fontSize: isTablet ? 14 : 12,
                                                    fontFamily:
                                                        currentLanguage === 'en'
                                                            ? 'KronaOne-Regular'
                                                            : 'LineSeed-Bold',
                                                },
                                            ]}
                                        >
                                            {getLocalizedText(INTRO_PHONE_MOCK_TITLE)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pagerPage: {
        flex: 1,
        position: 'relative',
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
        borderWidth: PHONE_FRAME_OUTER_BORDER_WIDTH,
        borderColor: '#292524',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        padding: PHONE_FRAME_INSET,
    },
    phoneFrameInner: {
        flex: 1,
        borderWidth: PHONE_FRAME_INNER_BORDER_WIDTH,
        borderColor: '#292524',
        backgroundColor: '#F7F5F2',
        overflow: 'hidden',
    },
    phoneFrameInnerContent: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#F7F5F2',
        overflow: 'hidden',
    },
    phoneFrameBody: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#F7F5F2',
        overflow: 'hidden',
    },
    phoneFrameVideo: {
        width: '100%',
        height: '100%',
    },
    phoneFrameHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        elevation: 1,
        overflow: 'hidden',
    },
    phoneFrameHeaderArch: {
        ...StyleSheet.absoluteFillObject,
    },
    phoneFrameTitleWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingBottom: 6,
    },
    phoneFrameTitle: {
        color: '#292524',
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default IntroVideoPage2;
