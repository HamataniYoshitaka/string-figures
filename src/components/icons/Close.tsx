import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface CloseIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const CloseIcon: React.FC<CloseIconProps> = ({
  width = 32,
  height = 32,
  strokeColor = '#79716B',
  fillColor = '#79716B',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M25.3333 8.54663L23.4533 6.66663L16 14.12L8.54663 6.66663L6.66663 8.54663L14.12 16L6.66663 23.4533L8.54663 25.3333L16 17.88L23.4533 25.3333L25.3333 23.4533L17.88 16L25.3333 8.54663Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default CloseIcon;
