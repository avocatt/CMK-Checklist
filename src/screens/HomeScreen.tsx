import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useChecklist } from '../hooks/useChecklist';
import { useTheme } from '../hooks/useTheme';
import { CaseChecklist } from '../types';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import CreateCaseBottomSheet, { CreateCaseBottomSheetRef } from '../components/CreateCaseBottomSheet';

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
  const bottomSheetRef = useRef<CreateCaseBottomSheetRef>(null);
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
    bottomSheetRef.current?.present();
  };
  
  const handleRename = (checklist: CaseChecklist) => {
    setEditingChecklist(checklist);
    setRenamingName(checklist.name);
    setIsInputFocused(false); // Reset input focus state
    bottomSheetRef.current?.present();
  };

  const submitBottomSheet = async () => {
    if (editingChecklist) { // Renaming existing checklist
      if (renamingName.trim()) {
        await renameChecklist(editingChecklist.id, renamingName.trim());
        setEditingChecklist(null);
        bottomSheetRef.current?.dismiss();
      }
    } else { // Creating new checklist
      if (newCaseName.trim()) {
        const newId = await createNewChecklist(newCaseName.trim());
        if (newId) {
          navigation.navigate('Checklist', { caseId: newId, caseName: newCaseName.trim() });
        }
        setNewCaseName('');
        bottomSheetRef.current?.dismiss();
      }
    }
  };

  const handleBottomSheetClose = () => {
    setEditingChecklist(null);
    setIsInputFocused(false);
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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

        <CreateCaseBottomSheet
          ref={bottomSheetRef}
          editingChecklist={editingChecklist}
          newCaseName={newCaseName}
          renamingName={renamingName}
          isInputFocused={isInputFocused}
          onNewCaseNameChange={setNewCaseName}
          onRenamingNameChange={setRenamingName}
          onInputFocus={() => setIsInputFocused(true)}
          onInputBlur={() => setIsInputFocused(false)}
          onSubmit={submitBottomSheet}
          onClose={handleBottomSheetClose}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 18, // Increased font size
    fontWeight: '600', // Semibold
    color: '#000000', // Default light color, overridden by inline style
  },
  itemDate: {
    fontSize: 14, // Increased font size
    color: '#8A8A8E', // Default light color, overridden by inline style
    marginTop: 4,
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
}); 