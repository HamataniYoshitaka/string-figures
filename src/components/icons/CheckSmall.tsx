import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface CheckSmallIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const CheckSmallIcon: React.FC<CheckSmallIconProps> = ({
  width = 8,
  height = 6,
  strokeColor = '#44403B',
  fillColor = 'none',
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 8 6" fill="none">
      <Path
        d="M0.468521 2.53027L2.96852 4.53027L6.96852 0.530273"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default CheckSmallIcon;

