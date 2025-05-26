import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CaseChecklist } from '../types'; // Ensure this path is correct
import 'react-native-get-random-values'; // For UUID
import { v4 as uuidv4 } from 'uuid';


const ALL_CHECKLISTS_KEY = '@all_checklists_data_v2'; // Changed key to avoid conflicts with old structure

export const useChecklist = () => {
  const [loading, setLoading] = useState(true);
  const [allChecklists, setAllChecklists] = useState<CaseChecklist[]>([]);
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);

  const activeChecklist = useMemo(() => {
    return allChecklists.find(c => c.id === activeChecklistId) || null;
  }, [allChecklists, activeChecklistId]);

  const answers = useMemo(() => {
    return activeChecklist?.answers || {};
  }, [activeChecklist]);

  const saveAllChecklists = useCallback(async (checklistsToSave: CaseChecklist[]) => {
    try {
      await AsyncStorage.setItem(ALL_CHECKLISTS_KEY, JSON.stringify(checklistsToSave));
    } catch (error) {
      console.error('Error saving all checklists:', error);
    }
  }, []);

  const loadAllChecklists = useCallback(async () => {
    try {
      setLoading(true);
      const savedData = await AsyncStorage.getItem(ALL_CHECKLISTS_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as CaseChecklist[];
        setAllChecklists(parsedData);
      } else {
        setAllChecklists([]);
      }
    } catch (error) {
      console.error('Error loading all checklists:', error);
      setAllChecklists([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  }, []); // setLoading is stable

  useEffect(() => {
    loadAllChecklists();
  }, [loadAllChecklists]);


  const createNewChecklist = useCallback(async (name: string): Promise<string | null> => {
    if (!name.trim()) {
      console.error("Checklist name cannot be empty");
      return null; // Or throw an error
    }
    const newId = uuidv4();
    const now = new Date().toISOString();
    const newChecklist: CaseChecklist = {
      id: newId,
      name,
      answers: {},
      generalNotes: '',
      lastUpdated: now,
      createdAt: now,
    };
    const updatedChecklists = [...allChecklists, newChecklist];
    setAllChecklists(updatedChecklists);
    await saveAllChecklists(updatedChecklists);
    return newId; // Return the ID of the newly created checklist
  }, [allChecklists, saveAllChecklists]);

  const selectChecklist = useCallback((checklistId: string | null) => {
    setActiveChecklistId(checklistId);
  }, []); // setActiveChecklistId is stable
  
  const answerQuestion = useCallback(async (questionId: string, answer: string | boolean) => {
    if (!activeChecklistId) return;

    const updatedChecklists = allChecklists.map(c => {
      if (c.id === activeChecklistId) {
        return {
          ...c,
          answers: {
            ...c.answers,
            [questionId]: answer,
          },
          lastUpdated: new Date().toISOString(),
        };
      }
      return c;
    });
    setAllChecklists(updatedChecklists);
    await saveAllChecklists(updatedChecklists);
  }, [allChecklists, activeChecklistId, saveAllChecklists]);

  const updateGeneralNotes = useCallback(async (notes: string) => {
    if (!activeChecklistId) return;

    const updatedChecklists = allChecklists.map(c => {
      if (c.id === activeChecklistId) {
        return {
          ...c,
          generalNotes: notes,
          lastUpdated: new Date().toISOString(),
        };
      }
      return c;
    });
    setAllChecklists(updatedChecklists);
    await saveAllChecklists(updatedChecklists);
  }, [allChecklists, activeChecklistId, saveAllChecklists]);

  const resetActiveChecklistProgress = useCallback(async () => {
    if (!activeChecklistId) return;

    const updatedChecklists = allChecklists.map(c => {
      if (c.id === activeChecklistId) {
        return {
          ...c,
          answers: {},
          generalNotes: c.generalNotes || '', // Preserve general notes or reset as per requirement
          lastUpdated: new Date().toISOString(),
        };
      }
      return c;
    });
    setAllChecklists(updatedChecklists);
    await saveAllChecklists(updatedChecklists);
  }, [allChecklists, activeChecklistId, saveAllChecklists]);

  const deleteChecklist = useCallback(async (checklistId: string) => {
    const updatedChecklists = allChecklists.filter(c => c.id !== checklistId);
    setAllChecklists(updatedChecklists);
    await saveAllChecklists(updatedChecklists);
    if (activeChecklistId === checklistId) {
      setActiveChecklistId(null); // Deselect if the active one is deleted
    }
  }, [allChecklists, activeChecklistId, saveAllChecklists]); // setActiveChecklistId is stable
  
  const renameChecklist = useCallback(async (checklistId: string, newName: string) => {
    if (!newName.trim()) {
        console.error("Checklist name cannot be empty for renaming");
        return;
    }
    const updatedChecklists = allChecklists.map(c => {
        if (c.id === checklistId) {
            return {
                ...c,
                name: newName,
                lastUpdated: new Date().toISOString(),
            };
        }
        return c;
    });
    setAllChecklists(updatedChecklists);
    await saveAllChecklists(updatedChecklists);
  }, [allChecklists, saveAllChecklists]);


  return {
    loading,
    allChecklists,
    activeChecklist, // Now memoized
    answers, // Now memoized
    loadAllChecklists, // Now memoized
    createNewChecklist, // Now memoized
    selectChecklist, // Now memoized
    answerQuestion, // Now memoized
    updateGeneralNotes, // Now memoized
    resetActiveChecklistProgress, // Now memoized
    deleteChecklist, // Now memoized
    renameChecklist, // Now memoized
  };
}; 