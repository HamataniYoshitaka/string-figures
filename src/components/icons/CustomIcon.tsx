import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface CustomIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const CustomIcon: React.FC<CustomIconProps> = ({
  width = 24,
  height = 25,
  strokeColor = '#57534D',
  fillColor = 'none',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 25" fill="none">
      <Path
        d="M7.03198 10.2039C8.50193 7.98596 14.5621 4.50731 16.032 8.20394C17.502 11.9006 11.032 18.7039 9.53202 13.7039C8.56037 10.4651 16.5621 8.50731 18.032 12.2039C19.654 16.2829 14.722 19.6878 11.1341 18.7908C6.80529 17.7086 4.54415 13.9578 7.03198 10.2039Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default CustomIcon;
