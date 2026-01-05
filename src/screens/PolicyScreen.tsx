import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Dimensions, Alert, Platform, ScrollView, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, ExternalLinkIcon } from '../components/icons';

type PolicyScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Policy'
>;
type PolicyScreenRouteProp = RouteProp<RootStackParamList, 'Policy'>;

interface Props {
  navigation: PolicyScreenNavigationProp;
  route: PolicyScreenRouteProp;
}

const PolicyScreen: React.FC<Props> = ({ navigation, route }) => {
    const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    
    const { isTablet, isDeviceLandscape } = useDeviceInfo();
    const isAndroid = Platform.OS === 'android';
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

    useEffect(() => {
        loadLanguageSetting();
    }, []);


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
                    style={[styles.title, { fontSize: isTablet ? 22 : 18 , fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }]} numberOfLines={1}
                >
                    {getLocalizedText({ja: 'このアプリについて', en: 'About this app'})}
                </Text>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentContainer}>
                    <View style={styles.sectionContainer}>
                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={[styles.sectionTitle, { fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }]}
                        >
                            { getLocalizedText({ 
                                ja: 'このアプリについて', 
                                en: 'About this app' }) 
                            }
                        </Text>
                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={styles.sectionDescription}
                        >
                            { getLocalizedText({ 
                                ja: 'このアプリは、世界中に広く伝承されている「あやとり」を紹介することを目指したアプリです。両手にひもがかかって塞がっていても、画面に触らずに「声」で操作できるのが特徴です。', 
                                en: 'This app is designed to introduce “String Figures (Ayatori, Cat’s Cradle),” a traditional practice that has been shared and passed down across many cultures around the world. It is characterized by the ability to operate without touching the screen even if the string is caught on your fingers.' }) 
                            }
                        </Text>

                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={[styles.sectionTitle, { fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }]}
                        >
                            { getLocalizedText({ 
                                ja: '音声による操作について', 
                                en: 'About voice operation' }) 
                            }
                        </Text>
                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={styles.sectionDescription}
                        >
                            { getLocalizedText({ 
                                ja: '音声で動画を操作するために、マイクと音声認識機能を使用しています。android端末の場合は、データ通信できない場合は音声操作ができませんのでご注意ください。iPhone, iPadでは音声操作に通信を伴わないため、オフライン状態であっても音声操作をご利用いただけます。', 
                                en: 'In order to operate the video by voice, we use the microphone and voice recognition function. Please note that on Android devices, voice commands cannot be used if mobile data is unavailable. On iPhone and iPad, voice controls do not require a data connection, so you can use them even when you are offline.' }) 
                            }
                        </Text>
                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={styles.sectionDescription}
                        >
                            { getLocalizedText({ 
                                ja: 'また、音声認識が利用できない場合であっても、通常のボタンタップ操作により、動画コントロールを含む全ての機能をご利用いただけます。', 
                                en: 'Even if voice recognition is unavailable, you can still access all functions—including video controls—through normal button tap operations.' }) 
                            }
                        </Text>
                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={styles.sectionDescription}
                        >
                            { getLocalizedText({ 
                                ja: '音声操作に利用した音声データの保存・収集は一切行なっておりません。', 
                                en: 'We do not record or collect any voice data used for voice operation.' }) 
                            }
                        </Text>

                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={[styles.sectionDescription, { marginTop: 16 }]}
                        >
                            { getLocalizedText({ 
                                ja: 'このアプリが認識できる単語は以下の5つのみです。\n・つぎ\n・もういちど\n・まえ\n・はじめから\n・できた', 
                                en: 'The only words that this app can recognize are the following five: \n- "next"\n- "replay"\n- "previous"\n- "restart"\n- "done".' }) 
                            }
                        </Text>

                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={[styles.sectionTitle, { fontFamily: currentLanguage === 'en' ? 'Merriweather-SemiBold' : 'KleeOne-SemiBold' }]}
                        >
                            { getLocalizedText({ 
                                ja: '謝辞・参考', 
                                en: 'Acknowledgements & References' }) 
                            }
                        </Text>
                        <Text 
                            maxFontSizeMultiplier={1.35}
                            style={styles.sectionDescription}
                        >
                            { getLocalizedText({ 
                                ja: 'このアプリで利用した「あやとり」の手順、文化的背景などは、主に以下のサイトを参考にしました。この場を借りてお礼申し上げます。', 
                                en: 'The string figure instructions, cultural background, and other information used in this app were primarily referenced from the following websites. I would like to take this opportunity to express my gratitude.' }) 
                            }
                        </Text>
                        <View style={{marginTop: 12}}>
                            <Text 
                                maxFontSizeMultiplier={1.35}
                                style={styles.sectionDescriptionBold}
                            >
                                あやとりしてみよう
                            </Text>
                            <View style={styles.linkContainer}>
                                <Text 
                                    maxFontSizeMultiplier={1.35}
                                    style={styles.sectionDescriptionLink} 
                                    onPress={() => Linking.openURL('https://isfa-jp.org/~k16/')}
                                >
                                    https://isfa-jp.org/~k16/
                                </Text>
                                <View style={styles.externalLinkIconContainer}>
                                    <ExternalLinkIcon width={18} height={18} strokeColor="#57534D" />
                                </View>
                            </View>
                        </View>

                    </View>
                </View>
            </ScrollView>
            
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
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginHorizontal: 16,
    },

    contentContainer: {
        paddingHorizontal: 12,
        paddingBottom: 32,
        flex: 1,
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    sectionContainer: {
        // backgroundColor: 'red',
        maxWidth: 560,
        // marginHorizontal: 'auto',
    },
    sectionTitle: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 24,
    },
    sectionDescription: {
        fontFamily: 'KleeOne-Regular',
        fontSize: 16,
        color: '#57534D',
        lineHeight: 24,
        fontWeight: '500',
    },

    sectionDescriptionBold: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 16,
        color: '#57534D',
        lineHeight: 24,
        fontWeight: '600',
    },
    sectionDescriptionLink: {
        fontFamily: 'KleeOne-Regular',
        fontSize: 16,
        color: '#57534D',
        lineHeight: 24,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    externalLinkIconContainer: {
        marginLeft: 8,
    },
});

export default PolicyScreen;