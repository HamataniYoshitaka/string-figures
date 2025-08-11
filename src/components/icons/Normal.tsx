import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface NormalIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const NormalIcon: React.FC<NormalIconProps> = ({
  width = 24,
  height = 24,
  strokeColor = '#57534D',
  fillColor = 'none',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.0516 6.13803C13.9322 7.59255 10.3039 8.75786 12.2038 13.1674C13.4051 15.5531 17.1095 16.7023 19.0094 12.2928C20.6244 8.54466 2.23803 6.33753 4.13797 10.7471C6.03792 15.1566 13.1931 17.6606 16.4244 17.6606C19.6557 17.6606 17.3582 9.55937 14.5083 11.3232C11.6583 13.087 7.98416 18.2316 6.08421 16.4677C4.18427 14.7039 8.17093 4.68351 11.0516 6.13803Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default NormalIcon;
