import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface PlayIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const PlayIcon: React.FC<PlayIconProps> = ({
  width = 30,
  height = 36,
  strokeColor = 'white',
  fillColor = 'none',
  strokeWidth = 2,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 36" fill="none">
      <Path
        d="M1 33.5879L1 2.41211L28 18L1 33.5879Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default PlayIcon;
