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
import { useChecklist } from '../hooks/useChecklist';
import { CaseChecklist } from '../types';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Define Modern Clarity color palettes - Consistent with ChecklistScreen
const lightColors = {
  background: '#F2F2F7', // Apple System Gray 6
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8A8A8E', // Apple System Gray
  accent: '#007AFF', // Apple Blue
  border: '#D1D1D6', // Apple System Gray 4
  placeholder: '#C7C7CD', // Apple System Gray 2
  destructive: '#FF3B30', // Apple Red
  inputBackground: '#EFEFF4', // Slightly different for inputs if needed
};

const darkColors = {
  background: '#1C1C1E', // Apple System Gray 6 Dark
  card: '#2C2C2E', // Apple System Gray 5 Dark
  text: '#FFFFFF',
  textSecondary: '#8E8E93', // Apple System Gray Dark
  accent: '#0A84FF', // Apple Blue Dark
  border: '#38383A', // Apple System Gray 4 Dark
  placeholder: '#8E8E93',
  destructive: '#FF453A', // Apple Red Dark
  inputBackground: '#3A3A3C',
};

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
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const isFocused = useIsFocused();

  const [isDarkMode, setIsDarkMode] = useState(false); // Or use a global theme context
  const [modalVisible, setModalVisible] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [editingChecklist, setEditingChecklist] = useState<CaseChecklist | null>(null);
  const [renamingName, setRenamingName] = useState('');

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
    // Example: Set header options dynamically based on dark mode
    navigation.setOptions({
      headerStyle: {
        backgroundColor: isDarkMode ? darkColors.background : lightColors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: isDarkMode ? darkColors.border : lightColors.border,
      },
      headerTitleStyle: {
        color: isDarkMode ? darkColors.text : lightColors.text,
        fontSize: 17,
        fontWeight: '600',
      },
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={{ marginRight: 15 }}>
          <Text style={{ color: isDarkMode ? darkColors.accent : lightColors.accent, fontSize: 22 }}>
            {isDarkMode ? '☀️' : '☾'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [isDarkMode, navigation, lightColors, darkColors]);


  const handleCreateNew = () => {
    setNewCaseName(''); // Reset name for new case
    setEditingChecklist(null); // Ensure not in rename mode
    setModalVisible(true);
  };
  
  const handleRename = (checklist: CaseChecklist) => {
    setEditingChecklist(checklist);
    setRenamingName(checklist.name);
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
      style={[styles.itemContainer, isDarkMode && styles.darkItemContainer]}
      onPress={() => navigation.navigate('Checklist', { caseId: item.id, caseName: item.name })}
    >
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemText, isDarkMode && styles.darkItemText]}>{item.name}</Text>
        <Text style={[styles.itemDate, isDarkMode && styles.darkItemDate]}>
          Son Güncelleme: {new Date(item.lastUpdated).toLocaleString()}
        </Text>
      </View>
      <View style={styles.itemActionsContainer}>
        <TouchableOpacity onPress={() => handleRename(item)} style={styles.actionButton}>
            <Text style={[styles.actionIcon, {color: isDarkMode ? darkColors.accent : lightColors.accent}]}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionButton}>
            <Text style={[styles.actionIcon, {color: isDarkMode ? darkColors.destructive : lightColors.destructive}]}>🗑</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  const colors = isDarkMode ? darkColors : lightColors;

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
                  borderColor: colors.border,
                }
              ]}
              placeholder="Görev Adı (Örn: Ahmet Yılmaz Dosyası)"
              placeholderTextColor={colors.placeholder}
              value={editingChecklist ? renamingName : newCaseName}
              onChangeText={editingChecklist ? setRenamingName : setNewCaseName}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.destructive }]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingChecklist(null);
                }}
              >
                <Text style={[styles.modalButtonText, {color: lightColors.card}]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={submitModal}
              >
                <Text style={[styles.modalButtonText, {color: lightColors.card}]}>{editingChecklist ? "Kaydet" : "Oluştur"}</Text>
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
    backgroundColor: lightColors.card,
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 10,
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
  darkItemContainer: {
    backgroundColor: darkColors.card,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 17,
    fontWeight: '500',
    color: lightColors.text,
  },
  darkItemText: {
    color: darkColors.text,
  },
  itemDate: {
    fontSize: 13,
    color: lightColors.textSecondary,
    marginTop: 4,
  },
  darkItemDate: {
    color: darkColors.textSecondary,
  },
  itemActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 20,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 6,
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
    padding: 20,
    borderRadius: 10,
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