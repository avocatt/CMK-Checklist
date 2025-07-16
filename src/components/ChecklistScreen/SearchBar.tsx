import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onToggleAll: () => void;
  onReset: () => void;
  areAllExpanded: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onToggleAll,
  onReset,
  areAllExpanded,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.searchAndActionsRow}>
      <TextInput
        style={[styles.searchInput, { color: colors.text, backgroundColor: colors.background }]}
        placeholder="Kontrol listesinde ara..."
        placeholderTextColor={colors.placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {searchQuery !== '' && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onSearchChange('')}
        >
          <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>╳</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.background }]}
        onPress={onToggleAll}
      >
        <Text style={[styles.actionButtonText, { color: colors.accent }, styles.iconButtonText]}>
          {areAllExpanded ? '⤒' : '⤓'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.background }]}
        onPress={onReset}
      >
        <Text style={[styles.actionButtonText, { color: colors.accent }, styles.iconButtonText]}>
          ↺
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchAndActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 10,
  },
  clearButton: {
    padding: 8,
    marginLeft: 4,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  iconButtonText: {
    fontSize: 20,
  },
});