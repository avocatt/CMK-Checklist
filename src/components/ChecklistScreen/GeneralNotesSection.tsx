import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface GeneralNotesSectionProps {
  generalNotesValue: string;
  onGeneralNotesChange: (text: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const GeneralNotesSection: React.FC<GeneralNotesSectionProps> = ({
  generalNotesValue,
  onGeneralNotesChange,
  isExpanded,
  onToggleExpanded,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.generalNotesSection, { borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.generalNotesHeader}
        onPress={onToggleExpanded}
      >
        <Text style={[styles.generalNotesTitle, { color: colors.text }]}>
          Genel Notlar
        </Text>
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {isExpanded && (
        <TextInput
          style={[
            styles.stickyGeneralNotesInput,
            {
              backgroundColor: colors.notesBackground,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={generalNotesValue}
          onChangeText={onGeneralNotesChange}
          placeholder="Bu görevle ilgili genel notlarınızı buraya yazın..."
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={3}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  generalNotesSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  generalNotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  generalNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stickyGeneralNotesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    padding: 10,
    fontSize: 15,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
});