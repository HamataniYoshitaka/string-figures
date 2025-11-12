import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Dimensions, Alert, Platform, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import PurchaseButton from '../components/PurchaseButton';

type AdditionalScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Additional'
>;
type AdditionalScreenRouteProp = RouteProp<RootStackParamList, 'Additional'>;

interface Props {
  navigation: AdditionalScreenNavigationProp;
  route: AdditionalScreenRouteProp;
}

const AdditionalScreen: React.FC<Props> = ({ navigation, route }) => {
    const [currentLanguage, setCurrentLanguage] = useState<'ja' | 'en'>('ja');

    // アニメーション用のスケール値
    const backButtonScale = useRef(new Animated.Value(1)).current;
    
    const { isTablet, isDeviceLandscape } = useDeviceInfo();
    const isAndroid = Platform.OS === 'android';
    console.log('isAndroid', isAndroid);
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

    // コレクション1のサムネイルデータ（仮データ）
    const collectionThumbnails = [
        { id: 1, image: require('../../assets/purchase/dummy-card1.jpg'), name: 'イヌイットの家' },
        { id: 2, image: require('../../assets/purchase/dummy-card1.jpg'), name: '2階建のイヌイットの家' },
        { id: 3, image: require('../../assets/purchase/dummy-card1.jpg'), name: 'イヌイットの家' },
        { id: 4, image: require('../../assets/purchase/dummy-card1.jpg'), name: 'イヌイットの家' },
        { id: 5, image: require('../../assets/purchase/dummy-card1.jpg'), name: 'イヌイットの家' },
    ];

    const handlePurchasePress = () => {
        // ブランクのまま
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
                <Text style={[styles.title, { fontSize: isTablet ? 22 : 18 }]} numberOfLines={1}>
                    {getLocalizedText({ja: '追加コレクション', en: 'Additional Collection'})}
                </Text>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.collectionCard}>
                    <View style={styles.collectionHeader}>
                        <Text style={styles.collectionTitle}>コレクション1</Text>
                        <View style={styles.descriptionSpacer} />
                        <Text style={styles.collectionDescription}>
                            コレクション1には、以下のあやとり30パターンが収録されています。
                        </Text>
                    </View>
                    
                    <ScrollView 
                        horizontal 
                        style={styles.thumbnailScrollView}
                        contentContainerStyle={styles.thumbnailScrollContent}
                        showsHorizontalScrollIndicator={false}
                    >
                        {collectionThumbnails.map((item) => (
                            <View key={item.id} style={styles.thumbnailItem}>
                                <View style={styles.thumbnailImageContainer}>
                                    <Image 
                                        source={item.image}
                                        style={styles.thumbnailImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={styles.captionSpacer} />
                                <Text style={styles.thumbnailCaption} numberOfLines={2}>
                                    {item.name}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.purchaseButtonContainer}>
                        <PurchaseButton onPress={handlePurchasePress} />
                    </View>
                </View>
            </ScrollView>
            
        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8e6e0',
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

    progressContainer: {
        marginTop: 16,
        paddingLeft: 16,
    },
    subtitleContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 6,
        justifyContent: 'center',
    },
    subtitleText: {
        fontFamily: 'KleeOne-Regular',
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    controlsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    collectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#A6A09B',
        overflow: 'hidden',
    },
    collectionHeader: {
        padding: 16,
    },
    collectionTitle: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 24,
        color: '#2B7FFF',
        fontWeight: '600',
    },
    descriptionSpacer: {
        height: 4,
    },
    collectionDescription: {
        fontFamily: 'KleeOne-Regular',
        fontSize: 16,
        color: '#57534D',
        lineHeight: 24,
        fontWeight: '500',
    },
    thumbnailScrollView: {
        flexGrow: 0,
    },
    thumbnailScrollContent: {
        paddingHorizontal: 12,
        paddingVertical: 0,
        height: 120,
        alignItems: 'center',
    },
    thumbnailItem: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnailImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#79716B',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    captionSpacer: {
        height: 4,
    },
    thumbnailCaption: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 14,
        color: '#57534D',
        textAlign: 'center',
        lineHeight: 18,
        fontWeight: '600',
        maxWidth: 80,
    },
    purchaseButtonContainer: {
        padding: 16,
        paddingTop: 10,
    },

});

export default AdditionalScreen;