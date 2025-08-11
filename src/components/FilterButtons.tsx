import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { EasyIcon, NormalIcon, HardIcon } from './icons';

interface FilterButtonsProps {
  selectedFilters: ('easy' | 'medium' | 'hard')[];
  onToggleFilter: (filter: 'easy' | 'medium' | 'hard') => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  selectedFilters,
  onToggleFilter,
}) => {
  return (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
      style={styles.filterScrollView}
    >
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('easy') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('easy')}
      >
        <EasyIcon 
          width={28} 
          height={28} 
          strokeColor={selectedFilters.includes('easy') ? '#ffffff' : '#57534D'} 
          strokeWidth={1}
        />
        <Text style={[
          styles.filterText, 
          selectedFilters.includes('easy') ? styles.filterTextSelected : styles.filterTextUnselected
        ]}>
          かんたん
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('medium') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('medium')}
      >
        <NormalIcon
          width={28}
          height={28}
          strokeColor={selectedFilters.includes('medium') ? '#ffffff' : '#57534D'}
          strokeWidth={1}
        />
        <Text style={[
          styles.filterText, 
          selectedFilters.includes('medium') ? styles.filterTextSelected : styles.filterTextUnselected
        ]}>
          ふつう
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.filterButton, 
          selectedFilters.includes('hard') ? styles.filterButtonSelected : styles.filterButtonUnselected
        ]}
        onPress={() => onToggleFilter('hard')}
      >
        <HardIcon
          width={28}
          height={28}
          strokeColor={selectedFilters.includes('hard') ? '#ffffff' : '#57534D'}
          strokeWidth={1}
        />
        <Text style={[
          styles.filterText, 
          selectedFilters.includes('hard') ? styles.filterTextSelected : styles.filterTextUnselected
        ]}>
          むずかしい
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterScrollView: {
    paddingBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 10,
    paddingEnd: 14,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  filterButtonSelected: {
    backgroundColor: '#57534D',
  },
  filterButtonUnselected: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 16,
  },
  filterTextSelected: {
    color: '#ffffff',
  },
  filterTextUnselected: {
    color: '#57534D',
  },
});

export default FilterButtons;
