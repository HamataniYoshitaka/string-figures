import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface BookmarkIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({
  width = 24,
  height = 24,
  strokeColor = '#FFFFFF',
  fillColor = '#A6A09B',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 2.5C18.3745 2.5 19.5 3.61223 19.5 5V21C19.5 21.168 19.4155 21.3244 19.2754 21.417C19.1351 21.5095 18.9572 21.5262 18.8027 21.46L12 18.5439L5.19727 21.46C5.04278 21.5262 4.86492 21.5095 4.72461 21.417C4.58447 21.3244 4.5 21.168 4.5 21V5L4.5127 4.75293C4.56952 4.18063 4.82219 3.64265 5.23242 3.23242C5.70126 2.76358 6.33696 2.5 7 2.5H17Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BookmarkIcon;
