import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BalloonTailProps {
  width?: number;
  height?: number;
  fillColor?: string;
  position?: 'topleft' | 'topright' | 'topcenter' | 'lefttop';
}

const BalloonTail: React.FC<BalloonTailProps> = ({
  width = 8,
  height = 8,
  fillColor = 'rgba(209, 200, 194, 0.5)',
  position = 'topleft',
}) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 8 8"
      style={{
        position: 'absolute',
        left: position === 'topleft' ? 0 : position === 'lefttop' ? -8 : position === 'topcenter' ? '50%': 'auto',
        right: position === 'topright' ? 0 : 'auto',
        top: position === 'lefttop' ? 0 : -8,
        transform: position === 'topcenter' ? [{ translateX: '50%' }] : undefined,
      }}
    >
      <Path
        d={
          position === 'topleft' 
            ? "M0 0 L0 8 L8 8 Z"
            : position === 'topright' 
              ? "M8 0 L8 8 L0 8 Z"
              : position === 'topcenter' 
                ? "M4 0 L0 8 L8 8 Z"
                : "M0 0 L8 8 L0 8 Z"
        }
        fill={fillColor}
      />
    </Svg>
  );
};

export default BalloonTail;
