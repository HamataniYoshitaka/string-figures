import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface SkipNextIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const SkipNextIcon: React.FC<SkipNextIconProps> = ({
  width = 32,
  height = 32,
  strokeColor = '#57534D',
  fillColor = 'white',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M21.3333 24H24V8H21.3333M8 24L19.3333 16L8 8V24Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default SkipNextIcon;
