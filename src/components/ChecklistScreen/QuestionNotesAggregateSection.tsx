import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { processTextWithHighlighting } from '../../utils/textProcessingUtils';

interface QuestionNotesAggregateSectionProps {
  questionNotes: Record<string, string>;
  searchQuery: string;
  onKeywordTap: (keyword: string, articlePart: string) => void;
  onQuestionTagTap: (questionId: string) => void;
}

export const QuestionNotesAggregateSection: React.FC<QuestionNotesAggregateSectionProps> = ({
  questionNotes,
  searchQuery,
  onKeywordTap,
  onQuestionTagTap,
}) => {
  const { colors } = useTheme();

  if (!questionNotes || Object.keys(questionNotes).length === 0) {
    return null;
  }

  return (
    <View style={[styles.phaseContainer, { backgroundColor: colors.card, marginTop: 16 }]}>
      <View style={[styles.phaseHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.phaseTitle, { color: colors.text }]}>
          Sorulara Eklenen Notlar
        </Text>
      </View>
      <View style={[styles.itemsContainer, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        {Object.entries(questionNotes).map(([qId, noteContent]) => (
          <View key={`qn-${qId}`} style={styles.questionNoteAggregateItem}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {processTextWithHighlighting(
                `${qId}: ${noteContent}`,
                searchQuery,
                onKeywordTap,
                onQuestionTagTap,
                colors
              )}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  phaseContainer: {
    marginBottom: 0,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  phaseHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  phaseTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  itemsContainer: {},
  questionNoteAggregateItem: {
    paddingVertical: 8,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
  },
});