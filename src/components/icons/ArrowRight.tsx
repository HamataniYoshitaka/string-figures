import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ArrowRightIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = '#292524',
  fillColor = '#292524',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M8 18.364C7.44771 18.364 7 18.8117 7 19.364C7 19.9162 7.44771 20.364 8 20.364V19.364V18.364ZM32.7071 20.0711C33.0976 19.6805 33.0976 19.0474 32.7071 18.6569L26.3431 12.2929C25.9526 11.9024 25.3195 11.9024 24.9289 12.2929C24.5384 12.6834 24.5384 13.3166 24.9289 13.7071L30.5858 19.364L24.9289 25.0208C24.5384 25.4113 24.5384 26.0445 24.9289 26.435C25.3195 26.8256 25.9526 26.8256 26.3431 26.435L32.7071 20.0711ZM8 19.364V20.364H32V19.364V18.364H8V19.364Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ArrowRightIcon;

