# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CMK (Criminal Procedure Code) Checklist mobile application built with React Native and Expo for Turkish lawyers to manage mandatory defense cases. The app provides structured checklists with integrated legal references from Turkish law (TCK, CMK, PVSK).

## Development Commands

## JavaScript/React Native
```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific commands
npm run android  # Start on Android
npm run ios      # Start on iOS (macOS only)
npm run web      # Start in web browser
```

## Python Scripts
```bash
# Set up Python environment (first time only)
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows

# Install Python dependencies
pip install -r requirements.txt

# Run law parsing scripts
python scripts/law_parser.py
python scripts/scrape_laws.py

# Always activate venv before running Python scripts
source venv/bin/activate
```

## Architecture Overview

### Tech Stack
- **React Native 0.79.2** with **Expo SDK 53**
- **TypeScript** with strict mode enabled
- **React Navigation** (Native Stack) for navigation
- **AsyncStorage** for local data persistence
- No external state management library - uses React hooks

### Key Architecture Patterns

1. **Navigation Structure**
   - Two screens: `HomeScreen` (case list) and `ChecklistScreen` (case details)
   - Type-safe navigation with `RootStackParamList` in `App.tsx`
   - Pass case ID as route parameter: `navigation.navigate('Checklist', { caseId })`

2. **State Management**
   - All checklist data operations handled by `useChecklist` hook
   - Hook provides functions for: createNewCase, deleteCase, renameCase, setAnswer, setNote, setQuestionNote, resetCase
   - Data automatically persisted to AsyncStorage on every change
   - No global state - each screen manages its own local state

3. **Data Model**
   ```typescript
   Phase → SubCategory → ChecklistItem → Answer/Note
   ```
   - Questions can be "yes/no" or "text" type
   - Each case stores answers, general notes, and question-specific notes
   - Legal references linked by article ID

4. **Theme System**
   - Apple-inspired design using `useTheme` hook
   - Light/dark mode support based on system preference
   - Consistent color palette defined in theme object

### Project Structure

```
src/
├── data/
│   ├── checklist.json         # Main checklist structure
│   ├── legalReferences.json   # Legal article contents
│   └── laws_content/          # Raw HTML law files
├── hooks/
│   ├── useChecklist.ts        # Core state management
│   └── useTheme.ts            # Theme management
├── screens/
│   ├── HomeScreen.tsx         # Case list management
│   └── ChecklistScreen.tsx    # Checklist interaction
└── types/index.ts             # TypeScript definitions
```

## Important Development Notes

### Working with Legal References
- Legal references are clickable within checklist questions
- References use format: `{CMK 90}` in questions
- Modal displays article content from `legalReferences.json`
- Python scripts in `scripts/` process raw HTML law files

### Data Persistence
- All data stored locally using AsyncStorage
- Key format: `@CMKChecklist:cases`
- Data structure includes timestamps for creation and modification
- No cloud sync or external database

### TypeScript Usage
- Strict mode enabled - always provide proper types
- Main types defined in `src/types/index.ts`
- Navigation types in `App.tsx` as `RootStackParamList`

### UI Patterns
- Apple-style design with SF Symbols (via @expo/vector-icons)
- Consistent spacing: 16px padding standard
- Shadow effects for elevated components
- Modal presentations for legal references and notes

## Common Tasks

### Adding a New Question
1. Update `src/data/checklist.json` with new question in appropriate phase/subcategory
2. If legal reference needed, add to `legalReferences.json`
3. No code changes required - data-driven architecture

### Modifying Theme Colors
Edit the theme object in `src/hooks/useTheme.ts` - changes apply app-wide automatically

### Adding New Screen
1. Create screen component in `src/screens/`
2. Add to `RootStackParamList` in `App.tsx`
3. Add navigation route in `AppNavigator`

## Debugging Tips
- Use Expo Go app for testing on physical devices
- Check AsyncStorage data with: `AsyncStorage.getItem('@CMKChecklist:cases')`
- Legal reference IDs must match between checklist.json and legalReferences.json