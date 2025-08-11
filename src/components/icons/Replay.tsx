import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ReplayIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ReplayIcon: React.FC<ReplayIconProps> = ({
  width = 32,
  height = 32,
  strokeColor = '#57534D',
  fillColor = 'white',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 6.66666V1.33333L9.33337 7.99999L16 14.6667V9.33333C18.1218 9.33333 20.1566 10.1762 21.6569 11.6765C23.1572 13.1768 24 15.2116 24 17.3333C24 19.4551 23.1572 21.4899 21.6569 22.9902C20.1566 24.4905 18.1218 25.3333 16 25.3333C13.8783 25.3333 11.8435 24.4905 10.3432 22.9902C8.8429 21.4899 8.00004 19.4551 8.00004 17.3333H5.33337C5.33337 20.1623 6.45718 22.8754 8.45757 24.8758C10.458 26.8762 13.1711 28 16 28C18.829 28 21.5421 26.8762 23.5425 24.8758C25.5429 22.8754 26.6667 20.1623 26.6667 17.3333C26.6667 14.5044 25.5429 11.7912 23.5425 9.79085C21.5421 7.79047 18.829 6.66666 16 6.66666Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ReplayIcon;
