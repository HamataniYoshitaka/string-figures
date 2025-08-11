import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface HardIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const HardIcon: React.FC<HardIconProps> = ({
  width = 24,
  height = 25,
  strokeColor = '#57534D',
  fillColor = 'none',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 25" fill="none">
      <Path
        d="M14.3308 14.3046C15.7989 8.43409 15.7989 4.26422 11.3946 7.19946C6.99019 10.1347 8.45832 14.5376 12.1286 16.0052C15.7989 17.4728 18.7352 11.6023 14.3308 8.6671C9.92644 5.73186 2.58582 11.6023 5.52207 15.2714C8.45832 18.9404 12.8627 16.0052 11.3946 10.1347C9.92644 4.26424 4.05394 4.26424 2.58581 11.6023C2.04519 14.3046 2.58581 16.0786 5.52206 17.5462C8.45832 19.0138 11.3946 11.3693 14.3308 14.3046ZM14.3308 14.3046C12.8627 20.175 16.6798 21.8757 18.148 16.0052C19.6161 10.1347 19.0707 5.97175 14.6663 8.90699C10.262 11.8422 15.2117 11.9692 18.148 12.703C21.0842 13.4369 22.4789 12.3362 21.0108 15.2714C19.5427 18.2066 17.2671 17.2398 14.3308 14.3046Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default HardIcon;
