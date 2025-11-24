import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ArrowDownIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ArrowDownIcon: React.FC<ArrowDownIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = '#292524',
  fillColor = '#292524',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M20.636 7C20.636 6.44771 20.1883 6 19.636 6C19.0838 6 18.636 6.44771 18.636 7H19.636H20.636ZM18.9289 31.7071C19.3195 32.0976 19.9526 32.0976 20.3431 31.7071L26.7071 25.3431C27.0976 24.9526 27.0976 24.3195 26.7071 23.9289C26.3166 23.5384 25.6834 23.5384 25.2929 23.9289L19.636 29.5858L13.9792 23.9289C13.5887 23.5384 12.9555 23.5384 12.565 23.9289C12.1744 24.3195 12.1744 24.9526 12.565 25.3431L18.9289 31.7071ZM19.636 7H18.636V31H19.636H20.636V7H19.636Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ArrowDownIcon;

