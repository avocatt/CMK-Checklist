import React, { JSX } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ColorScheme } from '../hooks/useTheme';

interface ProcessedTextPart {
  type: 'highlight';
  text: string;
  key: number;
}

export const highlightText = (text: string, searchQuery: string): string | (string | ProcessedTextPart)[] => {
  if (!searchQuery) return text;

  const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedSearchQuery})`, 'gi'));

  return parts.map((part, i) => {
    if (part.toLowerCase() === searchQuery.toLowerCase()) {
      return {
        type: 'highlight' as const,
        text: part,
        key: i
      };
    }
    return part;
  });
};

export const processText = (
  text: string,
  handleKeywordTap: (keyword: string, articlePart: string) => void,
  colors: ColorScheme
) => {
  const keywords = [
    'TCK', 'PVSK', 'CMK',
    '6136(?:\\s*[Ss][Kk])?',
    '2863(?:\\s*[Ss][Kk])?',
    '6713(?:\\s*[Ss][Kk])?'
  ];

  const keywordPattern = new RegExp(
    `(${keywords.map(k => k.replace(/\s+/g, '\\s+')).join('|')})` +
    `(?:\\s*(?:(?:EK\\s+)?(?:m\\.?|madde)|(?:[Ss][Kk]\\s*(?:m\\.?|madde)?)|EK)?\\s*)` +
    `(\\d+(?:[/.]\\d+)*)`,
    'gi'
  );

  const parts = text.split(keywordPattern);

  const processedParts: (string | JSX.Element)[] = [];
  for (let i = 0; i < parts.length; i++) {
    const currentPart = parts[i];
    if (!currentPart) continue;

    if (keywords.some(k => currentPart.toUpperCase().match(new RegExp(k)))) {
      const keyword = currentPart.toUpperCase();
      const articlePart = (i + 1 < parts.length) ? parts[i + 1] : "";

      if (articlePart && /\d/.test(articlePart)) {
        processedParts.push(
          <Text
            key={`${i}-${keyword}-${articlePart}`}
            onPress={() => handleKeywordTap(keyword, articlePart)}
            style={[styles.keyword, { color: colors.accent }]}
          >
            {currentPart}{articlePart}
          </Text>
        );
        i++;
      } else {
        processedParts.push(
          <Text
            key={`${i}-${keyword}`}
            onPress={() => handleKeywordTap(keyword, "")}
            style={[styles.keyword, { color: colors.accent }]}
          >
            {currentPart}
          </Text>
        );
        if (i + 1 < parts.length && articlePart === parts[i + 1]) {
          i++;
        }
      }
    } else {
      processedParts.push(currentPart);
    }
  }
  return processedParts.length > 0 ? processedParts.map((p, idx) => <React.Fragment key={idx}>{p}</React.Fragment>) : null;
};

export const processTextWithHighlighting = (
  text: string,
  searchQuery: string,
  handleKeywordTap: (keyword: string, articlePart: string) => void,
  handleQuestionTagTap: (questionId: string) => void,
  colors: ColorScheme
) => {
  const highlightedParts = highlightText(text, searchQuery);

  if (typeof highlightedParts === 'string') {
    return processText(highlightedParts, handleKeywordTap, colors);
  }

  const keywords = [
    'TCK', 'PVSK', 'CMK',
    '6136(?:\\s*[Ss][Kk])?',
    '2863(?:\\s*[Ss][Kk])?',
    '6713(?:\\s*[Ss][Kk])?'
  ];

  const keywordPattern = new RegExp(
    `(${keywords.map(k => k.replace(/\s+/g, '\\s+')).join('|')})` +
    `(?:\\s*(?:(?:EK\\s+)?(?:m\\.?|madde)|(?:[Ss][Kk]\\s*(?:m\\.?|madde)?)|EK)?\\s*)` +
    `(\\d+(?:[/.]\\d+)*)`,
    'gi'
  );

  const finalParts: (string | JSX.Element)[] = [];
  const questionTagPattern = /(Q\d+(?:\.\d+)?)/g;

  highlightedParts.forEach((part, index) => {
    if (typeof part !== 'string' && part.type === 'highlight') {
      finalParts.push(
        <Text key={`highlight-${index}`} style={[styles.highlightedText, {
          backgroundColor: colors.highlightBackground,
          color: colors.highlightText
        }]}>
          {processText(part.text, handleKeywordTap, colors)}
        </Text>
      );
    } else if (typeof part === 'string') {
      const combinedParts = part.split(keywordPattern);

      for (let j = 0; j < combinedParts.length; j++) {
        const currentCombinedPart = combinedParts[j];
        if (!currentCombinedPart) continue;

        if (keywords.some(k => currentCombinedPart.toUpperCase().match(new RegExp(k)))) {
          const keyword = currentCombinedPart.toUpperCase();
          const articlePart = (j + 1 < combinedParts.length) ? combinedParts[j + 1] : "";

          if (articlePart && /\d/.test(articlePart)) {
            finalParts.push(
              <Text
                key={`${index}-${j}-${keyword}-${articlePart}`}
                style={[styles.keyword, { color: colors.accent }]}
                onPress={() => handleKeywordTap(keyword, articlePart)}
              >
                {currentCombinedPart}{articlePart}
              </Text>
            );
            j++;
          } else {
            finalParts.push(
              <Text
                key={`${index}-${j}-${keyword}`}
                style={[styles.keyword, { color: colors.accent }]}
                onPress={() => handleKeywordTap(keyword, "")}
              >
                {currentCombinedPart}
              </Text>
            );
          }
        } else {
          const qTagParts = currentCombinedPart.split(questionTagPattern);
          for (let k = 0; k < qTagParts.length; k++) {
            const currentQTagPart = qTagParts[k];
            if (!currentQTagPart) continue;

            if (currentQTagPart.match(questionTagPattern)) {
              const questionId = currentQTagPart.trim();
              finalParts.push(
                <Text
                  key={`${index}-${j}-${k}-${questionId}`}
                  style={[styles.questionTag, { color: colors.accentGreen }]}
                  onPress={() => handleQuestionTagTap(questionId)}
                >
                  {currentQTagPart}
                </Text>
              );
            } else {
              finalParts.push(currentQTagPart);
            }
          }
        }
      }
    }
  });

  return finalParts.length > 0 ? finalParts.map((p, idx) => <React.Fragment key={idx}>{p}</React.Fragment>) : null;
};

const styles = StyleSheet.create({
  highlightedText: {
    borderRadius: 3,
  },
  keyword: {
    textDecorationLine: 'underline',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  questionTag: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});