# Testing Guide

## Overview

This guide provides instructions for writing and running tests in the CMK Checklist application.

## Test Setup

The project uses Jest with React Native Testing Library for testing. The testing infrastructure includes:

- **Jest**: Test runner and assertion library
- **React Native Testing Library**: Testing utilities for React Native components
- **jest-expo**: Expo-specific Jest preset
- **TypeScript support**: Full TypeScript support in tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized alongside the source files they test:

```
src/
├── hooks/
│   ├── __tests__/
│   │   ├── useChecklist.test.ts
│   │   └── useTheme.test.ts
│   ├── useChecklist.ts
│   └── useTheme.ts
├── screens/
│   ├── __tests__/
│   │   ├── HomeScreen.test.tsx
│   │   └── ChecklistScreen.test.tsx
│   ├── HomeScreen.tsx
│   └── ChecklistScreen.tsx
```

## Writing Tests

### Testing Hooks

Use `@testing-library/react-native` for testing React hooks:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useChecklist } from '../useChecklist';

describe('useChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new checklist', async () => {
    const { result } = renderHook(() => useChecklist());
    
    await act(async () => {
      await result.current.createNewChecklist('Test Case');
    });
    
    expect(result.current.allChecklists).toHaveLength(1);
    expect(result.current.allChecklists[0].name).toBe('Test Case');
  });
});
```

### Testing Components

For component testing:

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('should render case list', () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    expect(getByText('CMK Davaları')).toBeTruthy();
    expect(getByPlaceholderText('Yeni dava adı')).toBeTruthy();
  });

  it('should create new case', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    const input = getByPlaceholderText('Yeni dava adı');
    const button = getByText('Yeni Dava Ekle');
    
    fireEvent.changeText(input, 'Test Davası');
    fireEvent.press(button);
    
    await waitFor(() => {
      expect(getByText('Test Davası')).toBeTruthy();
    });
  });
});
```

### Testing AsyncStorage Operations

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
});

it('should save data to AsyncStorage', async () => {
  // Your test code here
  
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    '@CMKChecklist:cases',
    expect.any(String)
  );
});
```

## Mocking

### Pre-configured Mocks

Common mocks are set up in `jest.setup.js`:

- **AsyncStorage**: Mocked with in-memory storage
- **React Navigation**: Navigation methods mocked
- **React Native Safe Area Context**: Safe area insets mocked
- **UUID**: Returns predictable test IDs
- **react-native-get-random-values**: Required for UUID

### Custom Mocks

To add custom mocks for your tests:

```typescript
// Mock a specific module
jest.mock('../api/client', () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: 'test' }))
}));

// Mock with different implementations
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component/hook does, not how it does it
2. **Use meaningful test descriptions**: Describe what the test verifies in clear terms
3. **Keep tests isolated**: Each test should be independent and not rely on others
4. **Mock external dependencies**: Mock AsyncStorage, navigation, and other external APIs
5. **Test edge cases**: Include tests for error conditions and boundary values
6. **Use `act()` for state updates**: Wrap state updates in `act()` to avoid warnings
7. **Clean up after tests**: Use `beforeEach` to reset mocks and state

## Common Testing Patterns

### Testing Loading States

```typescript
it('should show loading state initially', () => {
  const { result } = renderHook(() => useChecklist());
  expect(result.current.loading).toBe(true);
});
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
  
  const { result } = renderHook(() => useChecklist());
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.allChecklists).toEqual([]);
  });
});
```

### Testing Navigation

```typescript
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate })
}));

it('should navigate to checklist', () => {
  const { getByText } = render(<HomeScreen />);
  
  fireEvent.press(getByText('Case Name'));
  
  expect(mockNavigate).toHaveBeenCalledWith('Checklist', { caseId: 'test-id' });
});
```

## Coverage

Run tests with coverage to see which parts of the code are tested:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory. Aim for:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Debugging Tests

### Console Logs
```typescript
import { debug } from '@testing-library/react-native';

const { debug } = render(<MyComponent />);
debug(); // Prints the component tree
```

### Debugging Specific Elements
```typescript
const element = getByTestId('my-element');
console.log(element.props);
```

### Running Single Test
```bash
npm test -- --testNamePattern="should create new checklist"
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Check `transformIgnorePatterns` in `jest.config.js`
2. **Act warnings**: Wrap state updates in `act()` calls
3. **Navigation errors**: Ensure components are wrapped in `NavigationContainer` for tests
4. **AsyncStorage errors**: Verify mocks are properly set up in `beforeEach`

### Getting Help

If you encounter issues:
1. Check the Jest and React Native Testing Library documentation
2. Ensure all dependencies are installed: `npm install`
3. Clear Jest cache: `npx jest --clearCache`
4. Check that mocks match the actual module exports