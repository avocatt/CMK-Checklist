export type QuestionType = 'yesNo' | 'text';

export interface ChecklistItem {
  id: string;
  category: string;
  question: string;
  type: QuestionType;
  answer?: string | boolean;
}

export interface Category {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistProgress {
  currentCategoryIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, string | boolean>;
  lastUpdated: string;
}

export type LegalReference = {
  code: string;
  article: string;
  title: string;
  content: string;
}; 