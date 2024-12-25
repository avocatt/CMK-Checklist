# CMK Kontrol Listesi

A mobile application built with React Native and Expo for lawyers to track and manage their CMK (Criminal Procedure Law) checklist items.

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
│   └── checklist.ts          # Checklist data and structure
├── types/
│   └── index.ts              # TypeScript type definitions
└── components/               # Future component directory
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

This project is private and confidential. All rights reserved.

## Contact

For any questions or suggestions, please contact the project maintainer. 