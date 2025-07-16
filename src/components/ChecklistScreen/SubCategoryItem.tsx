import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SubCategory, ChecklistItem } from '../../types';
import { QuestionItem } from './QuestionItem';

interface SubCategoryItemProps {
  subCategory: SubCategory;
  isExpanded: boolean;
  answers: Record<string, boolean | string>;
  questionNotes: Record<string, string>;
  searchQuery: string;
  onToggle: (id: string) => void;
  onAnswer: (id: string) => void;
  onQuestionNoteChange: (id: string, text: string) => void;
  onKeywordTap: (keyword: string, articlePart: string) => void;
  onQuestionTagTap: (questionId: string) => void;
  onQuestionLayout?: (questionId: string, y: number) => void;
}

export const SubCategoryItem: React.FC<SubCategoryItemProps> = ({
  subCategory,
  isExpanded,
  answers,
  questionNotes,
  searchQuery,
  onToggle,
  onAnswer,
  onQuestionNoteChange,
  onKeywordTap,
  onQuestionTagTap,
  onQuestionLayout,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.categoryContainer, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.categoryHeader, { backgroundColor: colors.card }]}
        onPress={() => onToggle(subCategory.id)}
      >
        <Text style={[styles.categoryTitle, { color: colors.text }]}>
          {isExpanded ? '▾' : '▸'} {subCategory.name}
        </Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={[styles.itemsContainer, { backgroundColor: colors.card }]}>
          {subCategory.items.map((item: ChecklistItem, index: number) => (
            <QuestionItem
              key={item.id}
              item={item}
              answer={answers[item.id]}
              questionNote={questionNotes[item.id] || ''}
              searchQuery={searchQuery}
              isLast={index === subCategory.items.length - 1}
              onAnswer={onAnswer}
              onQuestionNoteChange={onQuestionNoteChange}
              onKeywordTap={onKeywordTap}
              onQuestionTagTap={onQuestionTagTap}
              onLayout={
                onQuestionLayout
                  ? (event) => onQuestionLayout(item.id, event.nativeEvent.layout.y)
                  : undefined
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});