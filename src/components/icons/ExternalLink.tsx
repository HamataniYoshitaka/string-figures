import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ExternalLinkIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ExternalLinkIcon: React.FC<ExternalLinkIconProps> = ({
  width = 18,
  height = 18,
  strokeColor = '#57534D',
  fillColor = 'none',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
      <Path
        d="M15 3H10.5M15 3V7.5M15 3L9 9M6.75 3H4.5C3.67157 3 3 3.67157 3 4.5V13.5C3 14.3284 3.67157 15 4.5 15H13.5C14.3284 15 15 14.3284 15 13.5V11.25"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ExternalLinkIcon;

