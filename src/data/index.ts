import checklistDataJson from './checklist.json';
import legalReferencesJson from './generated/html_content_parsed.json';
import { Phase, LegalReference } from '../types/index';

// Assuming the JSON files' structure directly matches the Phase[] and Record<string, LegalReference> types.
// If not, appropriate mapping/casting would be needed here.
export const checklistData: Phase[] = checklistDataJson as Phase[];
export const legalReferences: Record<string, LegalReference> = legalReferencesJson as Record<string, LegalReference>; 