import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ArrowUpIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const ArrowUpIcon: React.FC<ArrowUpIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = '#292524',
  fillColor = '#292524',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
      <Path
        d="M20.636 31C20.636 31.5523 20.1883 32 19.636 32C19.0838 32 18.636 31.5523 18.636 31H19.636H20.636ZM18.9289 6.2929C19.3195 5.9024 19.9526 5.9024 20.3431 6.2929L26.7071 12.6569C27.0976 13.0474 27.0976 13.6805 26.7071 14.0711C26.3166 14.4616 25.6834 14.4616 25.2929 14.0711L19.636 8.4142L13.9792 14.0711C13.5887 14.4616 12.9555 14.4616 12.565 14.0711C12.1744 13.6805 12.1744 13.0474 12.565 12.6569L18.9289 6.2929ZM19.636 31H18.636V7H19.636H20.636V31H19.636Z"
        stroke={strokeColor}
        fill={fillColor}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ArrowUpIcon;

