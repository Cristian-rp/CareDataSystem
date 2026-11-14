import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import UdecLogo from './UdecLogo';
import GeminiAssistantModal from './GeminiAssistantModal';

const MENU_ITEMS = [
  { key: 'Inventario', label: '📦 Dashboard / Insumos', short: '📦 Insumos' },
  { key: 'Usuarios', label: '📋 Registro de Atenciones', short: '📋 Atenciones' },
  { key: 'Proveedores', label: '🚚 Proveedores y Pedidos', short: '🚚 Proveedores' },
  { key: 'Historial', label: '📊 Historial y Reportes', short: '📊 Reportes' },
];

export default function ResponsiveLayout({
  activeScreen,
  navigation,
  children,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [showGemini, setShowGemini] = useState(false);

  return (
    <View style={[styles.mainLayout, isMobile && styles.mainLayoutMobile]}>
      {/* NAVEGACIÓN: SIDEBAR EN ESCRITORIO / TOPBAR + TABS EN MÓVIL */}
      {isMobile ? (
        <View style={styles.mobileNavWrapper} data-testid="sidebar-container">
          <View style={styles.mobileTopBar}>
            <View>
              <Text style={styles.mobileBrand}>CareData System</Text>
              <Text style={styles.mobileSub}>ENFERMERÍA UDEC · SOACHA</Text>
            </View>
            <View style={styles.mobileUserRight}>
              <Text style={styles.mobileUserText}>👤 cestebanruiz</Text>
              <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.mobileExitText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mobileTabsRow}
          >
            {MENU_ITEMS.map((item) => {
              const isActive = activeScreen === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.mobileTab, isActive && styles.mobileTabActive]}
                  onPress={() => navigation.navigate(item.key)}
                >
                  <Text
                    style={[
                      styles.mobileTabText,
                      isActive && styles.mobileTabTextActive,
                    ]}
                  >
                    {item.short}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.sidebar} data-testid="sidebar-container">
          <View style={styles.logoHeader}>
            <Text style={styles.logoTitle}>CareData System</Text>
            <Text style={styles.logoSub}>ENFERMERÍA UDEC · SOACHA</Text>
          </View>

          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => {
              const isActive = activeScreen === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.menuItem, isActive && styles.menuActive]}
                  onPress={() => navigation.navigate(item.key)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      isActive && styles.menuTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.userBox}>
            <Text style={styles.userRole}>Personal de Turno:</Text>
            <Text style={styles.userName}>cestebanruiz</Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.btnExitText}>↳ Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ÁREA DE CONTENIDO CON MARCA DE AGUA RESPONSIVA */}
      <View style={styles.contentWrapper} data-testid="content-container">
        <View style={styles.watermarkBox} pointerEvents="none">
          <UdecLogo
            width={isMobile ? 280 : 580}
            height={isMobile ? 280 : 580}
          />
        </View>

        <ScrollView
          style={[styles.content, isMobile && styles.contentMobile]}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          {children}
        </ScrollView>
      </View>

      {/* BOTÓN FLOTANTE IA GEMINI */}
      <TouchableOpacity
        style={[styles.fabGemini, isMobile && styles.fabGeminiMobile]}
        onPress={() => setShowGemini(true)}
      >
        <Text style={styles.fabText}>✨ IA Gemini</Text>
      </TouchableOpacity>

      <GeminiAssistantModal
        visible={showGemini}
        onClose={() => setShowGemini(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
  },
  mainLayoutMobile: {
    flexDirection: 'column',
  },

  // --- ESCRITORIO (SIDEBAR) ---
  sidebar: {
    width: 230,
    backgroundColor: COLORS.sidebarBg,
    padding: 20,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  logoHeader: { alignItems: 'center', marginBottom: 20 },
  logoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textLight || '#FFFFFF',
    marginTop: 4,
  },
  logoSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#A3E635',
    letterSpacing: 1,
  },
  menuList: { gap: 8, flex: 1, marginTop: 10 },
  menuItem: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuActive: { backgroundColor: '#FFFFFF' },
  menuText: {
    color: COLORS.textLight || '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  menuTextActive: { color: COLORS.primary, fontWeight: '900', fontSize: 12 },
  userBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 15,
  },
  userRole: { fontSize: 9, color: '#D1E7DD' },
  userName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  btnExitText: { color: '#FF8A80', fontSize: 11, fontWeight: 'bold' },

  // --- MÓVIL (TOPBAR + TABS DESLIZABLES) ---
  mobileNavWrapper: {
    backgroundColor: COLORS.sidebarBg,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 14,
    zIndex: 5,
  },
  mobileTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mobileSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#A3E635',
    letterSpacing: 0.8,
  },
  mobileUserRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileUserText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  mobileExitText: {
    color: '#FF8A80',
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  mobileTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  mobileTab: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  mobileTabActive: {
    backgroundColor: '#FFFFFF',
  },
  mobileTabText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mobileTabTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },

  // --- CONTENIDO ---
  contentWrapper: { flex: 1, position: 'relative', overflow: 'hidden' },
  watermarkBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
    zIndex: 0,
  },
  content: { flex: 1, padding: 24, zIndex: 1 },
  contentMobile: { padding: 14 },

  fabGemini: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 10,
  },
  fabGeminiMobile: {
    bottom: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
});