# CMK Kontrol Listesi

A mobile application built with React Native and Expo for lawyers to track and manage their CMK (Criminal Procedure Law) checklist items.

Checklist was created by avukathakleri.net (https://www.avukathaklari.net/zorunlu-mudafinin-cmk-kontrol-listesi/)

## Screenshots

### Main Interface
![Main Interface](docs/images/main-interface.png)

### Category View with Expandable Sections
![Category View](docs/images/category-view.png)

### Search Functionality with Highlighting
![Search Feature](docs/images/search-feature.png)

### Dark Mode Support
![Dark Mode](docs/images/dark-mode.png)

### Legal References with Popup View
![Legal References](docs/images/legal-references.png)

## Features

### Core Functionality
- 141 checklist items organized into 6 categories
- Support for both Yes/No questions and text input responses
- Auto-save functionality for all responses
- Progress persistence between sessions

### User Interface
- Clean, minimalist design following iOS design guidelines
- Dark mode support
- Expandable/collapsible categories
- Ability to expand/collapse all categories at once
- Smooth animations and transitions

### Search and Navigation
- Real-time search functionality
- Text highlighting for search matches
- Automatic category expansion for search results
- Clear search button

### Legal Terms Integration
- Interactive legal term references (TCK, PVSK, CMK)
- Popup explanations for legal terms
- Quick access to term definitions

### Data Management
- Automatic saving of responses
- Reset functionality with confirmation
- Persistent storage using AsyncStorage

## Technical Stack

- React Native
- Expo
- TypeScript
- AsyncStorage for data persistence
- React Native Animated for animations

## Project Structure

```
src/
├── screens/
│   └── ChecklistScreen.tsx    # Main screen component
├── data/
│   ├── checklist.ts          # Checklist data and structure
│   └── legalReferences.ts    # Legal reference data
├── types/
│   └── index.ts             # TypeScript type definitions
└── hooks/
    └── useChecklist.ts      # Custom hook for checklist logic
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Use Expo Go app on your device to scan the QR code and run the application

## Future Improvements

### Planned Features
- [ ] Floating action button for quick category navigation
- [ ] Swipe gestures for categories

### Enhancement Ideas

## Contributing

This project is currently in active development. Feel free to submit issues and enhancement requests.

## License

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:

This license notice must be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.

## Contact

For any questions or suggestions, please contact the project maintainer. 
