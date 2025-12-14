import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  relatedFigures: string[];
}

const RelatedFigures: React.FC<Props> = ({ relatedFigures }) => {
  return (
    <View style={styles.container}>
      {/* 表示部分は空のまま */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // スタイルは後で追加
  },
});

export default RelatedFigures;
