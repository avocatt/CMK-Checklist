import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  Animated,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { checklistData as initialChecklistData } from '../data';
import { legalReferences } from '../data';
import { useChecklist } from '../hooks/useChecklist';
import { useTheme } from '../hooks/useTheme';
import { Phase, SubCategory, ChecklistItem } from '../types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App'; // Import RootStackParamList
import { Ionicons } from '@expo/vector-icons'; // Ensure Ionicons is imported

type ChecklistScreenRouteProp = RouteProp<RootStackParamList, 'Checklist'>;

export default function ChecklistScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChecklistScreenRouteProp>();
  const { caseId, caseName } = route.params;

  const {
    loading: checklistLoading,
    activeChecklist,
    answers,
    answerQuestion,
    resetActiveChecklistProgress,
    selectChecklist,
    updateGeneralNotes,
    updateQuestionNote, // New: For updating question-specific notes
    loadAllChecklists, // Make sure this is available if needed directly
  } = useChecklist();

  // State for expansion: one for phases, one for sub-categories
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);

  const [generalNotesValue, setGeneralNotesValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<{ word: string, note: string } | null>(null);
  const [isGeneralNotesExpanded, setIsGeneralNotesExpanded] = useState<boolean>(false);
  const [questionNotesValue, setQuestionNotesValue] = useState<Record<string, string>>({}); // New: State for individual question notes

  // New: Refs for scrolling to questions
  const scrollViewRef = useRef<ScrollView>(null);
  const questionPositions = useRef<Record<string, number>>({});

  // Theme hook
  const { isDarkMode, colors } = useTheme();

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));

  // Select the active checklist when the component mounts or caseId changes
  useEffect(() => {
    loadAllChecklists().then(() => { // Ensure checklists are loaded before selecting
        if (caseId) {
            selectChecklist(caseId);
        }
    });
  }, [caseId, selectChecklist, loadAllChecklists]);


  React.useEffect(() => {
    navigation.setOptions({
      title: activeChecklist?.name || caseName || 'CMK Kontrol Listesi',
      headerStyle: {
        backgroundColor: colors.background,
        borderBottomWidth: isDarkMode ? 1 : StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
      },
      // Optionally, add a back button handler if you need to perform actions on back press
    });
  }, [isDarkMode, navigation, colors, activeChecklist, caseName]);

  // Initialize generalNotesValue and questionNotesValue from activeChecklist's notes
  React.useEffect(() => {
    if (activeChecklist) {
      setGeneralNotesValue(activeChecklist.generalNotes || '');
      setQuestionNotesValue(activeChecklist.questionNotes || {}); // Initialize question notes
    } else {
      // Reset if no active checklist (e.g., after deletion and navigation)
      setGeneralNotesValue('');
      setQuestionNotesValue({}); // Reset question notes
    }
  }, [activeChecklist]); // Depend on activeChecklist

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return initialChecklistData;

    return initialChecklistData.map(phase => ({
      ...phase,
      subCategories: phase.subCategories.map(subCategory => ({
        ...subCategory,
        items: subCategory.items.filter(item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(subCategory => subCategory.items.length > 0),
    })).filter(phase => phase.subCategories.length > 0);
  }, [searchQuery, initialChecklistData]); // Use initialChecklistData

  // Effect to expand phases and subcategories with matching items on search
  React.useEffect(() => {
    if (searchQuery && filteredData) { // Ensure filteredData is available
      const matchingPhaseIds = new Set<string>();
      const matchingSubCategoryIds = new Set<string>();

      filteredData.forEach(phase => {
        let phaseHasMatch = false;
        phase.subCategories.forEach(subCategory => {
          if (subCategory.items.length > 0) { // items are already filtered by search query
            matchingSubCategoryIds.add(subCategory.id);
            phaseHasMatch = true;
          }
        });
        if (phaseHasMatch) {
          matchingPhaseIds.add(phase.id);
        }
      });

      setExpandedPhases(prev => [...new Set([...prev, ...Array.from(matchingPhaseIds)])]);
      setExpandedSubCategories(prev => [...new Set([...prev, ...Array.from(matchingSubCategoryIds)])]);
    }
  }, [searchQuery, filteredData]); // Add filteredData to dependencies

  // Handle reset
  const handleReset = () => {
    Alert.alert(
      'Yanıtları Sıfırla',
      `"${activeChecklist?.name || 'Bu görev'}" için tüm yanıtlarınız silinecek. Emin misiniz? (Genel notlar etkilenmeyecektir.)`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            Animated.sequence([
              Animated.timing(fadeAnim, {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();

            await resetActiveChecklistProgress(); // This now resets only the active checklist's answers
            setExpandedPhases([]);
            setExpandedSubCategories([]);
            setQuestionNotesValue({}); // Reset question notes
          },
        },
      ],
    );
  };

  const handleAnswer = (id: string) => {
    if (!activeChecklist) return;
    const currentAnswer = activeChecklist.answers[id] as boolean | undefined;
    answerQuestion(id, !currentAnswer); // Toggle boolean for 'yesNo' type
  };



  const handleGeneralNotesChange = useCallback((text: string) => {
    setGeneralNotesValue(text);
    // Consider debouncing this if performance is an issue for very long notes
    updateGeneralNotes(text);
  }, [updateGeneralNotes]);

  // New: Handle question-specific notes
  const handleQuestionNoteChange = useCallback((id: string, text: string) => {
    setQuestionNotesValue(prev => {
      const newNotes = { ...prev, [id]: text };
      if (text.trim() === '') {
        delete newNotes[id]; // Remove from local state if empty
      }
      return newNotes;
    });
    // Debounce or immediately save, depending on desired behavior
    updateQuestionNote(id, text);
  }, [updateQuestionNote]);



  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  // Toggle sub-category expansion
  const toggleSubCategory = (subCategoryId: string) => {
    setExpandedSubCategories(prev =>
      prev.includes(subCategoryId)
        ? prev.filter(id => id !== subCategoryId)
        : [...prev, subCategoryId]
    );
  };

  // Toggle all (phases and their subcategories)
  const toggleAll = () => {
    const allPhaseIds = initialChecklistData.map(p => p.id);
    const allSubCategoryIds = initialChecklistData.flatMap(p => p.subCategories.map(sc => sc.id));

    if (expandedPhases.length === allPhaseIds.length && expandedSubCategories.length === allSubCategoryIds.length) {
      setExpandedPhases([]);
      setExpandedSubCategories([]);
    } else {
      setExpandedPhases(allPhaseIds);
      setExpandedSubCategories(allSubCategoryIds);
    }
  };

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedSearchQuery})`, 'gi'));

    return parts.map((part, i) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return {
          type: 'highlight',
          text: part,
          key: i
        };
      }
      return part;
    });
  };

  // processTextWithHighlighting and processText, handleKeywordTap remain largely the same,
  // just ensure they use `colors` for styling.

  const processTextWithHighlighting = (text: string) => {
    const highlightedParts = highlightText(text);

    if (typeof highlightedParts === 'string') {
      return processText(highlightedParts);
    }

    const keywords = [
      'TCK', 'PVSK', 'CMK',  // Main law codes
      '6136(?:\\s*[Ss][Kk])?', // Numbered laws with optional SK
      '2863(?:\\s*[Ss][Kk])?',
      '6713(?:\\s*[Ss][Kk])?'
    ];

    // Updated pattern to better handle EK and SK variations
    const keywordPattern = new RegExp(
      `(${keywords.map(k => k.replace(/\s+/g, '\\s+')).join('|')})` + // Law codes
      `(?:\\s*(?:(?:EK\\s+)?(?:m\\.?|madde)|(?:[Ss][Kk]\\s*(?:m\\.?|madde)?)|EK)?\\s*)` + // Optional connectors (m., madde, EK, SK m.)
      `(\\d+(?:[/.]\\d+)*)`, // Article numbers with optional subsections
      'gi'
    );

    const finalParts: (string | JSX.Element)[] = [];

    // Regex for question note tags (e.g., Q1, Q1.1, Q123)
    const questionTagPattern = /(Q\d+(?:\.\d+)?)/g;

    // Process each part from the search highlighting
    highlightedParts.forEach((part, index) => {
      if (typeof part === 'object' && part.type === 'highlight') {
        // This is a search highlight
        finalParts.push(
          <Text key={`highlight-${index}`} style={[styles.highlightedText, {
            backgroundColor: colors.highlightBackground,
            color: colors.highlightText
          }]}>
            {processText(part.text)}
          </Text>
        );
      } else if (typeof part === 'string') {
        // Process law references and new question note tags in non-highlighted text
        const combinedParts = part.split(keywordPattern); // First split by law keywords

        for (let j = 0; j < combinedParts.length; j++) {
          const currentCombinedPart = combinedParts[j];
          if (!currentCombinedPart) continue;

          // Check if it's a law keyword part
          if (keywords.some(k => currentCombinedPart.toUpperCase().match(new RegExp(k)))) {
            const keyword = currentCombinedPart.toUpperCase();
            const articlePart = (j + 1 < combinedParts.length) ? combinedParts[j + 1] : "";

            if (articlePart && /\d/.test(articlePart)) {
              finalParts.push(
                <Text
                  key={`${index}-${j}-${keyword}-${articlePart}`}
                  style={[styles.keyword, {color: colors.accent}]}
                  onPress={() => handleKeywordTap(keyword, articlePart)}
                >
                  {currentCombinedPart}{articlePart}
                </Text>
              );
              j++; // Skip the article part as it's consumed
            } else {
              finalParts.push(
                <Text
                  key={`${index}-${j}-${keyword}`}
                  style={[styles.keyword, {color: colors.accent}]}
                  onPress={() => handleKeywordTap(keyword, "")}
                >
                  {currentCombinedPart}
                </Text>
              );
            }
          } else {
            // Now, split by question tags within this part
            const qTagParts = currentCombinedPart.split(questionTagPattern);
            for (let k = 0; k < qTagParts.length; k++) {
              const currentQTagPart = qTagParts[k];
              if (!currentQTagPart) continue;

              if (currentQTagPart.match(questionTagPattern)) { // If it matches a Q[ID] tag
                const questionId = currentQTagPart.trim(); // "Q1", "Q2", etc.
                finalParts.push(
                  <Text
                    key={`${index}-${j}-${k}-${questionId}`}
                    style={[styles.questionTag, {color: colors.accentGreen}]} // New style for question tags
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

  // New: Handle tapping a question tag in general notes
  const handleQuestionTagTap = useCallback((questionId: string) => {
    const targetY = questionPositions.current[questionId];
    if (scrollViewRef.current && targetY !== undefined) {
      scrollViewRef.current.scrollTo({ y: targetY - 100, animated: true }); // -100 for some padding
    } else {
      console.warn(`Question ID ${questionId} not found for scrolling.`);
    }
  }, []); // Depend on nothing as refs are stable

  const handleKeywordTap = (keyword: string, articlePart: string) => {
    const normalizedArticlePart = articlePart.replace(/m\.|madde/gi, '').trim();
    const fullKey = `${keyword} ${normalizedArticlePart}`.trim();

    const reference = legalReferences[fullKey];
    if (reference) {
      setSelectedKeyword({
        word: fullKey,
        note: `${reference.title}\n\n${reference.content}`
      });
    } else {
      let defaultNote = '';
      switch (keyword) {
        case 'TCK': defaultNote = 'Türk Ceza Kanunu'; break;
        case 'PVSK': defaultNote = 'Polis Vazife ve Salahiyet Kanunu'; break;
        case 'CMK': defaultNote = 'Ceza Muhakemesi Kanunu'; break;
      }
      setSelectedKeyword({ word: keyword, note: defaultNote });
    }
  };

  const processText = (text: string) => {
    const keywords = [
      'TCK', 'PVSK', 'CMK',  // Main law codes
      '6136(?:\\s*[Ss][Kk])?', // Numbered laws with optional SK
      '2863(?:\\s*[Ss][Kk])?',
      '6713(?:\\s*[Ss][Kk])?'
    ];

    // Updated pattern to better handle EK and SK variations
    const keywordPattern = new RegExp(
      `(${keywords.map(k => k.replace(/\s+/g, '\\s+')).join('|')})` + // Law codes
      `(?:\\s*(?:(?:EK\\s+)?(?:m\\.?|madde)|(?:[Ss][Kk]\\s*(?:m\\.?|madde)?)|EK)?\\s*)` + // Optional connectors (m., madde, EK, SK m.)
      `(\\d+(?:[/.]\\d+)*)`, // Article numbers with optional subsections
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
              style={[styles.keyword, {color: colors.accent}]}
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
              style={[styles.keyword, {color: colors.accent}]}
            >
              {currentPart}
            </Text>
          );
          if (i + 1 < parts.length && articlePart === parts[i+1]) {
             i++;
          }
        }
      } else {
        processedParts.push(currentPart);
      }
    }
    return processedParts.length > 0 ? processedParts.map((p, idx) => <React.Fragment key={idx}>{p}</React.Fragment>) : null;
  };

  const allPhaseIds = initialChecklistData.map(p => p.id);
  const allSubCategoryIds = initialChecklistData.flatMap(p => p.subCategories.map(sc => sc.id));
  const areAllExpanded = expandedPhases.length === allPhaseIds.length && expandedSubCategories.length === allSubCategoryIds.length;

  if (checklistLoading || !activeChecklist) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: colors.text}}>Görev yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Main Sticky Header */}
      <View style={[styles.headerSection, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>

        {/* Search Input and Action Buttons Row */}
        <View style={styles.searchAndActionsRow}>
          <TextInput
            style={[styles.searchInput, {color: colors.text, backgroundColor: colors.background}]}
            placeholder="Kontrol listesinde ara..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={[styles.clearButtonText, {color: colors.textSecondary}]}>╳</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: colors.background}]}
            onPress={toggleAll}
          >
            <Text style={[styles.actionButtonText, {color: colors.accent}, styles.iconButtonText]}>
              {areAllExpanded ? '⤒' : '⤓'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: colors.background}]}
            onPress={handleReset}
          >
            <Text style={[styles.actionButtonText, {color: colors.accent}, styles.iconButtonText]}>
              ↺
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible General Notes Section */}
        <View style={[
          styles.generalNotesSection,
          {
            borderColor: colors.border
          }
        ]}>
          <TouchableOpacity
            style={styles.generalNotesHeader}
            onPress={() => setIsGeneralNotesExpanded(prev => !prev)}
          >
            <Text style={[styles.generalNotesTitle, {color: colors.text}]}>
              Genel Notlar
            </Text>
            <Ionicons
              name={isGeneralNotesExpanded ? 'chevron-down' : 'chevron-forward'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {isGeneralNotesExpanded && (
            <TextInput
              style={[styles.stickyGeneralNotesInput, {
                backgroundColor: colors.notesBackground,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={generalNotesValue}
              onChangeText={handleGeneralNotesChange}
              placeholder="Bu görevle ilgili genel notlarınızı buraya yazın..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
            />
          )}
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef} // Assign ref here
      >
        {filteredData.map((phase: Phase) => (
          <View key={phase.id} style={[styles.phaseContainer, {backgroundColor: colors.card}]}>
            <TouchableOpacity
              style={[styles.phaseHeader, {borderBottomColor: colors.border}]}
              onPress={() => togglePhase(phase.id)}
            >
              <Text style={[styles.phaseTitle, {color: colors.text}]}>
                {expandedPhases.includes(phase.id) ? '▾' : '▸'} {phase.name}
              </Text>
            </TouchableOpacity>
            {expandedPhases.includes(phase.id) && (
              <View style={styles.subCategoriesContainer}>
                {phase.subCategories.map(subCategory => (
                  <View key={subCategory.id} style={[styles.categoryContainer, {borderBottomColor: colors.border}]}>
                    <TouchableOpacity
                      style={[styles.categoryHeader, {backgroundColor: colors.card}]}
                      onPress={() => toggleSubCategory(subCategory.id)}
                    >
                      <Text style={[styles.categoryTitle, {color: colors.text}]}>
                        {expandedSubCategories.includes(subCategory.id) ? '▾' : '▸'} {subCategory.name}
                      </Text>
                    </TouchableOpacity>
                    {expandedSubCategories.includes(subCategory.id) && (
                      <View style={[styles.itemsContainer, {backgroundColor: colors.card}]}>
                        {subCategory.items.map((item: ChecklistItem, index: number) => (
                          <View
                            key={item.id}
                            onLayout={(event) => { // Capture layout for scrolling
                              questionPositions.current[item.id] = event.nativeEvent.layout.y;
                            }}
                            style={[
                              styles.questionContainer,
                              {borderBottomColor: colors.border},
                              index === subCategory.items.length - 1 && styles.questionContainerLast
                            ]}
                          >
                            {/* New wrapper for checkbox and text */}
                            <View style={styles.questionContentRow}>
                              {item.type === 'yesNo' && ( // Checkbox is only for yesNo questions
                                <TouchableOpacity
                                  style={styles.checkboxTouchable}
                                  onPress={() => handleAnswer(item.id)}
                                >
                                  <View style={[
                                    styles.checkboxVisual,
                                    { borderColor: colors.textSecondary },
                                    answers[item.id] === true && {
                                      backgroundColor: isDarkMode ? colors.accentGreen : colors.accent, // Checked state background
                                      borderColor: isDarkMode ? colors.accentGreen : colors.accent, // Checked state border
                                    }
                                  ]}>
                                    {answers[item.id] === true && (
                                      <Ionicons
                                        name="checkmark-outline" // Checkmark icon
                                        size={20}
                                        color="white" // White checkmark for contrast
                                      />
                                    )}
                                  </View>
                                </TouchableOpacity>
                              )}
                              <Text style={[ // Display question text for all types
                                styles.questionText,
                                {color: colors.text},
                              ]}>
                                {processTextWithHighlighting(item.question)}
                              </Text>
                            </View>

                            {/* Conditional rendering for notes input for yesNo, and main text input for text type questions */}
                            <TextInput
                              style={[
                                item.type === 'text' ? styles.textInputAsAnswer : styles.questionNoteInput, // Use specific style based on type
                                {
                                  backgroundColor: colors.notesBackground, // Consistent note background
                                  borderColor: colors.border,
                                  color: colors.text
                                }
                              ]}
                              value={questionNotesValue[item.id] || ''}
                              onChangeText={(text) => handleQuestionNoteChange(item.id, text)}
                              placeholder={item.type === 'text' ? "Cevabınızı buraya yazın..." : "Bu soruya özel not ekle..."}
                              placeholderTextColor={colors.placeholder}
                              multiline
                              // numberOfLines removed
                            />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        {/* New: Display aggregated question notes */}
        {activeChecklist && Object.keys(activeChecklist.questionNotes || {}).length > 0 && (
          <View style={[styles.phaseContainer, { backgroundColor: colors.card, marginTop: 16 }]}>
            <View style={[styles.phaseHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.phaseTitle, { color: colors.text }]}>
                Sorulara Eklenen Notlar
              </Text>
            </View>
            <View style={[styles.itemsContainer, { paddingHorizontal: 16, paddingVertical: 12 }]}>
              {Object.entries(activeChecklist.questionNotes || {}).map(([qId, noteContent]) => (
                <View key={`qn-${qId}`} style={styles.questionNoteAggregateItem}>
                  <Text style={[styles.questionText, { color: colors.text }]}>
                    {processTextWithHighlighting(`${qId}: ${noteContent}`)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Animated.ScrollView>
      <Modal
        visible={selectedKeyword !== null}
        transparent={Platform.OS === 'android'}
        animationType="slide"
        onRequestClose={() => setSelectedKeyword(null)}
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'} // iOS pageSheet for native feel
      >
        {Platform.OS === 'ios' ? (
          // iOS pageSheet - no overlay needed, modal fills from bottom
          <View style={[styles.modalContentIOS, {backgroundColor: colors.card}]}>
            <View style={[styles.modalHeader, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {selectedKeyword?.word}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedKeyword(null)}
                style={styles.modalCloseButton}
              >
                <Text style={[styles.modalCloseButtonText, {color: colors.accent}]}>╳</Text>
              </TouchableOpacity>
            </View>
            <ScrollView bounces={true} showsVerticalScrollIndicator={true}>
              <Text style={[styles.modalText, {color: colors.text}]}>
                {selectedKeyword?.note}
              </Text>
            </ScrollView>
          </View>
        ) : (
          // Android - transparent overlay with centered modal
          <View style={[styles.modalOverlay]}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
              <View style={[styles.modalHeader, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {selectedKeyword?.word}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedKeyword(null)}
                  style={styles.modalCloseButton}
                >
                  <Text style={[styles.modalCloseButtonText, {color: colors.accent}]}>╳</Text>
                </TouchableOpacity>
              </View>
              <ScrollView bounces={true} showsVerticalScrollIndicator={true}>
                <Text style={[styles.modalText, {color: colors.text}]}>
                  {selectedKeyword?.note}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  generalNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    // Removed marginBottom, handled by generalNotesHeader padding
  },
  generalNotesInput: {
    minHeight: 60, // Start with a decent height
    textAlignVertical: 'top', // Important for multiline on Android
    padding: 10,
    fontSize: 15,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  generalNotesSection: { // Now a sub-section of headerSection
    paddingHorizontal: 16,
    paddingVertical: 16, // Use vertical padding within this section
  },
  generalNotesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
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
  container: {
    flex: 1,
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 0 : RNStatusBar.currentHeight || 0, // Account for status bar on Android
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 0, // Padding now handled by children sections
    // Shadow properties remain as before
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
  searchAndActionsRow: { // New style to combine search and buttons
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8, // Small gap between search input and buttons
  },
  searchInput: {
    flex: 1, // Allow search input to take available space
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 10,
  },
  clearButton: {
    padding: 8,
    marginLeft: 4, // Keep small margin from search input
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
  scrollView: {
    flex: 1,
    paddingTop: 0, // Remove padding from scrollview as headerSection now handles top content
  },
  phaseContainer: {
    marginTop: 16, // Add back top margin for spacing between header and first phase
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
  subCategoriesContainer: {
    // No specific style needed, just a wrapper
  },
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
  questionContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  questionContainerLast: {
    borderBottomWidth: 0,
  },
  questionContentRow: { // New: For checkbox and question text
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Space between question and its note/answer input
  },
  checkboxTouchable: {
    marginRight: 12, // Space between checkbox and text
    padding: 4, // Hit area
  },
  checkboxVisual: {
    width: 22,
    height: 22,
    borderRadius: 4, // Changed to square with slight round for checkbox
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    // Background and border colors handled by inline styles
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  highlightedText: { // Base style, specific colors applied inline
    borderRadius: 3,
  },
  keyword: { // Base style, specific color applied inline
    textDecorationLine: 'underline',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  questionNoteInput: { // Style for question-specific notes (now only for yesNo)
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 40,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  textInputAsAnswer: { // New: Style for text questions whose content is now an answer
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44, // Single line look
    marginTop: 8,
    textAlignVertical: 'top',
  },
  questionNoteAggregateItem: { // New style for aggregated question notes
    paddingVertical: 8,
  },
  questionTag: { // New style for clickable question tags
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background for Android
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%', // For Android
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  modalContentIOS: {
    flex: 1, // Take full height for pageSheet
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
  modalCloseButton: {
    padding: 8, // Easier to tap
  },
  modalCloseButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 