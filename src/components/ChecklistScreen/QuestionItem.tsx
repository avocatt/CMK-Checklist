import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { ChecklistItem } from '../../types';
import { processTextWithHighlighting } from '../../utils/textProcessingUtils';

interface QuestionItemProps extends ViewProps {
  item: ChecklistItem;
  answer: boolean | string | undefined;
  questionNote: string;
  searchQuery: string;
  isLast: boolean;
  onAnswer: (id: string) => void;
  onQuestionNoteChange: (id: string, text: string) => void;
  onKeywordTap: (keyword: string, articlePart: string) => void;
  onQuestionTagTap: (questionId: string) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  item,
  answer,
  questionNote,
  searchQuery,
  isLast,
  onAnswer,
  onQuestionNoteChange,
  onKeywordTap,
  onQuestionTagTap,
  onLayout,
}) => {
  const { isDarkMode, colors } = useTheme();

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.questionContainer,
        { borderBottomColor: colors.border },
        isLast && styles.questionContainerLast,
      ]}
    >
      <View style={styles.questionContentRow}>
        {item.type === 'yesNo' && (
          <TouchableOpacity
            style={styles.checkboxTouchable}
            onPress={() => onAnswer(item.id)}
          >
            <View
              style={[
                styles.checkboxVisual,
                { borderColor: colors.textSecondary },
                answer === true && {
                  backgroundColor: isDarkMode ? colors.accentGreen : colors.accent,
                  borderColor: isDarkMode ? colors.accentGreen : colors.accent,
                },
              ]}
            >
              {answer === true && (
                <Ionicons
                  name="checkmark-outline"
                  size={20}
                  color="white"
                />
              )}
            </View>
          </TouchableOpacity>
        )}
        <Text style={[styles.questionText, { color: colors.text }]}>
          {processTextWithHighlighting(
            item.question,
            searchQuery,
            onKeywordTap,
            onQuestionTagTap,
            colors
          )}
        </Text>
      </View>

      <TextInput
        style={[
          item.type === 'text' ? styles.textInputAsAnswer : styles.questionNoteInput,
          {
            backgroundColor: colors.notesBackground,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={questionNote}
        onChangeText={(text) => onQuestionNoteChange(item.id, text)}
        placeholder={
          item.type === 'text'
            ? 'Cevabınızı buraya yazın...'
            : 'Bu soruya özel not ekle...'
        }
        placeholderTextColor={colors.placeholder}
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  questionContainerLast: {
    borderBottomWidth: 0,
  },
  questionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxTouchable: {
    marginRight: 12,
    padding: 4,
  },
  checkboxVisual: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  questionNoteInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 40,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  textInputAsAnswer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
    marginTop: 8,
    textAlignVertical: 'top',
  },
});