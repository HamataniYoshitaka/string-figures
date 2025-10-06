import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface SkipBackwardIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const SkipBackwardIcon: React.FC<SkipBackwardIconProps> = ({
  width = 32,
  height = 32,
  strokeColor = '#57534D',
  fillColor = 'white',
  strokeWidth = 0,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20,5V19L13,12M6,5V19H4V5M13,5V19L6,12"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default SkipBackwardIcon;
