import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface SkipPreviousIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const SkipPreviousIcon: React.FC<SkipPreviousIconProps> = ({
  width = 32,
  height = 32,
  strokeColor = '#57534D',
  fillColor = 'white',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M10.6667 24H8V8H10.6667M24 24L12.6667 16L24 8V24Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default SkipPreviousIcon;
