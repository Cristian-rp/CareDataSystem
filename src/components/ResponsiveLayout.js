import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { COLORS } from '../theme/colors';
import UdecLogo from './UdecLogo';
import GeminiAssistantModal from './GeminiAssistantModal';

export default function ResponsiveLayout({
  children,
  activeScreen,
  navigation,
  hideChrome = false,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [menuOpen, setMenuOpen] = useState(false);
  const [geminiVisible, setGeminiVisible] = useState(false);

  const menuItems = [
    { key: 'Inventario', label: '📦 Inventario y Stock', screen: 'Inventario' },
    { key: 'Usuarios', label: '🩺 Registro de Atenciones', screen: 'Usuarios' },
    { key: 'Proveedores', label: '🚚 Proveedores y Compras', screen: 'Proveedores' },
    { key: 'Historial', label: '📊 Historial y Reportes', screen: 'Historial' },
  ];

  const handleNavigate = (screen) => {
    setMenuOpen(false);
    navigation.navigate(screen);
  };

  // MODO IMPRESIÓN PDF: Solo renderiza el contenido limpio
  if (hideChrome) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 16 }}>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* BARRA SUPERIOR EN MÓVIL */}
      {isMobile && (
        <View style={styles.mobileTopBar}>
          <View style={styles.mobileBrand}>
            <UdecLogo width={34} height={34} />
            <View>
              <Text style={styles.mobileTitle}>CareData System</Text>
              <Text style={styles.mobileSub}>ENFERMERÍA UDEC · SOACHA</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.mainWrapper}>
        {/* SIDEBAR FIJO EN ESCRITORIO */}
        {!isMobile && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <UdecLogo width={64} height={64} />
              <Text style={styles.brandTitle}>CareData System</Text>
              <Text style={styles.brandSub}>ENFERMERÍA UDEC · SOACHA</Text>
            </View>

            <View style={styles.navGroup}>
              {menuItems.map((item) => {
                const isActive = activeScreen === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.navBtn, isActive && styles.navBtnActive]}
                    onPress={() => handleNavigate(item.screen)}
                  >
                    <Text
                      style={[
                        styles.navBtnText,
                        isActive && styles.navBtnTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.userBadge}>Enfermería · Turno Mañana</Text>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => navigation.replace('Login')}
              >
                <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ÁREA DE CONTENIDO CON MARCA DE AGUA */}
        <View style={styles.contentArea}>
          <View style={styles.watermarkContainer} pointerEvents="none">
            <UdecLogo width={isMobile ? 280 : 520} height={isMobile ? 280 : 520} />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isMobile && { padding: 14, paddingBottom: 90 },
            ]}
          >
            {children}
          </ScrollView>
        </View>
      </View>

      {/* MENÚ DESPLEGABLE EN MÓVIL */}
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerBox}>
            <View style={styles.drawerTop}>
              <UdecLogo width={50} height={50} />
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Text style={styles.closeDrawer}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.brandTitle}>CareData System</Text>
            <Text style={styles.brandSub}>ENFERMERÍA UDEC · SOACHA</Text>

            <View style={{ marginTop: 20, gap: 8 }}>
              {menuItems.map((item) => {
                const isActive = activeScreen === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.navBtn, isActive && styles.navBtnActive]}
                    onPress={() => handleNavigate(item.screen)}
                  >
                    <Text
                      style={[
                        styles.navBtnText,
                        isActive && styles.navBtnTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 'auto', paddingTop: 20 }}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.replace('Login');
                }}
              >
                <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOTÓN FLOTANTE DE IA GEMINI */}
      <TouchableOpacity
        style={[styles.fabGemini, isMobile && styles.fabGeminiMobile]}
        onPress={() => setGeminiVisible(true)}
      >
        <Text style={styles.fabText}>✨ IA Gemini</Text>
      </TouchableOpacity>

      <GeminiAssistantModal
        visible={geminiVisible}
        onClose={() => setGeminiVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  mainWrapper: { flex: 1, flexDirection: 'row' },
  mobileTopBar: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mobileTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  mobileSub: { color: '#A5D6A7', fontSize: 10, fontWeight: '700' },
  hamburgerBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  hamburgerIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },

  sidebar: {
    width: 245,
    backgroundColor: COLORS.primary,
    padding: 18,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
    paddingBottom: 16,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  brandSub: {
    color: '#A5D6A7',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  navGroup: { gap: 8, marginTop: 18, flex: 1 },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  navBtnActive: { backgroundColor: '#FFFFFF' },
  navBtnText: { color: '#E8F5E9', fontWeight: '700', fontSize: 13 },
  navBtnTextActive: { color: COLORS.primary, fontWeight: '900' },

  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  userBadge: {
    color: '#C8E6C9',
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutBtn: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: { color: '#FFCDD2', fontWeight: '800', fontSize: 12 },

  contentArea: { flex: 1, position: 'relative' },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.08,
    zIndex: 0,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 90,
    zIndex: 1,
  },

  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
  },
  drawerBox: {
    width: 270,
    backgroundColor: COLORS.primary,
    padding: 20,
    height: '100%',
  },
  drawerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeDrawer: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },

  fabGemini: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#A5D6A7',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 6,
    zIndex: 99,
  },
  fabGeminiMobile: {
    bottom: 14,
    right: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
});