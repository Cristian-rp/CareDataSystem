import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native'; // Importamos Platform

// Creamos un adaptador que funciona en Web y en Móvil
const storageAdapter = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      // En web usamos localStorage
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    } else {
      // En móvil usamos SecureStore
      return await SecureStore.getItemAsync(key);
    }
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // Ignorar errores de cuota
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignorar
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

const supabaseUrl = 'https://zqlihwyunxxoqthnqjoh.supabase.co'; // Tu URL real
const supabaseAnonKey = 'sb_publishable_7I3Mccn7h0TMAA322IAp6w_gldLcKjj'; // Tu clave real

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter, // Usamos el adaptador híbrido
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});