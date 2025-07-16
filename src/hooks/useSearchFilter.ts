import { useState, useMemo } from 'react';
import { Phase } from '../types';

export const useSearchFilter = (initialChecklistData: Phase[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return initialChecklistData;

    return initialChecklistData.map(phase => ({
      ...phase,
      subCategories: phase.subCategories.map(subCategory => ({
        ...subCategory,
        items: subCategory.items.filter(item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(subCategory => subCategory.items.length > 0),
    })).filter(phase => phase.subCategories.length > 0);
  }, [searchQuery, initialChecklistData]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  };
};