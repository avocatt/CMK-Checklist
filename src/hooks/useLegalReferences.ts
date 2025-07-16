import { useState, useCallback } from 'react';
import { legalReferences } from '../data';
import { LegalReference } from '../types';

interface SelectedKeyword {
  word: string;
  note: string;
  reference?: LegalReference;
}

export const useLegalReferences = () => {
  const [selectedKeyword, setSelectedKeyword] = useState<SelectedKeyword | null>(null);

  const handleKeywordTap = useCallback((keyword: string, articlePart: string) => {
    const normalizedArticlePart = articlePart.replace(/m\.|madde/gi, '').trim();
    const fullKey = `${keyword} ${normalizedArticlePart}`.trim();

    const reference = legalReferences[fullKey];
    if (reference) {
      setSelectedKeyword({
        word: fullKey,
        note: `${reference.title}\n\n${reference.content}`,
        reference: reference
      });
    } else {
      let defaultNote = '';
      switch (keyword) {
        case 'TCK': defaultNote = 'Türk Ceza Kanunu'; break;
        case 'PVSK': defaultNote = 'Polis Vazife ve Salahiyet Kanunu'; break;
        case 'CMK': defaultNote = 'Ceza Muhakemesi Kanunu'; break;
      }
      setSelectedKeyword({ word: keyword, note: defaultNote });
    }
  }, []);

  const closeModal = useCallback(() => {
    setSelectedKeyword(null);
  }, []);

  return {
    selectedKeyword,
    handleKeywordTap,
    closeModal,
  };
};