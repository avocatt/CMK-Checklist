import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChecklist } from '../useChecklist';
import { CaseChecklist } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('useChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useChecklist());
      expect(result.current.loading).toBe(true);
    });

    it('should load empty checklists when no data exists', async () => {
      const { result } = renderHook(() => useChecklist());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.allChecklists).toEqual([]);
      expect(result.current.activeChecklist).toBeNull();
    });

    it('should load existing checklists from storage', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'existing-1',
          name: 'Test Case 1',
          answers: { q1: true },
          generalNotes: 'Test notes',
          questionNotes: { q1: 'Note for q1' },
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.allChecklists).toEqual(mockChecklists);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('createNewChecklist', () => {
    it('should create a new checklist with valid name', async () => {
      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let newId: string | null = null;
      await act(async () => {
        newId = await result.current.createNewChecklist('New Test Case');
      });

      expect(newId).toBe('test-uuid-123');
      expect(result.current.allChecklists).toHaveLength(1);
      expect(result.current.allChecklists[0]).toMatchObject({
        id: 'test-uuid-123',
        name: 'New Test Case',
        answers: {},
        generalNotes: '',
        questionNotes: {},
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@all_checklists_data_v2',
        expect.any(String)
      );
    });

    it('should not create checklist with empty name', async () => {
      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let newId: string | null = null;
      await act(async () => {
        newId = await result.current.createNewChecklist('');
      });

      expect(newId).toBeNull();
      expect(result.current.allChecklists).toHaveLength(0);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not create checklist with whitespace-only name', async () => {
      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      let newId: string | null = null;
      await act(async () => {
        newId = await result.current.createNewChecklist('   ');
      });

      expect(newId).toBeNull();
      expect(result.current.allChecklists).toHaveLength(0);
    });
  });

  describe('selectChecklist', () => {
    it('should select an existing checklist', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Test Case 1',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist('test-1');
      });

      expect(result.current.activeChecklist).toEqual(mockChecklists[0]);
    });

    it('should deselect checklist when null is passed', async () => {
      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist(null);
      });

      expect(result.current.activeChecklist).toBeNull();
    });
  });

  describe('answerQuestion', () => {
    it('should update answer for active checklist', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Test Case 1',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist('test-1');
      });

      await act(async () => {
        await result.current.answerQuestion('q1', true);
      });

      expect(result.current.answers).toEqual({ q1: true });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should not update answer when no checklist is active', async () => {
      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.answerQuestion('q1', true);
      });

      expect(result.current.answers).toEqual({});
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('updateGeneralNotes', () => {
    it('should update general notes for active checklist', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Test Case 1',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist('test-1');
      });

      await act(async () => {
        await result.current.updateGeneralNotes('New general notes');
      });

      expect(result.current.activeChecklist?.generalNotes).toBe('New general notes');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('updateQuestionNote', () => {
    it('should add question note', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Test Case 1',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist('test-1');
      });

      await act(async () => {
        await result.current.updateQuestionNote('q1', 'Note for question 1');
      });

      expect(result.current.activeChecklist?.questionNotes).toEqual({
        q1: 'Note for question 1',
      });
    });

    it('should remove question note when empty string is provided', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Test Case 1',
          answers: {},
          generalNotes: '',
          questionNotes: { q1: 'Existing note' },
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist('test-1');
      });

      await act(async () => {
        await result.current.updateQuestionNote('q1', '');
      });

      expect(result.current.activeChecklist?.questionNotes).toEqual({});
    });
  });

  describe('resetActiveChecklistProgress', () => {
    it('should reset answers and question notes but preserve general notes', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Test Case 1',
          answers: { q1: true, q2: false },
          generalNotes: 'Important notes',
          questionNotes: { q1: 'Note 1', q2: 'Note 2' },
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist('test-1');
      });

      await act(async () => {
        await result.current.resetActiveChecklistProgress();
      });

      expect(result.current.activeChecklist?.answers).toEqual({});
      expect(result.current.activeChecklist?.questionNotes).toEqual({});
      expect(result.current.activeChecklist?.generalNotes).toBe('Important notes');
    });
  });

  describe('deleteChecklist', () => {
    it('should delete checklist and deselect if it was active', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Test Case 1',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'test-2',
          name: 'Test Case 2',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.selectChecklist('test-1');
      });

      await act(async () => {
        await result.current.deleteChecklist('test-1');
      });

      expect(result.current.allChecklists).toHaveLength(1);
      expect(result.current.allChecklists[0].id).toBe('test-2');
      expect(result.current.activeChecklist).toBeNull();
    });
  });

  describe('renameChecklist', () => {
    it('should rename checklist with valid name', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Old Name',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.renameChecklist('test-1', 'New Name');
      });

      expect(result.current.allChecklists[0].name).toBe('New Name');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should not rename with empty name', async () => {
      const mockChecklists: CaseChecklist[] = [
        {
          id: 'test-1',
          name: 'Original Name',
          answers: {},
          generalNotes: '',
          questionNotes: {},
          lastUpdated: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockChecklists)
      );

      const { result } = renderHook(() => useChecklist());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.renameChecklist('test-1', '');
      });

      expect(result.current.allChecklists[0].name).toBe('Original Name');
    });
  });
});