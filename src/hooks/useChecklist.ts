import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChecklistProgress } from '../types';

const PROGRESS_KEY = '@checklist_progress';

export const useChecklist = () => {
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setAnswers(progress.answers || {});
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = async (questionId: string, answer: string | boolean) => {
    const newAnswers = {
      ...answers,
      [questionId]: answer,
    };
    setAnswers(newAnswers);
    
    try {
      const progress: ChecklistProgress = {
        currentCategoryIndex: 0,
        currentQuestionIndex: 0,
        answers: newAnswers,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  return {
    loading,
    answers,
    answerQuestion,
  };
}; 