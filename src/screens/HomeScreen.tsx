import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChecklist } from '../hooks/useChecklist';
import { useTheme } from '../hooks/useTheme';
import { CaseChecklist } from '../types';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

type RootStackParamList = {
  Home: undefined;
  Checklist: { caseId: string; caseName: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const {
    loading,
    allChecklists,
    createNewChecklist,
    deleteChecklist,
    loadAllChecklists,
    renameChecklist,
  } = useChecklist();
  const { isDarkMode, colors } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const isFocused = useIsFocused();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [editingChecklist, setEditingChecklist] = useState<CaseChecklist | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Memoize the sorted list
  const sortedChecklists = useMemo(() => {
    return [...allChecklists].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [allChecklists]);

  useEffect(() => {
    if (isFocused) {
      loadAllChecklists(); // Refresh list when screen comes into focus
    }
  }, [isFocused, loadAllChecklists]);
  
  useEffect(() => {
    // Set header options dynamically based on system theme
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      headerTitleStyle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
      },
    });
  }, [isDarkMode, navigation, colors]);


  const handleCreateNew = () => {
    setNewCaseName(''); // Reset name for new case
    setEditingChecklist(null); // Ensure not in rename mode
    setIsInputFocused(false); // Reset input focus state
    setModalVisible(true);
  };
  
  const handleRename = (checklist: CaseChecklist) => {
    setEditingChecklist(checklist);
    setRenamingName(checklist.name);
    setIsInputFocused(false); // Reset input focus state
    setModalVisible(true);
  };

  const submitModal = async () => {
    if (editingChecklist) { // Renaming existing checklist
      if (renamingName.trim()) {
        await renameChecklist(editingChecklist.id, renamingName.trim());
        setModalVisible(false);
        setEditingChecklist(null);
      } else {
        Alert.alert('Hata', 'Görev adı boş olamaz.');
      }
    } else { // Creating new checklist
      if (newCaseName.trim()) {
        const newId = await createNewChecklist(newCaseName.trim());
        if (newId) {
          navigation.navigate('Checklist', { caseId: newId, caseName: newCaseName.trim() });
        }
        setModalVisible(false);
        setNewCaseName('');
      } else {
        Alert.alert('Hata', 'Görev adı boş olamaz.');
      }
    }
  };


  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      `${name} Sil`,
      `"${name}" adlı görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteChecklist(id);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: CaseChecklist }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('Checklist', { caseId: item.id, caseName: item.name })}
    >
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
          Son Güncelleme: {new Date(item.lastUpdated).toLocaleString()}
        </Text>
      </View>
      <View style={styles.itemActionsContainer}>
        <TouchableOpacity onPress={() => handleRename(item)} style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={20} color={colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !allChecklists.length) { // Show loading only on initial load and if no data yet
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Yükleniyor...</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {allChecklists.length === 0 && !loading ? (
         <View style={[styles.centered, { backgroundColor: colors.background, flex: 1 }]}>
            <Text style={[styles.emptyListText, { color: colors.textSecondary }]}>
            Henüz bir CMK görevi kaydetmediniz.
            </Text>
            <Text style={[styles.emptyListSubText, { color: colors.textSecondary }]}>
            Başlamak için '+' düğmesine dokunun.
            </Text>
        </View>
      ) : (
        <FlatList
          data={sortedChecklists}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={handleCreateNew}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingChecklist(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingChecklist ? "Görevi Yeniden Adlandır" : "Yeni CMK Görevi"}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: colors.inputBackground, 
                  color: colors.text,
                  borderColor: isInputFocused ? colors.accent : colors.border, // Dynamic border color
                }
              ]}
              placeholder="Görev Adı (Örn: Ahmet Yılmaz Dosyası)"
              placeholderTextColor={colors.placeholder}
              value={editingChecklist ? renamingName : newCaseName}
              onChangeText={editingChecklist ? setRenamingName : setNewCaseName}
              onFocus={() => setIsInputFocused(true)} // Set focus state
              onBlur={() => setIsInputFocused(false)} // Clear focus state
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.destructive }]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingChecklist(null);
                  setIsInputFocused(false); // Reset focus on close
                }}
              >
                <Text style={[styles.modalButtonText, {color: 'white'}]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={submitModal}
              >
                <Text style={[styles.modalButtonText, {color: 'white'}]}>{editingChecklist ? "Kaydet" : "Oluştur"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 80, // Space for FAB
    paddingTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Default light color, overridden by inline style
    padding: 18, // Increased padding
    marginVertical: 8, // Increased vertical spacing
    marginHorizontal: 12,
    borderRadius: 12, // Slightly larger border radius
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, // More prominent shadow offset
        shadowOpacity: 0.15, // Increased shadow opacity
        shadowRadius: 5, // Increased shadow radius
      },
      android: {
        elevation: 4, // Increased elevation for Android
      },
    }),
  },
  darkItemContainer: {
    backgroundColor: '#2C2C2E', // Will be overridden by inline style
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 18, // Increased font size
    fontWeight: '600', // Semibold
    color: '#000000', // Default light color, overridden by inline style
  },
  darkItemText: {
    color: '#FFFFFF', // Will be overridden by inline style
  },
  itemDate: {
    fontSize: 14, // Increased font size
    color: '#8A8A8E', // Default light color, overridden by inline style
    marginTop: 4,
  },
  darkItemDate: {
    color: '#8E8E93', // Will be overridden by inline style
  },
  itemActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // More prominent shadow offset
        shadowOpacity: 0.4, // Increased shadow opacity
        shadowRadius: 6, // Increased shadow radius
      },
      android: {
        elevation: 8, // Increased elevation for Android
      },
    }),
  },
  fabText: {
    fontSize: 28,
    color: 'white',
    lineHeight: 30
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyListSubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: 24, // Increased padding
    borderRadius: 12, // Consistent border radius with cards
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 