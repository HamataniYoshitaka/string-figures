import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SpeedButtonTailProps {
  width?: number;
  height?: number;
  fillColor?: string;
  isBottom?: boolean;
  isRight?: boolean;
  isUp?: boolean;
}

const SpeedButtonTail: React.FC<SpeedButtonTailProps> = ({
  width = 8,
  height = 8,
  fillColor = 'rgba(209, 200, 194, 0.5)',
  isBottom = false,
  isRight = false,
  isUp = false,
}) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 8 8"
      style={{
        position: 'absolute',
        left: isUp ? 0 : (isRight ? 'auto' : -8),
        right: isRight && !isUp ? -8 : 'auto',
        top: isUp ? -8 : (isBottom ? 'auto' : 0),
        bottom: isBottom && !isUp ? 0 : 'auto',
      }}
    >
      <Path
        d={
          isUp 
            ? "M0 0 L0 8 L8 8 Z"
            : isRight 
              ? (isBottom ? "M0 0 L8 8 L0 8 Z" : "M0 0 L0 8 L8 0 Z")
              : (isBottom ? "M8 0 L0 8 L8 8 Z" : "M8 0 L8 8 L0 0 Z")
        }
        fill={fillColor}
      />
    </Svg>
  );
};

export default SpeedButtonTail;
