import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChecklistScreen from './src/screens/ChecklistScreen';
import HomeScreen from './src/screens/HomeScreen';
import { CaseChecklist } from './src/types';
import { useTheme } from './src/hooks/useTheme';

// Define param list for type safety
export type RootStackParamList = {
  Home: undefined;
  Checklist: { caseId: string; caseName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: 'bold',
          color: colors.text,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'CMK Görevlerim',
        }}
      />
      <Stack.Screen
        name="Checklist"
        component={ChecklistScreen}
        options={({ route }) => ({
          title: route.params.caseName || 'CMK Kontrol Listesi',
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
