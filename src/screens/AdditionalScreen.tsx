import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Dimensions, Alert, Platform, ScrollView, Image, ImageSourcePropType } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';
import PurchaseButton from '../components/PurchaseButton';
import StringFigureCard from '../components/StringFigureCard';
import { stringFigures } from '../data/index';
import { StringFigure } from '../types';

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
    const [purchasedItems, setPurchasedItems] = useState<number[]>([]);
    const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number; height: number } }>({});

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

    const loadPurchasedItems = async () => {
        try {
            const savedPurchasedItems = await AsyncStorage.getItem('purchasedItems');
            if (savedPurchasedItems) {
                const parsedItems = JSON.parse(savedPurchasedItems);
                if (Array.isArray(parsedItems)) {
                    setPurchasedItems(parsedItems);
                }
            }
        } catch (error) {
            console.error('購入済みアイテムの読み込みに失敗しました:', error);
        }
    };

    useEffect(() => {
        loadLanguageSetting();
        loadPurchasedItems();
    }, []);

    const handleImageLoad = (itemId: string, event: any) => {
        const { width, height } = event.nativeEvent.source;
        setImageDimensions(prev => ({
            ...prev,
            [itemId]: { width, height }
        }));
    };

    const handleItemPress = (item: StringFigure) => {
        if (item.directNavigationDestination) {
            if (item.directNavigationDestination === 'Additional') {
                navigation.navigate('Additional');
            }
            if (item.directNavigationDestination === 'Policy') {
                navigation.navigate('Policy');
            }
            if (item.directNavigationDestination === 'Intro') {
                navigation.navigate('IntroVideo', { currentLanguage: currentLanguage });
            }
            return;
        }
        // AdditionalScreenでは詳細表示は行わないため、何もしない
    };

    const handlePurchasePress = async (collectionId: number) => {
        try {
            console.log('handlePurchasePress', collectionId);
            
            // 既存のpurchasedItemsを読み込む
            const savedPurchasedItems = await AsyncStorage.getItem('purchasedItems');
            let purchasedItems: number[] = [];
            
            if (savedPurchasedItems) {
                const parsedItems = JSON.parse(savedPurchasedItems);
                if (Array.isArray(parsedItems)) {
                    purchasedItems = parsedItems;
                }
            }
            
            // collectionIdが既に含まれていない場合のみ追加
            if (!purchasedItems.includes(collectionId)) {
                purchasedItems.push(collectionId);
                await AsyncStorage.setItem('purchasedItems', JSON.stringify(purchasedItems));
                setPurchasedItems([...purchasedItems]);
                console.log('購入済みアイテムに追加しました:', collectionId);
                Alert.alert('購入ありがとうございます', `コレクション${collectionId}を追加しました。引き続き、あやとりの世界をお楽しみください`, [{ text: 'OK', onPress: onGoBack }]);
            } else {
                console.log('既に購入済みです:', collectionId);
            }
        } catch (error) {
            console.error('購入済みアイテムの保存に失敗しました:', error);
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
                    <CloseIcon width={24} height={24} fillColor="#79716B" />
                    </Animated.View>
                </TouchableWithoutFeedback>
                <Text maxFontSizeMultiplier={1.35} style={[styles.title, { fontSize: isTablet ? 22 : 18 }]} numberOfLines={1}>
                    {getLocalizedText({ja: '追加コレクション', en: 'Additional Collection'})}
                </Text>
            </View>

            <ScrollView 
                horizontal
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsHorizontalScrollIndicator={false}
                pagingEnabled={false}
                snapToInterval={Dimensions.get('window').width * 0.9 + 32}
                decelerationRate="fast"
            >
                <View style={styles.collectionCard}>
                    <ScrollView 
                        style={styles.cardScrollView}
                        contentContainerStyle={styles.cardScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.collectionHeader}>
                            <Text style={[styles.collectionTitle, { color: '#2B7FFF' }]}>コレクション1</Text>
                            <View style={styles.descriptionSpacer} />
                            <Text style={styles.collectionDescription}>
                                コレクション1には、以下のあやとり{stringFigures.filter(figure => figure.premiumCourseId === 1).length}パターンが収録されています。
                            </Text>
                        </View>
                        
                        <View style={styles.thumbnailContainer}>
                            {stringFigures.filter(figure => figure.premiumCourseId === 1).map((item) => {
                                const imageInfo = imageDimensions[item.id];
                                const cardWidth = 260 - 24; // collectionCard width - paddingHorizontal
                                let calculatedHeight = 200;
                                
                                if (imageInfo) {
                                    calculatedHeight = (imageInfo.height / imageInfo.width) * cardWidth;
                                }
                                
                                return (
                                    <View key={item.id} style={styles.thumbnailItem}>
                                        <StringFigureCard
                                            item={item}
                                            bookmarked={false}
                                            calculatedHeight={calculatedHeight}
                                            currentLanguage={currentLanguage}
                                            onPress={handleItemPress}
                                            onImageLoad={handleImageLoad}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <View style={styles.purchaseButtonContainer}>
                        <PurchaseButton 
                            onPress={handlePurchasePress} 
                            collectionId={1}
                            backgroundColor="#2B7FFF"
                            disabled={purchasedItems.includes(1)}
                        />
                    </View>
                </View>

                <View style={styles.collectionCard}>
                    <ScrollView 
                        style={styles.cardScrollView}
                        contentContainerStyle={styles.cardScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.collectionHeader}>
                            <Text style={[styles.collectionTitle, { color: '#E17100' }]}>コレクション2</Text>
                            <View style={styles.descriptionSpacer} />
                            <Text style={styles.collectionDescription}>
                                コレクション2には、以下のあやとり{stringFigures.filter(figure => figure.premiumCourseId === 2).length}パターンが収録されています。
                            </Text>
                        </View>
                        
                        <View style={styles.thumbnailContainer}>
                            {stringFigures.filter(figure => figure.premiumCourseId === 2).map((item) => {
                                const imageInfo = imageDimensions[item.id];
                                const cardWidth = 260 - 24; // collectionCard width - paddingHorizontal
                                let calculatedHeight = 200;
                                
                                if (imageInfo) {
                                    calculatedHeight = (imageInfo.height / imageInfo.width) * cardWidth;
                                }
                                
                                return (
                                    <View key={item.id} style={styles.thumbnailItem}>
                                        <StringFigureCard
                                            item={item}
                                            bookmarked={false}
                                            calculatedHeight={calculatedHeight}
                                            currentLanguage={currentLanguage}
                                            onPress={handleItemPress}
                                            onImageLoad={handleImageLoad}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <View style={styles.purchaseButtonContainer}>
                        <PurchaseButton 
                            onPress={handlePurchasePress} 
                            collectionId={2}
                            backgroundColor="#E17100"
                            disabled={purchasedItems.includes(2)}
                        />
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
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    collectionCard: {
        width: 260,
        marginRight: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#A6A09B',
        overflow: 'hidden',
        height: '100%',
    },
    cardScrollView: {
        flex: 1,
    },
    cardScrollContent: {
        paddingBottom: 80,
    },
    collectionHeader: {
        padding: 12,
    },
    collectionTitle: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 24,
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
    thumbnailContainer: {
        flexDirection: 'column',
        paddingHorizontal: 12,
        paddingVertical: 0,
        alignItems: 'stretch',
    },
    thumbnailItem: {
        marginBottom: 12,
        width: '100%',
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
        // resizeMode: 'contain',
        objectFit: 'contain',
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 12,
        paddingBottom: 12,
    },

});

export default AdditionalScreen;