import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ChevronRightIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = '#292524',
  fillColor = '#292524',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M25.5448 20.6042C26.1517 19.9944 26.1517 19.0056 25.5448 18.3957L15.6533 8.4574C15.0463 7.84753 14.0623 7.84753 13.4552 8.4574C12.8483 9.06726 12.8483 10.056 13.4552 10.6659L22.2477 19.5L13.4552 28.334C12.8483 28.9438 12.8483 29.9327 13.4552 30.5425C14.0623 31.1525 15.0463 31.1525 15.6533 30.5425L25.5448 20.6042Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ChevronRightIcon;

