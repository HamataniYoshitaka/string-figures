import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface CheckIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const CheckIcon: React.FC<CheckIconProps> = ({
  width = 32,
  height = 32,
  strokeColor = '#79716B',
  fillColor = '#79716B',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default CheckIcon;

