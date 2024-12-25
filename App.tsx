import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChecklistScreen from './src/screens/ChecklistScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Checklist"
          component={ChecklistScreen}
          options={{
            title: 'Zorunlu Müdafinin CMK Kontrol Listesi',
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
            headerTitleStyle: {
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
