import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from 'react-native';
import { checklistData as initialChecklistData } from '../data'; // Renamed to avoid confusion
import { legalReferences } from '../data';
import { useChecklist } from '../hooks/useChecklist';
import { useTheme } from '../hooks/useTheme';
import { Phase, SubCategory, ChecklistItem } from '../types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App'; // Import RootStackParamList

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
    loadAllChecklists, // Make sure this is available if needed directly
  } = useChecklist();
  
  // State for expansion: one for phases, one for sub-categories
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);
  
  const [textInputValue, setTextInputValue] = useState<{ [key: string]: string }>({});
  const [generalNotesValue, setGeneralNotesValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<{ word: string, note: string } | null>(null);
  
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

  // Initialize textInputValue and generalNotesValue from activeChecklist's answers and notes
  React.useEffect(() => {
    if (activeChecklist) {
      const initialTextInputValues: { [key: string]: string } = {};
      initialChecklistData.forEach(phase => {
        phase.subCategories.forEach(subCategory => {
          for (const item of subCategory.items) {
            if (item.type === 'text' && activeChecklist.answers[item.id] && typeof activeChecklist.answers[item.id] === 'string') {
              initialTextInputValues[item.id] = activeChecklist.answers[item.id] as string;
            }
          }
        });
      });
      setTextInputValue(initialTextInputValues);
      setGeneralNotesValue(activeChecklist.generalNotes || '');
    } else {
      // Reset if no active checklist (e.g., after deletion and navigation)
      setTextInputValue({});
      setGeneralNotesValue('');
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
            // textInputValue will be updated by the useEffect watching activeChecklist
            setExpandedPhases([]); 
            setExpandedSubCategories([]);
          },
        },
      ],
    );
  };

  const handleAnswer = (id: string) => {
    if (!activeChecklist) return;
    const currentAnswer = activeChecklist.answers[id] as boolean | undefined;
    answerQuestion(id, !currentAnswer); // answerQuestion now works on activeChecklist
  };

  const handleTextChange = useCallback((id: string, text: string) => {
    if (!activeChecklist) return;
    setTextInputValue(prev => ({ ...prev, [id]: text }));
    answerQuestion(id, text); // answerQuestion now works on activeChecklist
  }, [answerQuestion, activeChecklist]);

  const handleGeneralNotesChange = useCallback((text: string) => {
    setGeneralNotesValue(text);
    // Consider debouncing this if performance is an issue for very long notes
    updateGeneralNotes(text);
  }, [updateGeneralNotes]);



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
        // Process law references in non-highlighted text
        const keywordParts = part.split(keywordPattern);
        
        for (let j = 0; j < keywordParts.length; j++) {
          const currentPart = keywordParts[j];
          if (!currentPart) continue;
          
          if (keywords.some(k => currentPart.toUpperCase().match(new RegExp(k)))) {
            const keyword = currentPart.toUpperCase();
            const articlePart = (j + 1 < keywordParts.length) ? keywordParts[j + 1] : "";
            
            if (articlePart && /\d/.test(articlePart)) {
              finalParts.push(
                <Text 
                  key={`${index}-${j}-${keyword}-${articlePart}`}
                  style={[styles.keyword, {color: colors.accent}]}
                  onPress={() => handleKeywordTap(keyword, articlePart)}
                >
                  {currentPart}{articlePart}
                </Text>
              );
              j++; 
            } else {
              finalParts.push(
                <Text
                  key={`${index}-${j}-${keyword}`}
                  style={[styles.keyword, {color: colors.accent}]}
                  onPress={() => handleKeywordTap(keyword, "")}
                >
                  {currentPart}
                </Text>
              );
              if (j + 1 < keywordParts.length && articlePart === keywordParts[j + 1]) {
                j++;
              }
            }
          } else {
            finalParts.push(currentPart);
          }
        }
      }
    });

    return finalParts.length > 0 ? finalParts.map((p, idx) => <React.Fragment key={idx}>{p}</React.Fragment>) : null;
  };

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
      <View style={[styles.searchContainer, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
        <View style={[
          styles.searchInputContainer,
          {backgroundColor: colors.background}
        ]}>
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
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
        </View>
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
      
      {/* Sticky General Notes Section */}
      <View style={[
        styles.stickyGeneralNotesContainer, 
        {
          backgroundColor: colors.card, 
          borderColor: colors.border
        }
      ]}>
        <Text style={[styles.generalNotesTitle, {color: colors.text}]}>Genel Notlar</Text>
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
      </View>
      
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        keyboardShouldPersistTaps="handled"
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
                            style={[
                              styles.questionContainer,
                              {borderBottomColor: colors.border},
                              index === subCategory.items.length - 1 && styles.questionContainerLast
                            ]}
                          >
                            {item.type === 'yesNo' ? (
                              <View style={styles.checkboxRow}>
                                <TouchableOpacity
                                  style={styles.checkboxTouchable}
                                  onPress={() => handleAnswer(item.id)}
                                >
                                  <View style={[
                                    styles.checkboxVisual,
                                    {borderColor: colors.textSecondary},
                                    answers[item.id] === true && (isDarkMode ? styles.checkboxFlaggedDark : styles.checkboxFlaggedLight)
                                  ]}>
                                    {answers[item.id] === true && (
                                      <Text style={[styles.flagIcon, isDarkMode && styles.darkFlagIcon]}>⚑</Text>
                                    )}
                                  </View>
                                </TouchableOpacity>
                                <Text style={[
                                  styles.questionText,
                                  {color: colors.text},
                                ]}>
                                  {processTextWithHighlighting(item.question)}
                                </Text>
                              </View>
                            ) : (
                              <>
                                <Text style={[styles.questionText, {color: colors.text}]}>
                                  {processTextWithHighlighting(item.question)}
                                </Text>
                                <TextInput
                                  style={[styles.textInput, {
                                      backgroundColor: colors.background, 
                                      borderColor: colors.border, 
                                      color: colors.text
                                  }]}
                                  value={textInputValue[item.id] || ''}
                                  onChangeText={(text) => handleTextChange(item.id, text)}
                                  placeholder="Cevabınızı yazın..."
                                  placeholderTextColor={colors.placeholder}
                                  multiline
                                />
                              </>
                            )}
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
      </Animated.ScrollView>
      <Modal
        visible={selectedKeyword !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedKeyword(null)}
      >
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
      </Modal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (most styles remain the same or are adapted with `colors.`)
  // Removed old generalNotesContainer - now using stickyGeneralNotesContainer
  generalNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  generalNotesInput: {
    minHeight: 60, // Start with a decent height
    textAlignVertical: 'top', // Important for multiline on Android
    padding: 10,
    fontSize: 15,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stickyGeneralNotesContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
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
  // darkContainer will be handled by inline style: {backgroundColor: colors.background}
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    // backgroundColor handled by inline style
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor handled by inline style
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor handled by inline style
    borderRadius: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    // color handled by inline style
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  clearButtonText: {
    // color handled by inline style
    fontSize: 18,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    // backgroundColor handled by inline style
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  actionButtonText: {
    // color handled by inline style
    fontSize: 16,
    fontWeight: '500',
  },
  iconButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  phaseContainer: {
    marginTop: 20, // Increased to account for sticky general notes
    marginBottom: 0, // Let subcategories or next phase define gap
    marginHorizontal: 16,
    // backgroundColor handled by inline style
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
    // borderBottomColor handled by inline style
  },
  phaseTitle: {
    fontSize: 17,
    fontWeight: '600',
    // color handled by inline style
  },
  // darkText handled by inline style on Text component
  subCategoriesContainer: {
    // No specific style needed, just a wrapper
  },
  categoryContainer: {
    // marginVertical: 6, // Removed to make it part of phase card
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor handled by inline style
  },
  categoryHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    // backgroundColor handled by inline style
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    // color handled by inline style
  },
  itemsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    // backgroundColor handled by inline style
  },
  questionContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor handled by inline style
  },
  questionContainerLast: {
    borderBottomWidth: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxTouchable: {
    marginRight: 12,
    padding: 4, // Hit area
  },
  checkboxVisual: {
    width: 22,
    height: 22,
    borderRadius: 11, // Make it circular
    borderWidth: 1.5,
    // borderColor handled by inline style
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  // darkCheckboxVisual handled by inline style
  checkboxFlaggedLight: { // This will be an object
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  checkboxFlaggedDark: { // This will be an object
    backgroundColor: '#FF453A',
    borderColor: '#FF453A',
  },
  flagIcon: {
    color: '#FFFFFF', // White flag icon for both modes
    fontSize: 16, // Adjust as needed
    lineHeight: 16, // For precise centering
  },
  darkFlagIcon: { // Only if different styling is needed for dark mode icon itself
    color: '#FFFFFF',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    // color handled by inline style
    lineHeight: 22,
  },
  highlightedText: { // Base style, specific colors applied inline
    // backgroundColor, color handled by inline
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
    // borderColor handled by inline style
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    // backgroundColor handled by inline style
    // color handled by inline style
    minHeight: 44, // Ensure decent tap target size
    marginTop: 8,
    textAlignVertical: 'top', // For multiline
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    // backgroundColor handled by inline style
    borderRadius: 12,
    overflow: 'hidden', // Ensures ScrollView respects borderRadius
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor and backgroundColor handled by inline
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    // color handled by inline
  },
  modalCloseButton: {
    padding: 8, // Easier to tap
  },
  modalCloseButtonText: {
    fontSize: 18,
    // color handled by inline
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color handled by inline
  },
  // darkModalContent, darkModalHeader handled by inline styles
}); 