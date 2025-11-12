import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface CheckCircleOutlineIconProps {
  width?: number;
  height?: number;
  fillColor?: string;
}

const CheckCircleOutlineIcon: React.FC<CheckCircleOutlineIconProps> = ({
  width = 24,
  height = 24,
  fillColor = '#292524',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 80" fill="none">
      <Path
        d="M40.0001 6.66663C21.6667 6.66663 6.66675 21.6666 6.66675 40C6.66675 58.3333 21.6667 73.3333 40.0001 73.3333C58.3334 73.3333 73.3334 58.3333 73.3334 40C73.3334 21.6666 58.3334 6.66663 40.0001 6.66663ZM40.0001 66.6666C25.3001 66.6666 13.3334 54.7 13.3334 40C13.3334 25.3 25.3001 13.3333 40.0001 13.3333C54.7001 13.3333 66.6667 25.3 66.6667 40C66.6667 54.7 54.7001 66.6666 40.0001 66.6666ZM55.3001 25.2666L33.3334 47.2333L24.7001 38.6333L20.0001 43.3333L33.3334 56.6666L60.0001 30L55.3001 25.2666Z"
        fill={fillColor}
      />
    </Svg>
  );
};

export default CheckCircleOutlineIcon;






