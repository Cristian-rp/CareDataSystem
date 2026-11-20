import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { COLORS } from '../theme/colors';
import UdecLogo from '../components/UdecLogo';

export default function LoginScreen({ navigation }) {
  const { loginUsuario, registrarUsuario, actualizarPassword } = useContext(DataContext);

  const [modo, setModo] = useState('login'); // 'login' | 'register' | 'recover'
  const [cargando, setCargando] = useState(false);

  // Campos Login
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);

  // Campos Registro
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [nuevoUsuario, setNuevoUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [cargo, setCargo] = useState('Enfermería · Turno Mañana');
  const [nuevaPass, setNuevaPass] = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');

  // Campos Recuperación
  const [recoverId, setRecoverId] = useState('');
  const [recoverPass, setRecoverPass] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const limpiarMensajes = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const cambiarModo = (nuevoModo) => {
    limpiarMensajes();
    setModo(nuevoModo);
  };

  // --- INICIAR SESIÓN (con await) ---
  const handleLogin = async () => {
    limpiarMensajes();
    if (!identificador.trim() || !password.trim()) {
      setErrorMsg('Ingresa tu usuario o correo institucional y tu contraseña.');
      return;
    }

    setCargando(true);
    try {
      const res = await loginUsuario(identificador, password);
      if (res && res.ok) {
        setIdentificador('');
        setPassword('');
        navigation.replace('Inventario');
      } else {
        setErrorMsg(res?.error || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setErrorMsg('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // --- CREAR CUENTA NUEVA (con await) ---
  const handleRegister = async () => {
    limpiarMensajes();
    if (
      !nombreCompleto.trim() ||
      !nuevoUsuario.trim() ||
      !correo.trim() ||
      !nuevaPass.trim()
    ) {
      setErrorMsg('Todos los campos son obligatorios para crear tu cuenta.');
      return;
    }

    if (nuevaPass.trim().length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaPass !== confirmarPass) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const res = await registrarUsuario({
        nombreCompleto,
        usuario: nuevoUsuario,
        correo,
        cargo,
        password: nuevaPass,
      });

      if (res && res.ok) {
        navigation.replace('Inventario');
      } else {
        setErrorMsg(res?.error || 'No se pudo crear la cuenta.');
      }
    } catch (err) {
      setErrorMsg('Error al registrar el usuario en Supabase.');
    } finally {
      setCargando(false);
    }
  };

  // --- RESTABLECER CONTRASEÑA (con await) ---
  const handleRecover = async () => {
    limpiarMensajes();
    if (!recoverId.trim() || !recoverPass.trim()) {
      setErrorMsg('Ingresa tu usuario/correo y la nueva contraseña.');
      return;
    }
    if (recoverPass.trim().length < 6) {
      setErrorMsg('La nueva contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      const res = await actualizarPassword(recoverId, recoverPass);
      if (res && res.ok) {
        setSuccessMsg('Contraseña actualizada. Ya puedes iniciar sesión.');
        setIdentificador(recoverId.trim());
        setPassword('');
        setRecoverId('');
        setRecoverPass('');
        setModo('login');
      } else {
        setErrorMsg(res?.error || 'No se encontró la cuenta.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollCenter}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.topAccentBar}>
            <Text style={styles.topAccentText}>
              PORTAL DE ENFERMERÍA · SEDE SOACHA
            </Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.logoBox}>
              <UdecLogo width={115} height={75} />
              <Text style={styles.brandTag}>UNIVERSIDAD DE CUNDINAMARCA</Text>
              <Text style={styles.title}>CareData System</Text>
              <Text style={styles.subtitle}>
                Gestión de Inventarios y Atención Universitaria
              </Text>
            </View>

            {modo !== 'recover' && (
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, modo === 'login' && styles.tabBtnActive]}
                  onPress={() => cambiarModo('login')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      modo === 'login' && styles.tabTextActive,
                    ]}
                  >
                    Iniciar Sesión
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    modo === 'register' && styles.tabBtnActive,
                  ]}
                  onPress={() => cambiarModo('register')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      modo === 'register' && styles.tabTextActive,
                    ]}
                  >
                    Crear Cuenta
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {errorMsg !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            )}

            {successMsg !== '' && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✅ {successMsg}</Text>
              </View>
            )}

            {/* FORMULARIO LOGIN */}
            {modo === 'login' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>USUARIO O CORREO INSTITUCIONAL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. cestebanruiz"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={identificador}
                    onChangeText={(t) => {
                      setIdentificador(t);
                      limpiarMensajes();
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONTRASEÑA</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor="#888"
                      secureTextEntry={!mostrarPass}
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        limpiarMensajes();
                      }}
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setMostrarPass((prev) => !prev)}
                    >
                      <Text style={styles.eyeText}>
                        {mostrarPass ? 'Ocultar' : 'Ver'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.forgotLink}
                  onPress={() => cambiarModo('recover')}
                >
                  <Text style={styles.forgotText}>
                    ¿Olvidaste tu contraseña? Restablecer aquí
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonPrimary}
                  activeOpacity={0.85}
                  disabled={cargando}
                  onPress={handleLogin}
                >
                  {cargando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>INGRESAR AL SISTEMA ──►</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* FORMULARIO CREAR CUENTA */}
            {modo === 'register' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOMBRE COMPLETO</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Laura Camila Torres"
                    placeholderTextColor="#888"
                    value={nombreCompleto}
                    onChangeText={setNombreCompleto}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOMBRE DE USUARIO</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. lctorres"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    value={nuevoUsuario}
                    onChangeText={setNuevoUsuario}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CORREO INSTITUCIONAL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="usuario@ucundinamarca.edu.co"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={correo}
                    onChangeText={setCorreo}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>TURNO / CARGO EN ENFERMERÍA</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Enfermería · Turno Tarde"
                    placeholderTextColor="#888"
                    value={cargo}
                    onChangeText={setCargo}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONTRASEÑA (MÍN. 6 CARACTERES)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Crea una contraseña"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={nuevaPass}
                    onChangeText={setNuevaPass}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repite la contraseña"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={confirmarPass}
                    onChangeText={setConfirmarPass}
                  />
                </View>

                <TouchableOpacity
                  style={styles.buttonPrimary}
                  activeOpacity={0.85}
                  disabled={cargando}
                  onPress={handleRegister}
                >
                  {cargando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      REGISTRAR CUENTA Y ENTRAR ──►
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* FORMULARIO RECUPERAR CLAVE */}
            {modo === 'recover' && (
              <>
                <Text style={styles.recoverTitle}>Restablecer Contraseña</Text>
                <Text style={styles.recoverDesc}>
                  Ingresa tu usuario o correo institucional registrado para asignar
                  una nueva clave de acceso.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>USUARIO O CORREO REGISTRADO</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. cestebanruiz"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    value={recoverId}
                    onChangeText={setRecoverId}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={recoverPass}
                    onChangeText={setRecoverPass}
                  />
                </View>

                <TouchableOpacity
                  style={styles.buttonPrimary}
                  disabled={cargando}
                  onPress={handleRecover}
                >
                  <Text style={styles.buttonText}>GUARDAR NUEVA CONTRASEÑA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backToLoginBtn}
                  onPress={() => cambiarModo('login')}
                >
                  <Text style={styles.backToLoginText}>← Volver a Iniciar Sesión</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 410,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  topAccentBar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    alignItems: 'center',
  },
  topAccentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardBody: {
    padding: 24,
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
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
    padding: 11,
    fontSize: 13,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  passwordInput: {
    flex: 1,
    padding: 11,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    padding: 13,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  recoverTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  recoverDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  backToLoginBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});