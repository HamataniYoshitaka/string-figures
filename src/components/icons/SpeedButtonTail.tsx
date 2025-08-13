import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SpeedButtonTailProps {
  width?: number;
  height?: number;
  fillColor?: string;
  isBottom?: boolean;
}

const SpeedButtonTail: React.FC<SpeedButtonTailProps> = ({
  width = 8,
  height = 8,
  fillColor = 'rgba(208, 205, 205, 0.5)',
  isBottom = false,
}) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 8 8"
      style={{
        position: 'absolute',
        left: -8,
        top: isBottom ? 'auto' : 0,
        bottom: isBottom ? 0 : 'auto',
      }}
    >
      <Path
        d={isBottom ? "M8 0 L0 8 L8 8 Z" : "M8 0 L8 8 L0 0 Z" }
        fill={fillColor}
      />
    </Svg>
  );
};

export default SpeedButtonTail;
