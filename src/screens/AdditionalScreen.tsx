import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated, Text, Dimensions, Alert, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Purchases from 'react-native-purchases';
import { RootStackParamList } from '../types';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../components/icons';
import CollectionCard from '../components/CollectionCard';
import { StringFigure } from '../types';
import DetailBottomSheet, { DetailBottomSheetRef } from '../components/DetailBottomSheet';
import { stringFigures } from '../data/index';
import { getProductIdForCollection } from '../utils/revenuecat';

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
    const [selectedItem, setSelectedItem] = useState<StringFigure | null>(null);
    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
    const bottomSheetRef = useRef<DetailBottomSheetRef>(null);
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
        loadBookmarkedIds();
    }, []);

    const loadBookmarkedIds = async () => {
        try {
            const savedBookmarks = await AsyncStorage.getItem('bookmarkedIds');
            if (savedBookmarks) {
                setBookmarkedIds(JSON.parse(savedBookmarks));
            }
        } catch (error) {
            console.error('ブックマークの読み込みに失敗しました:', error);
        }
    };

    const saveBookmarkedIds = async (ids: string[]) => {
        try {
            await AsyncStorage.setItem('bookmarkedIds', JSON.stringify(ids));
            setBookmarkedIds(ids);
        } catch (error) {
            console.error('ブックマークの保存に失敗しました:', error);
        }
    };

    const handleImageLoad = (itemId: string, event: any) => {
        const { width, height } = event.nativeEvent.source;
        setImageDimensions(prev => ({
            ...prev,
            [itemId]: { width, height }
        }));
    };

    const handleItemPress = (item: StringFigure) => {
        setSelectedItem(item);
    };

    useEffect(() => {
        if (selectedItem) {
            bottomSheetRef.current?.present();
        }
    }, [selectedItem]);

    const handleCloseBottomSheet = () => {
        bottomSheetRef.current?.dismiss();
        setSelectedItem(null);
    };

    const handlePlayVideo = (item: StringFigure) => {
        handleCloseBottomSheet();
        navigation.navigate('VideoPlayer', { stringFigure: item, currentLanguage: currentLanguage });
    };

    const toggleBookmark = () => {
        if (!selectedItem) return;
        
        const itemId = selectedItem.id;
        const newBookmarkedIds = bookmarkedIds.includes(itemId)
            ? bookmarkedIds.filter(id => id !== itemId)
            : [...bookmarkedIds, itemId];
        
        saveBookmarkedIds(newBookmarkedIds);
    };

    const handlePrerequisitePress = (prerequisiteId: string) => {
        // 1. BottomSheetを閉じる
        bottomSheetRef.current?.dismiss();
        
        // 2. BottomSheetが完全に閉じるのを待ってから、そのIDの作品をセットしてBottomSheetを表示
        setTimeout(() => {
            const prerequisiteItem = stringFigures.find((figure: StringFigure) => figure.id === prerequisiteId);
            if (prerequisiteItem) {
                setSelectedItem(prerequisiteItem);
            }
        }, 600);
    };

    const handlePurchasePress = async (collectionId: number) => {
        try {
            console.log('handlePurchasePress', collectionId);
            
            // 既に購入済みかチェック
            if (purchasedItems.includes(collectionId)) {
                console.log('既に購入済みです:', collectionId);
                return;
            }
            
            // Product IDを取得
            const productId = getProductIdForCollection(collectionId);
            console.log('Purchasing product:', productId);
            
            // RevenueCatで購入処理を実行
            const { customerInfo, productIdentifier } = await Purchases.purchaseProduct(productId);
            
            // 購入が成功した場合
            if (productIdentifier === productId) {
                console.log('Purchase successful:', productIdentifier);
                
                // 既存のpurchasedItemsを読み込む
                const savedPurchasedItems = await AsyncStorage.getItem('purchasedItems');
                let updatedPurchasedItems: number[] = [];
                
                if (savedPurchasedItems) {
                    const parsedItems = JSON.parse(savedPurchasedItems);
                    if (Array.isArray(parsedItems)) {
                        updatedPurchasedItems = parsedItems;
                    }
                }
                
                // collectionIdが既に含まれていない場合のみ追加
                if (!updatedPurchasedItems.includes(collectionId)) {
                    updatedPurchasedItems.push(collectionId);
                    await AsyncStorage.setItem('purchasedItems', JSON.stringify(updatedPurchasedItems));
                    setPurchasedItems([...updatedPurchasedItems]);
                    console.log('購入済みアイテムに追加しました:', collectionId);
                    
                    // 成功メッセージを表示
                    const successTitle = currentLanguage === 'ja' ? '購入ありがとうございます' : 'Thank you for your purchase';
                    const successMessage = currentLanguage === 'ja' 
                        ? `コレクション${collectionId}を追加しました。引き続き、あやとりの世界をお楽しみください`
                        : `Collection ${collectionId} has been added. Continue to enjoy the world of string figures`;
                    Alert.alert(successTitle, successMessage, [{ text: 'OK', onPress: onGoBack }]);
                }
            }
        } catch (error: any) {
            // エラーハンドリング
            // ユーザーが購入をキャンセルした場合（userCancelledプロパティをチェック）
            if (error.userCancelled) {
                console.log('購入がキャンセルされました');
                // アラートは表示しない
            } else {
                // その他のエラー（ネットワークエラー、購入エラー等）
                console.error('購入処理中にエラーが発生しました:', error);
                const errorTitle = currentLanguage === 'ja' ? '購入エラー' : 'Purchase Error';
                const errorMessage = currentLanguage === 'ja'
                    ? '購入処理中にエラーが発生しました。もう一度お試しください。'
                    : 'An error occurred during the purchase. Please try again.';
                Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
            }
        }
    };


    return (    
        <View style={styles.wrapper}>
            <Image 
                source={require('../../assets/bg-additional-screen.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
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
                        <CloseIcon width={28} height={28} fillColor="#FFFFFF" strokeWidth={0} />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    <Text maxFontSizeMultiplier={1.35} style={[styles.title, { fontSize: isTablet ? 24 : 20 }]} numberOfLines={1}>
                        {getLocalizedText({ja: '追加コレクション', en: 'Additional Collection'})}
                    </Text>
                </View>

                <ScrollView 
                    horizontal
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={true}
                    snapToInterval={260 + 16}
                    decelerationRate="fast"
                >
                    <CollectionCard
                        collectionId={1}
                        backgroundColor="#2B7FFF"
                        imageDimensions={imageDimensions}
                        currentLanguage={currentLanguage}
                        purchasedItems={purchasedItems}
                        onPurchasePress={handlePurchasePress}
                        onItemPress={handleItemPress}
                        onImageLoad={handleImageLoad}
                    />

                    <CollectionCard
                        collectionId={2}
                        backgroundColor="#E17100"
                        imageDimensions={imageDimensions}
                        currentLanguage={currentLanguage}
                        purchasedItems={purchasedItems}
                        onPurchasePress={handlePurchasePress}
                        onItemPress={handleItemPress}
                        onImageLoad={handleImageLoad}
                    />

                    <CollectionCard
                        collectionId={3}
                        backgroundColor="#0d9488"
                        imageDimensions={imageDimensions}
                        currentLanguage={currentLanguage}
                        purchasedItems={purchasedItems}
                        onPurchasePress={handlePurchasePress}
                        onItemPress={handleItemPress}
                        onImageLoad={handleImageLoad}
                    />

                    <View style={styles.restorePurchaseContainer}>
                        <View style={styles.restorePurchaseContent}>
                            <Text style={styles.restorePurchaseOrText} maxFontSizeMultiplier={1.15}>{getLocalizedText({ja: 'または', en: 'Or'})}</Text>
                            <View style={styles.restorePurchaseQuestionContainer}>
                                <Text style={styles.restorePurchaseQuestionText} maxFontSizeMultiplier={1.25}>{getLocalizedText({ja: '以前にコレクションを\n購入しましたか？', en: 'Have you previously purchased a collection?'})}</Text>
                            </View>
                            <TouchableOpacity onPress={() => {}}>
                                <Text style={styles.restorePurchaseButtonText} maxFontSizeMultiplier={1.1}>{getLocalizedText({ja: '購入情報を復元する', en: 'Restore purchase information'})}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* 詳細ボトムシート */}
            <DetailBottomSheet
                ref={bottomSheetRef}
                item={selectedItem}
                isBookmarked={selectedItem ? bookmarkedIds.includes(selectedItem.id) : false}
                onClose={handleCloseBottomSheet}
                onPlayVideo={handlePlayVideo}
                onToggleBookmark={toggleBookmark}
                currentLanguage={currentLanguage}
                purchasedItems={purchasedItems}
                onPrerequisitePress={handlePrerequisitePress}
                isAdditionalScene={true}
                onPurchasePress={handlePurchasePress}
            />
        </View>
        
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
        // fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginHorizontal: 16,
        color: '#FFFFFF',
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
    restorePurchaseContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 20,
        width: 260,
        minHeight: 300,
    },
    restorePurchaseContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 24,
    },
    restorePurchaseOrText: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 20,
        color: '#79716b',
        textAlign: 'center',
        lineHeight: 32,
    },
    restorePurchaseQuestionContainer: {
        alignItems: 'center',
    },
    restorePurchaseQuestionText: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 16,
        color: '#57534d',
        textAlign: 'center',
        lineHeight: 32,
    },
    restorePurchaseButtonText: {
        fontFamily: 'KleeOne-SemiBold',
        fontSize: 22,
        color: '#292524',
        textAlign: 'center',
        lineHeight: 32,
        textDecorationLine: 'underline',
    },

});

export default AdditionalScreen;