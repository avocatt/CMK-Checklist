import React, { useState, useCallback, useMemo } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checklistData } from '../data/checklist';
import { legalReferences } from '../data/legalReferences';

type Answer = {
  [key: string]: string | boolean;
};

type Notes = {
  [key: string]: string;
};

export default function ChecklistScreen() {
  const [answers, setAnswers] = useState<Answer>({});
  const [notes, setNotes] = useState<Notes>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [textInputValue, setTextInputValue] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<{ word: string, note: string } | null>(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));

  // Load saved answers when component mounts
  React.useEffect(() => {
    loadAnswers();
    loadNotes();
  }, []);

  // Effect to expand categories with matching items
  React.useEffect(() => {
    if (searchQuery) {
      const matchingCategories = filteredData
        .filter(category => category.items.length > 0)
        .map(category => category.id);
      setExpandedCategories(prev => [...new Set([...prev, ...matchingCategories])]);
    }
  }, [searchQuery]);

  // Load answers from AsyncStorage
  const loadAnswers = async () => {
    try {
      const savedAnswers = await AsyncStorage.getItem('checklist_answers');
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  };

  // Load notes from AsyncStorage
  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('checklist_notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Save answers to AsyncStorage
  const saveAnswers = async (newAnswers: Answer) => {
    try {
      await AsyncStorage.setItem('checklist_answers', JSON.stringify(newAnswers));
    } catch (error) {
      console.error('Error saving answers:', error);
    }
  };

  // Save notes to AsyncStorage
  const saveNotes = async (newNotes: Notes) => {
    try {
      await AsyncStorage.setItem('checklist_notes', JSON.stringify(newNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Handle reset
  const handleReset = () => {
    Alert.alert(
      'Tüm yanıtları sıfırla',
      'Tüm yanıtlarınız silinecek. Emin misiniz?',
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

            setAnswers({});
            setTextInputValue({});
            setNotes({});
            await AsyncStorage.removeItem('checklist_answers');
            await AsyncStorage.removeItem('checklist_notes');
          },
        },
      ],
    );
  };

  // Handle yes/no answer
  const handleAnswer = (id: string) => {
    const newAnswers = { ...answers, [id]: !answers[id] };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);
  };

  // Handle text input with debounced auto-save
  const handleTextChange = useCallback((id: string, text: string) => {
    setTextInputValue(prev => ({ ...prev, [id]: text }));
    const newAnswers = { ...answers, [id]: text };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);
  }, [answers]);

  // Handle notes
  const handleNoteChange = useCallback((id: string, note: string) => {
    const newNotes = { ...notes, [id]: note };
    setNotes(newNotes);
    saveNotes(newNotes);
  }, [notes]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    if (expandedCategories.length === checklistData.length) {
      setExpandedCategories([]);
    } else {
      setExpandedCategories(checklistData.map(category => category.id));
    }
  };

  // Filter items based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return checklistData;

    return checklistData.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(category => category.items.length > 0);
  }, [searchQuery, checklistData]);

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <Text key={i} style={styles.highlightedText}>{part}</Text>
      ) : (
        part
      )
    );
  };

  // Handle keyword tap
  const handleKeywordTap = (word: string) => {
    const reference = Object.entries(legalReferences).find(([key]) => key.startsWith(word));
    if (reference) {
      const [key, data] = reference;
      setSelectedKeyword({
        word: key,
        note: `${data.title}\n\n${data.content}`
      });
    } else {
      let defaultNote = '';
      switch (word) {
        case 'TCK':
          defaultNote = 'Türk Ceza Kanunu';
          break;
        case 'PVSK':
          defaultNote = 'Polis Vazife ve Salahiyet Kanunu';
          break;
        case 'CMK':
          defaultNote = 'Ceza Muhakemesi Kanunu';
          break;
      }
      setSelectedKeyword({ word, note: defaultNote });
    }
  };

  // Find and make keywords and their numbers tappable
  const processText = (text: string) => {
    const keywords = ['TCK', 'PVSK', 'CMK'];
    // Updated regex to capture the keyword and any numbers/characters that follow until a space or punctuation
    const keywordPattern = new RegExp(`(${keywords.join('|')})(\\s*\\d+(?:/\\d+)?)`, 'g');
    const parts = text.split(keywordPattern);
    
    return parts.map((part, i) => {
      // Check if this part is a keyword
      if (keywords.includes(part)) {
        const nextPart = parts[i + 1]; // This will be the number part
        return (
          <TouchableOpacity
            key={i}
            onPress={() => handleKeywordTap(part + nextPart)}
            style={styles.keywordContainer}
          >
            <Text style={styles.keyword}>{part}{nextPart}</Text>
          </TouchableOpacity>
        );
      }
      // Skip number parts as they're handled with the keywords
      if (parts[i - 1] && keywords.includes(parts[i - 1])) {
        return null;
      }
      return part;
    });
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
            placeholder="Ara..."
            placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
          onPress={toggleAllCategories}
        >
          <Text style={[styles.actionButtonText, isDarkMode && styles.darkActionButtonText]}>
            {expandedCategories.length === checklistData.length ? 'Daralt' : 'Genişlet'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
          onPress={handleReset}
        >
          <Text style={[styles.actionButtonText, isDarkMode && styles.darkActionButtonText]}>
            Sıfırla
          </Text>
        </TouchableOpacity>
      </View>
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
      >
        {filteredData.map(category => (
          <View key={category.id} style={[styles.categoryContainer, isDarkMode && styles.darkCategoryContainer]}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
            >
              <Text style={[styles.categoryTitle, isDarkMode && styles.darkText]}>
                {expandedCategories.includes(category.id) ? '▼' : '▶'} {category.name}
              </Text>
            </TouchableOpacity>
            {expandedCategories.includes(category.id) && (
              <View style={styles.itemsContainer}>
                {category.items.map(item => (
                  <View key={item.id} style={styles.questionContainer}>
                    {item.type === 'yesNo' ? (
                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => handleAnswer(item.id)}
                      >
                        <View style={[
                          styles.checkbox,
                          answers[item.id] && styles.checkboxSelected
                        ]}>
                          {answers[item.id] && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text style={[
                          styles.questionText,
                          isDarkMode && styles.darkText,
                          answers[item.id] && styles.questionTextSelected
                        ]}>
                          {processText(item.question)}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <Text style={[styles.questionText, isDarkMode && styles.darkText]}>
                          {processText(item.question)}
                        </Text>
                        <TextInput
                          style={[styles.textInput, isDarkMode && styles.darkTextInput]}
                          value={textInputValue[item.id] || ''}
                          onChangeText={(text) => handleTextChange(item.id, text)}
                          placeholder="Cevabınızı yazın..."
                          placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
                          multiline
                          numberOfLines={1}
                        />
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Animated.ScrollView>
      <TouchableOpacity
        style={styles.darkModeButton}
        onPress={() => setIsDarkMode(!isDarkMode)}
      >
        <Text style={styles.darkModeButtonText}>
          {isDarkMode ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={selectedKeyword !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedKeyword(null)}
      >
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <View style={[styles.modalHeader, isDarkMode && styles.darkModalHeader]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                {selectedKeyword?.word}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedKeyword(null)}
                style={styles.modalCloseButton}
              >
                <Text style={[styles.modalCloseButtonText, isDarkMode && styles.darkText]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView bounces={true} showsVerticalScrollIndicator={true}>
              <Text style={[styles.modalText, isDarkMode && styles.darkText]}>
                {selectedKeyword?.note}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  darkSearchContainer: {
    backgroundColor: '#1c1c1e',
    borderBottomColor: '#2c2c2e',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  darkSearchInput: {
    backgroundColor: '#2c2c2e',
    color: '#fff',
  },
  clearButton: {
    padding: 8,
    marginRight: 4,
  },
  clearButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  darkActionButton: {
    backgroundColor: '#2c2c2e',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  darkActionButtonText: {
    color: '#0A84FF',
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  darkCategoryContainer: {
    backgroundColor: '#1c1c1e',
  },
  categoryHeader: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  itemsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  questionContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionText: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    marginBottom: 12,
    lineHeight: 22,
  },
  questionTextSelected: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  highlightedText: {
    backgroundColor: '#FFE066',
    color: '#000',
  },
  keyword: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 17,
    backgroundColor: '#fff',
    color: '#000',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  darkTextInput: {
    backgroundColor: '#2c2c2e',
    borderColor: '#3a3a3c',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
    marginBottom: 40,
    marginHorizontal: 20,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'stretch',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    color: '#000',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  darkModalContent: {
    backgroundColor: '#1c1c1e',
    borderColor: '#2c2c2e',
  },
  darkModalHeader: {
    borderBottomColor: '#2c2c2e',
  },
  darkModeButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  darkModeButtonText: {
    fontSize: 20,
  },
  keywordContainer: {
    // Prevent the parent touchable from interfering
    zIndex: 1,
    // Make it inline
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 