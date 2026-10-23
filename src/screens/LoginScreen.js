import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import UdecLogo from '../components/UdecLogo';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('cestebanruiz');
  const [password, setPassword] = useState('udec2026');

  const handleLogin = () => {
    const userClean = usuario.trim().toLowerCase();
    const passClean = password.trim();

    if (!userClean || !passClean) {
      Alert.alert('Atención', 'Por favor ingresa usuario y contraseña.');
      return;
    }

    if (userClean === 'cestebanruiz' && passClean === 'udec2026') {
      navigation.replace('Inventario');
    } else {
      Alert.alert(
        'Acceso Denegado',
        'Credenciales incorrectas.\n\nUsuario de prueba: cestebanruiz\nContraseña: udec2026'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoBox}>
          {/* Logo del escudo oficial de la UDEC */}
          <UdecLogo width={140} height={90} />
          <Text style={styles.brandTag}>UNIVERSIDAD DE CUNDINAMARCA</Text>
          <Text style={styles.title}>CareData System</Text>
          <Text style={styles.subtitle}>Enfermería Universitaria · Extensión Soacha</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>USUARIO INSTITUCIONAL</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. cestebanruiz"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={usuario}
            onChangeText={setUsuario}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
          <Text style={styles.buttonText}>INGRESAR AL SISTEMA ──►</Text>
        </TouchableOpacity>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>CREDENCIALES DE ACCESO:</Text>
          <Text style={styles.demoText}>• Usuario: <Text style={{ fontWeight: 'bold' }}>cestebanruiz</Text></Text>
          <Text style={styles.demoText}>• Clave: <Text style={{ fontWeight: 'bold' }}>udec2026</Text></Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: 380,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 28,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTag: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
    marginTop: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
  demoBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 2,
  },
  demoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});