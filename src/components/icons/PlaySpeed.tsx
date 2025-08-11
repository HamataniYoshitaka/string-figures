import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface PlaySpeedIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const PlaySpeedIcon: React.FC<PlaySpeedIconProps> = ({
  width = 24,
  height = 24,
  strokeColor = '#57534D',
  fillColor = '#292524',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2.05V4.05C17.39 4.59 20.5 8.58 19.96 12.97C19.5 16.61 16.64 19.5 13 19.93V21.93C18.5 21.38 22.5 16.5 21.95 11C21.5 6.25 17.73 2.5 13 2.03V2.05ZM5.67005 19.74C7.18005 21 9.04005 21.79 11 22V20C9.58005 19.82 8.23005 19.25 7.10005 18.37L5.67005 19.74ZM7.10005 5.74C8.22005 4.84 9.57005 4.26 11 4.06V2.06C9.05005 2.25 7.19005 3 5.67005 4.26L7.10005 5.74ZM5.69005 7.1L4.26005 5.67C3.00005 7.19 2.25005 9.04 2.05005 11H4.05005C4.24005 9.58 4.80005 8.23 5.69005 7.1ZM4.06005 13H2.06005C2.26005 14.96 3.03005 16.81 4.27005 18.33L5.69005 16.9C4.81005 15.77 4.24005 14.42 4.06005 13ZM10 16.5L16 12L10 7.5V16.5Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default PlaySpeedIcon;
