import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

interface DropDownMenuItem {
  id: string;
  label: string;
  value?: string;
  onPress: () => void;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  items: DropDownMenuItem[];
  buttonPosition: { x: number; y: number };
}

const DropDownMenu: React.FC<Props> = ({ 
  isVisible, 
  onClose, 
  items, 
  buttonPosition 
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View 
              style={[
                styles.menuContainer,
                {
                  top: buttonPosition.y + 40, // メニューボタンの下に表示
                  right: 20, // 右端から20pxの位置
                }
              ]}
            >
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === items.length - 1 && styles.lastMenuItem
                  ]}
                  onPress={() => {
                    item.onPress();
                    onClose();
                  }}
                >
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.value && (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 180,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    fontSize: 14,
    color: '#333333',
  },
  menuValue: {
    fontSize: 14,
    color: '#666666',
  },
});

export default DropDownMenu;
