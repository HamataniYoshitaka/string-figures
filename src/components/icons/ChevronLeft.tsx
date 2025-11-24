import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ChevronLeftIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = '#292524',
  fillColor = '#292524',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M13.4552 20.6042C12.8483 19.9944 12.8483 19.0056 13.4552 18.3957L23.3467 8.4574C23.9537 7.84753 24.9377 7.84753 25.5448 8.4574C26.1517 9.06726 26.1517 10.056 25.5448 10.6659L16.7523 19.5L25.5448 28.334C26.1517 28.9438 26.1517 29.9327 25.5448 30.5425C24.9377 31.1525 23.9537 31.1525 23.3467 30.5425L13.4552 20.6042Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ChevronLeftIcon;

