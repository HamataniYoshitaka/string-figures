import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface TutorialIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const TutorialIcon: React.FC<TutorialIconProps> = ({
  width = 24,
  height = 24,
  strokeColor = '#57534D',
  fillColor = 'none',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.50003 5.50002C9.50003 5.50002 2.00003 10.5001 8.00002 16.5001C14 22.5001 21.7955 15.6549 18 11.5C14.2045 7.34508 11.5 12.1552 11.5 12.1552"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default TutorialIcon;
