import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Phase } from '../../types';
import { SubCategoryItem } from './SubCategoryItem';

interface PhaseItemProps {
  phase: Phase;
  isExpanded: boolean;
  expandedSubCategories: string[];
  answers: Record<string, boolean | string>;
  questionNotes: Record<string, string>;
  searchQuery: string;
  onToggle: (id: string) => void;
  onToggleSubCategory: (id: string) => void;
  onAnswer: (id: string) => void;
  onQuestionNoteChange: (id: string, text: string) => void;
  onKeywordTap: (keyword: string, articlePart: string) => void;
  onQuestionTagTap: (questionId: string) => void;
  onQuestionLayout?: (questionId: string, y: number) => void;
}

export const PhaseItem: React.FC<PhaseItemProps> = ({
  phase,
  isExpanded,
  expandedSubCategories,
  answers,
  questionNotes,
  searchQuery,
  onToggle,
  onToggleSubCategory,
  onAnswer,
  onQuestionNoteChange,
  onKeywordTap,
  onQuestionTagTap,
  onQuestionLayout,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.phaseContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[styles.phaseHeader, { borderBottomColor: colors.border }]}
        onPress={() => onToggle(phase.id)}
      >
        <Text style={[styles.phaseTitle, { color: colors.text }]}>
          {isExpanded ? '▾' : '▸'} {phase.name}
        </Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.subCategoriesContainer}>
          {phase.subCategories.map((subCategory) => (
            <SubCategoryItem
              key={subCategory.id}
              subCategory={subCategory}
              isExpanded={expandedSubCategories.includes(subCategory.id)}
              answers={answers}
              questionNotes={questionNotes}
              searchQuery={searchQuery}
              onToggle={onToggleSubCategory}
              onAnswer={onAnswer}
              onQuestionNoteChange={onQuestionNoteChange}
              onKeywordTap={onKeywordTap}
              onQuestionTagTap={onQuestionTagTap}
              onQuestionLayout={onQuestionLayout}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  phaseContainer: {
    marginTop: 16,
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
  subCategoriesContainer: {},
});