# Legal References Enhancement Implementation Plan

## Overview
This plan implements content versioning with checksum-based change detection and "last updated" timestamps in the UI for the existing manual legal references scraping system.

## Current System Analysis
- **Scripts**: `scrape_laws.py` → `law_parser.py` → `check_articles.py` pipeline
- **Data Flow**: Raw HTML → Parsed JSON → App consumption
- **Storage**: Static JSON files (`legalReferences.json`) with no versioning
- **UI**: Modal displays legal references with title and content

## Implementation Features

### 1. Content Versioning to Current System
- Add metadata tracking to existing scraping pipeline
- Store creation and modification timestamps
- Maintain backward compatibility with current JSON structure

### 2. Checksum-based Change Detection
- Generate SHA-256 hash for each article's content
- Compare hashes between scraping sessions to detect changes
- Identify new, modified, and removed articles automatically

### 3. Last Updated Timestamps in UI
- Display "Last Updated: DD/MM/YYYY" in legal reference modals
- Show timestamps for individual articles
- Add metadata information to reference displays

### 4. User Warning System for Old Content
- Simple warning indicator for outdated content
- Non-intrusive notification system
- Alert users when content hasn't been updated recently

## Technical Implementation

### Phase 1: Backend Enhancement (Python Scripts)

#### Files to Create:
- `scripts/content_tracker.py` - Checksum generation and change detection
- `scripts/metadata_manager.py` - Timestamp and metadata handling

#### Files to Modify:
- `scripts/law_parser.py` - Add checksum generation and timestamp tracking
- `scripts/scrape_laws.py` - Include metadata collection

#### Implementation Details:
```python
# Enhanced data structure for each legal reference
{
    "code": "CMK",
    "article": "90/1", 
    "title": "Article Title",
    "content": "Article content...",
    "lastUpdated": "2024-07-16T10:30:00Z",
    "checksum": "sha256_hash_of_content",
    "sourceUrl": "https://www.mevzuat.gov.tr/..."
}
```

### Phase 2: Data Structure Updates

#### Files to Modify:
- `src/types/index.ts` - Extend LegalReference interface
- `src/data/legalReferences.json` - Add metadata fields

#### New TypeScript Interface:
```typescript
export interface LegalReference {
  code: string;
  article: string;
  title: string;
  content: string;
  lastUpdated: string;    // ISO timestamp
  checksum: string;       // SHA-256 hash
  sourceUrl?: string;     // Original URL
}
```

### Phase 3: UI Implementation

#### Files to Modify:
- `src/screens/ChecklistScreen.tsx` - Enhanced legal reference modal
- `src/hooks/useTheme.ts` - Add timestamp styling if needed

#### UI Changes:
- Add "Last Updated: DD/MM/YYYY" below legal reference content
- Show simple warning for very old content (>6 months)
- Display metadata in modal footer

#### Example UI Enhancement:
```typescript
// In legal reference modal
<View style={styles.referenceContent}>
  <Text style={styles.referenceTitle}>{reference.title}</Text>
  <Text style={styles.referenceText}>{reference.content}</Text>
  <View style={styles.metadataContainer}>
    <Text style={styles.lastUpdated}>
      Last Updated: {formatDate(reference.lastUpdated)}
    </Text>
    {isContentOld(reference.lastUpdated) && (
      <Text style={styles.warningText}>⚠️ Content may be outdated</Text>
    )}
  </View>
</View>
```

### Phase 4: Utility Functions

#### Files to Create:
- `src/utils/contentHelpers.ts` - Date formatting and age checking utilities

#### Helper Functions:
```typescript
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('tr-TR');
};

export const isContentOld = (lastUpdated: string): boolean => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(lastUpdated) < sixMonthsAgo;
};
```

## Implementation Steps

### Step 1: Backend Scripts Enhancement
1. Create `scripts/content_tracker.py` for checksum generation
2. Create `scripts/metadata_manager.py` for timestamp handling
3. Modify `scripts/law_parser.py` to include metadata generation
4. Update `scripts/scrape_laws.py` to capture source URLs and timestamps

### Step 2: Data Structure Migration
1. Extend `LegalReference` interface in `src/types/index.ts`
2. Update existing `legalReferences.json` with metadata fields
3. Ensure backward compatibility during migration

### Step 3: UI Integration
1. Modify legal reference modal in `ChecklistScreen.tsx`
2. Add timestamp display and simple warning system
3. Create utility functions for date formatting and age checking

### Step 4: Testing and Validation
1. Test change detection with modified content
2. Verify UI displays timestamps correctly
3. Ensure warning system works for old content
4. Validate backward compatibility

## Expected Outcomes

- **Automated change detection**: Script automatically identifies when legal content changes
- **Timestamp tracking**: Users see when each legal reference was last updated
- **Simple warnings**: Non-intrusive alerts for potentially outdated content
- **Maintained workflow**: Existing manual scraping process remains unchanged
- **Backward compatibility**: No breaking changes to existing functionality

## File Structure After Implementation

```
scripts/
├── scrape_laws.py              # Enhanced with metadata capture
├── law_parser.py               # Enhanced with checksum generation
├── check_articles.py           # Existing validation script
├── content_tracker.py          # New: Change detection logic
└── metadata_manager.py         # New: Timestamp and metadata handling

src/
├── types/index.ts              # Extended LegalReference interface
├── data/
│   └── legalReferences.json    # Enhanced with metadata
├── utils/
│   └── contentHelpers.ts       # New: Date and age utilities
└── screens/
    └── ChecklistScreen.tsx     # Enhanced legal reference modal
```

## Technical Considerations

- **Performance**: Efficient checksum comparison for change detection
- **Storage**: Minimal size increase with metadata addition
- **User Experience**: Non-intrusive timestamp display and warnings
- **Maintainability**: Clean separation of concerns between scripts and UI
- **Compatibility**: Seamless integration with existing codebase