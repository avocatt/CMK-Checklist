import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Animated,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { checklistData as initialChecklistData } from '../data';
import { useChecklist } from '../hooks/useChecklist';
import { useTheme } from '../hooks/useTheme';
import { useExpandedSections } from '../hooks/useExpandedSections';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useLegalReferences } from '../hooks/useLegalReferences';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../App';
import {
  SearchBar,
  GeneralNotesSection,
  LegalReferenceModal,
  PhaseItem,
  QuestionNotesAggregateSection,
} from '../components/ChecklistScreen';

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

  const [generalNotesValue, setGeneralNotesValue] = useState<string>('');
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

  // Use custom hooks
  const { searchQuery, setSearchQuery, filteredData } = useSearchFilter(initialChecklistData);
  const { selectedKeyword, handleKeywordTap, closeModal } = useLegalReferences();
  
  const allPhaseIds = initialChecklistData.map(p => p.id);
  const allSubCategoryIds = initialChecklistData.flatMap(p => p.subCategories.map(sc => sc.id));
  
  const {
    expandedPhases,
    expandedSubCategories,
    togglePhase,
    toggleSubCategory,
    toggleAll,
    resetExpanded,
    areAllExpanded,
  } = useExpandedSections(filteredData, searchQuery, allPhaseIds, allSubCategoryIds);


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

            await resetActiveChecklistProgress();
            resetExpanded();
            setQuestionNotesValue({});
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






  // New: Handle tapping a question tag in general notes
  const handleQuestionTagTap = useCallback((questionId: string) => {
    const targetY = questionPositions.current[questionId];
    if (scrollViewRef.current && targetY !== undefined) {
      scrollViewRef.current.scrollTo({ y: targetY - 100, animated: true }); // -100 for some padding
    } else {
      // Question ID not found for scrolling
    }
  }, []); // Depend on nothing as refs are stable




  if (checklistLoading || !activeChecklist) {
    return (
      <View style={[styles.container, styles.centered, {backgroundColor: colors.background}]}>
        <Text style={{color: colors.text}}>Görev yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.fullFlex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Main Sticky Header */}
      <View style={[styles.headerSection, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleAll={toggleAll}
          onReset={handleReset}
          areAllExpanded={areAllExpanded}
        />
        <GeneralNotesSection
          generalNotesValue={generalNotesValue}
          onGeneralNotesChange={handleGeneralNotesChange}
          isExpanded={isGeneralNotesExpanded}
          onToggleExpanded={() => setIsGeneralNotesExpanded(prev => !prev)}
        />
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef} // Assign ref here
      >
        {filteredData.map((phase) => (
          <PhaseItem
            key={phase.id}
            phase={phase}
            isExpanded={expandedPhases.includes(phase.id)}
            expandedSubCategories={expandedSubCategories}
            answers={answers}
            questionNotes={questionNotesValue}
            searchQuery={searchQuery}
            onToggle={togglePhase}
            onToggleSubCategory={toggleSubCategory}
            onAnswer={handleAnswer}
            onQuestionNoteChange={handleQuestionNoteChange}
            onKeywordTap={handleKeywordTap}
            onQuestionTagTap={handleQuestionTagTap}
            onQuestionLayout={(questionId, y) => {
              questionPositions.current[questionId] = y;
            }}
          />
        ))}
        <QuestionNotesAggregateSection
          questionNotes={activeChecklist?.questionNotes || {}}
          searchQuery={searchQuery}
          onKeywordTap={handleKeywordTap}
          onQuestionTagTap={handleQuestionTagTap}
        />
      </Animated.ScrollView>
      <LegalReferenceModal
        selectedKeyword={selectedKeyword}
        onClose={closeModal}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  scrollView: {
    flex: 1,
    paddingTop: 0, // Remove padding from scrollview as headerSection now handles top content
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullFlex: {
    flex: 1,
  },
}); 