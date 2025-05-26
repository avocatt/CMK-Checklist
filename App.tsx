import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChecklistScreen from './src/screens/ChecklistScreen';
import HomeScreen from './src/screens/HomeScreen';
import { CaseChecklist } from './src/types';

// Define param list for type safety
export type RootStackParamList = {
  Home: undefined;
  Checklist: { caseId: string; caseName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#F2F2F7',
          },
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: 'bold',
            color: '#2D3748',
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
    </NavigationContainer>
  );
}
