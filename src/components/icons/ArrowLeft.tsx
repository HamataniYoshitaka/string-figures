import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ArrowLeftIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ArrowLeftIcon: React.FC<ArrowLeftIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = '#292524',
  fillColor = '#292524',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M32 18.364C32.5523 18.364 33 18.8117 33 19.364C33 19.9162 32.5523 20.364 32 20.364V19.364V18.364ZM7.2929 20.0711C6.9024 19.6805 6.9024 19.0474 7.2929 18.6569L13.6569 12.2929C14.0474 11.9024 14.6805 11.9024 15.0711 12.2929C15.4616 12.6834 15.4616 13.3166 15.0711 13.7071L9.4142 19.364L15.0711 25.0208C15.4616 25.4113 15.4616 26.0445 15.0711 26.435C14.6805 26.8256 14.0474 26.8256 13.6569 26.435L7.2929 20.0711ZM32 19.364V20.364H8V19.364V18.364H32V19.364Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ArrowLeftIcon;

