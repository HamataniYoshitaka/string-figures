import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';

type NonverbalVideoPlayerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NonverbalVideoPlayer'
>;
type NonverbalVideoPlayerScreenRouteProp = RouteProp<
  RootStackParamList,
  'NonverbalVideoPlayer'
>;

interface Props {
  navigation: NonverbalVideoPlayerScreenNavigationProp;
  route: NonverbalVideoPlayerScreenRouteProp;
}

const NonverbalVideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stringFigure, currentLanguage } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonLabel}>戻る</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonLabel: {
    fontSize: 16,
    color: '#2B6CB0',
  },
});

export default NonverbalVideoPlayerScreen;
