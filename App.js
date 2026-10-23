import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DataProvider } from './src/context/DataContext';

import LoginScreen from './src/screens/LoginScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';
import ProveedoresScreen from './src/screens/ProveedoresScreen';
import HistorialScreen from './src/screens/HistorialScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Inventario" component={InventarioScreen} />
          <Stack.Screen name="Usuarios" component={UsuariosScreen} />
          <Stack.Screen name="Proveedores" component={ProveedoresScreen} />
          <Stack.Screen name="Historial" component={HistorialScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}