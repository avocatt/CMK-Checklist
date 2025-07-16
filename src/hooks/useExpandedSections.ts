import { useState, useCallback, useEffect } from 'react';
import { Phase } from '../types';

export const useExpandedSections = (
  filteredData: Phase[],
  searchQuery: string,
  allPhaseIds: string[],
  allSubCategoryIds: string[]
) => {
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);

  // Effect to expand phases and subcategories with matching items on search
  useEffect(() => {
    if (searchQuery && filteredData) {
      const matchingPhaseIds = new Set<string>();
      const matchingSubCategoryIds = new Set<string>();

      filteredData.forEach(phase => {
        let phaseHasMatch = false;
        phase.subCategories.forEach(subCategory => {
          if (subCategory.items.length > 0) {
            matchingSubCategoryIds.add(subCategory.id);
            phaseHasMatch = true;
          }
        });
        if (phaseHasMatch) {
          matchingPhaseIds.add(phase.id);
        }
      });

      setExpandedPhases(prev => [...new Set([...prev, ...Array.from(matchingPhaseIds)])]);
      setExpandedSubCategories(prev => [...new Set([...prev, ...Array.from(matchingSubCategoryIds)])]);
    }
  }, [searchQuery, filteredData]);

  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  }, []);

  const toggleSubCategory = useCallback((subCategoryId: string) => {
    setExpandedSubCategories(prev =>
      prev.includes(subCategoryId)
        ? prev.filter(id => id !== subCategoryId)
        : [...prev, subCategoryId]
    );
  }, []);

  const toggleAll = useCallback(() => {
    if (expandedPhases.length === allPhaseIds.length && expandedSubCategories.length === allSubCategoryIds.length) {
      setExpandedPhases([]);
      setExpandedSubCategories([]);
    } else {
      setExpandedPhases(allPhaseIds);
      setExpandedSubCategories(allSubCategoryIds);
    }
  }, [expandedPhases.length, expandedSubCategories.length, allPhaseIds, allSubCategoryIds]);

  const resetExpanded = useCallback(() => {
    setExpandedPhases([]);
    setExpandedSubCategories([]);
  }, []);

  const areAllExpanded = expandedPhases.length === allPhaseIds.length && 
                         expandedSubCategories.length === allSubCategoryIds.length;

  return {
    expandedPhases,
    expandedSubCategories,
    togglePhase,
    toggleSubCategory,
    toggleAll,
    resetExpanded,
    areAllExpanded,
  };
};