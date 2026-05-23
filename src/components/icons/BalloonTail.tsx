import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BalloonTailProps {
  width?: number;
  height?: number;
  fillColor?: string;
  position?: 'topleft' | 'topright' | 'topcenter' | 'lefttop' | 'bottomright' | 'bottomcenter';
}

const getTailPath = (position: BalloonTailProps['position']): string => {
  switch (position) {
    case 'topleft':
      return 'M0 0 L0 8 L8 8 Z';
    case 'topright':
      return 'M8 0 L8 8 L0 8 Z';
    case 'topcenter':
      return 'M4 0 L0 8 L8 8 Z';
    case 'bottomright':
      return 'M8 0 L8 8 L0 0 Z';
    case 'bottomcenter':
      return 'M4 8 L0 0 L8 0 Z';
    case 'lefttop':
    default:
      return 'M0 0 L8 8 L0 8 Z';
  }
};

const getWrapperStyle = (
  position: BalloonTailProps['position'],
  width: number,
  height: number,
): ViewStyle => {
  const base: ViewStyle = {
    position: 'absolute',
    width,
    height,
  };

  switch (position) {
    case 'topleft':
      return { ...base, left: 0, top: -height };
    case 'topright':
      return { ...base, right: 0, top: -height };
    case 'topcenter':
      return { ...base, left: '50%', top: -height, marginLeft: width / 2 };
    case 'bottomcenter':
      return { ...base, left: '50%', bottom: -height, marginLeft: width / 2 };
    case 'bottomright':
      return { ...base, right: 0, bottom: -height };
    case 'lefttop':
      return { ...base, left: -width, top: 0 };
    default:
      return { ...base, left: 0, top: -height };
  }
};

const BalloonTail: React.FC<BalloonTailProps> = ({
  width = 8,
  height = 8,
  fillColor = 'rgba(209, 200, 194, 0.5)',
  position = 'topleft',
}) => {
  return (
    <View style={getWrapperStyle(position, width, height)} pointerEvents="none">
      <Svg width={width} height={height} viewBox="0 0 8 8">
        <Path d={getTailPath(position)} fill={fillColor} />
      </Svg>
    </View>
  );
};

export default BalloonTail;
