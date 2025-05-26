export type QuestionType = 'yesNo' | 'text';

export interface ChecklistItem {
  id: string;
  category: string; // This will be the name of the parent SubCategory
  question: string;
  type: QuestionType;
  answer?: string | boolean;
}

// Renamed from Category to SubCategory
export interface SubCategory {
  id: string; // e.g., "C1", "C2"
  name: string; // e.g., "Kolluk Öncesi Hazırlık"
  items: ChecklistItem[];
}

export interface Phase {
  id: string; // e.g., "P1", "P2"
  name: string; // e.g., "I. MÜDAFİ OLARAK GÖREVLENDİRİLME"
  subCategories: SubCategory[];
}

// ChecklistProgress might be deprecated or simplified if CaseChecklist stores all necessary info
export interface ChecklistProgress {
  answers: Record<string, string | boolean>;
  lastUpdated: string;
}

export interface CaseChecklist {
  id: string; // Unique identifier for the checklist, e.g., timestamp or UUID
  name: string; // User-defined name for the case/duty
  answers: Record<string, string | boolean>;
  generalNotes?: string; // General notes for the entire case
  questionNotes: Record<string, string>; // New: Notes specific to individual questions
  lastUpdated: string;
  createdAt: string;
}

export type LegalReference = {
  code: string;
  article: string;
  title: string;
  content: string;
}; 