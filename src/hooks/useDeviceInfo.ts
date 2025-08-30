import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export interface DeviceInfo {
  screenData: {
    width: number;
    height: number;
  };
  screenShortSide: number;
  isTablet: boolean;
  isDeviceLandscape: boolean;
}

export const useDeviceInfo = (): DeviceInfo => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const screenShortSide = Math.min(screenData.width, screenData.height);
  const isTablet = screenShortSide >= 600;
  const isDeviceLandscape = screenData.width > screenData.height;
  
  return {
    screenData,
    screenShortSide,
    isTablet,
    isDeviceLandscape,
  };
};
