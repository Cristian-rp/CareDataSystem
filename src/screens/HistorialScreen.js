import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import UdecLogo from '../components/UdecLogo';
import GeminiAssistantModal from '../components/GeminiAssistantModal';
import { DataContext } from '../context/DataContext'; // Importamos el contexto

export default function HistorialScreen({ navigation }) {
  const [showGemini, setShowGemini] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  // Traemos el historial real desde la base de datos
  const { historial } = useContext(DataContext);
  
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleExportarPDF = () => {
    if (Platform.OS === 'web') {
      const styleId = 'print-pdf-clean-strict';
      let styleElement = document.getElementById(styleId);

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.innerHTML = `
        @media print {
          #print-hide-sidebar { display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; position: absolute !important; left: -9999px !important; }
          #print-hide-sidebar * { display: none !important; }
          button, [role="button"], div[style*="bottom: 24px"] { display: none !important; }
          html, body, #root, div { overflow: visible !important; height: auto !important; max-height: none !important; background-color: #FFFFFF !important; }
          div[data-testid="content-container"] { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; position: relative !important; left: 0 !important; top: 0 !important; }
          div[data-testid="table-container"] { display: block !important; width: 100% !important; border: 1px solid #CBD5E1 !important; }
          @page { size: A4 portrait; margin: 12mm; }
        }
      `;

      window.print();
    } else {
      Alert.alert('Reporte Generado', 'Vista previa de la tabla preparada.');
    }
  };

  return (
    <View style={styles.mainLayout}>
      {!isMobile && (
        <View style={styles.sidebar} nativeID="print-hide-sidebar" data-testid="sidebar-container">
          <View style={styles.logoHeader}>
            <Text style={styles.logoTitle}>CareData System</Text>
            <Text style={styles.logoSub}>ENFERMERÍA UDEC · SOACHA</Text>
          </View>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Inventario')}>
              <Text style={styles.menuText}>📦 Dashboard / Insumos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Usuarios')}>
              <Text style={styles.menuText}>📋 Registro de Atenciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Proveedores')}>
              <Text style={styles.menuText}>🚚 Proveedores y Pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuActive]}>
              <Text style={styles.menuTextActive}>📊 Historial y Reportes</Text>
            </TouchableOpacity>
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

      <View style={styles.contentWrapper} data-testid="content-container">
        {isMobile && (
          <View style={styles.mobileHeader}>
            <TouchableOpacity onPress={() => setMenuAbierto(!menuAbierto)} style={styles.btnHamburger}>
              <Text style={styles.btnHamburgerText}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.mobileHeaderTitle}>CareData System</Text>
          </View>
        )}

        {isMobile && menuAbierto && (
          <View style={styles.mobileMenu}>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); navigation.navigate('Inventario'); }}>
              <Text style={styles.mobileMenuText}>📦 Dashboard / Insumos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); navigation.navigate('Usuarios'); }}>
              <Text style={styles.mobileMenuText}>📋 Registro de Atenciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); navigation.navigate('Proveedores'); }}>
              <Text style={styles.mobileMenuText}>🚚 Proveedores y Pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); }}>
              <Text style={styles.mobileMenuTextActive}>📊 Historial y Reportes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); navigation.replace('Login'); }}>
              <Text style={styles.btnExitText}>↳ Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.watermarkBox} pointerEvents="none">
          <UdecLogo width={isMobile ? 300 : 580} height={isMobile ? 300 : 580} />
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.topHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 15 }]}>
            <View>
              <Text style={[styles.pageTitle, isMobile && { fontSize: 18 }]}>Historial de Movimientos y Auditoría</Text>
              <Text style={styles.pageSub}>Trazabilidad de entradas, salidas por atención y ajustes de inventario</Text>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleExportarPDF}>
              <Text style={styles.btnPrimaryText}>📄 Generar Reporte PDF</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard} data-testid="table-container">
            <View style={styles.tableTitleBar}>
              <Text style={styles.tableHeaderTitle}>REGISTRO DE TRAZABILIDAD DE INVENTARIO</Text>
            </View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={isMobile} contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flex: 1, minWidth: isMobile ? 800 : '100%' }}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, { flex: 1.2 }]}>FECHA / HORA</Text>
                  <Text style={[styles.th, { flex: 1 }]}>TIPO</Text>
                  <Text style={[styles.th, { flex: 2 }]}>INSUMO / PRODUCTO</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>CANTIDAD</Text>
                  <Text style={[styles.th, { flex: 2.5 }]}>OBSERVACIONES / DETALLE</Text>
                </View>
                
                {/* AQUÍ SE RENDERIZA EL HISTORIAL DE SUPABASE */}
                {historial.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No hay movimientos registrados en la tabla.</Text>
                    <Text style={styles.emptySub}>Los movimientos aparecerán aquí cuando registres insumos o atenciones.</Text>
                  </View>
                ) : (
                  historial.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tdCode, { flex: 1.2 }]}>{item.fecha}</Text>
                      <Text style={[styles.tdCategory, { flex: 1 }]}>{item.tipo}</Text>
                      <Text style={[styles.td, { flex: 2, fontWeight: 'bold' }]}>{item.insumo}</Text>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={[styles.badgeStock, item.cantidad.includes('-') && styles.badgeLow]}>
                          {item.cantidad}
                        </Text>
                      </View>
                      <Text style={[styles.td, { flex: 2.5 }]}>{item.obs}</Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.fabGemini} onPress={() => setShowGemini(true)}>
        <Text style={styles.fabText}>✨ IA Gemini</Text>
      </TouchableOpacity>
      <GeminiAssistantModal visible={showGemini} onClose={() => setShowGemini(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainLayout: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.background },
  sidebar: { width: 230, backgroundColor: COLORS.sidebarBg, padding: 20, justifyContent: 'space-between', zIndex: 2 },
  logoHeader: { alignItems: 'center', marginBottom: 20 },
  logoTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textLight, marginTop: 4 },
  logoSub: { fontSize: 8, fontWeight: '800', color: '#A3E635', letterSpacing: 1 },
  menuList: { gap: 8, flex: 1, marginTop: 10 },
  menuItem: { padding: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)' },
  menuActive: { backgroundColor: '#FFFFFF' },
  menuText: { color: COLORS.textLight, fontWeight: '700', fontSize: 12 },
  menuTextActive: { color: COLORS.primary, fontWeight: '900', fontSize: 12 },
  userBox: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 15 },
  userRole: { fontSize: 9, color: '#D1E7DD' },
  userName: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  btnExitText: { color: '#FF8A80', fontSize: 11, fontWeight: 'bold' },

  mobileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.sidebarBg, padding: 15, zIndex: 10 },
  btnHamburger: { paddingRight: 15 },
  btnHamburgerText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  mobileHeaderTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  mobileMenu: { backgroundColor: COLORS.sidebarBg, padding: 15, position: 'absolute', top: 60, left: 0, right: 0, zIndex: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  mobileMenuItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  mobileMenuText: { color: COLORS.textLight, fontSize: 14, fontWeight: '700' },
  mobileMenuTextActive: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  contentWrapper: { flex: 1, position: 'relative', overflow: 'hidden' },
  watermarkBox: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', opacity: 0.10, zIndex: 0 },
  content: { flex: 1, padding: 24, zIndex: 1 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  pageSub: { fontSize: 12, color: COLORS.textSecondary },
  btnPrimary: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  
  tableCard: { backgroundColor: 'rgba(255, 255, 255, 0.88)', borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', width: '100%' },
  tableTitleBar: { backgroundColor: COLORS.primary, padding: 12 },
  tableHeaderTitle: { fontSize: 11, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, padding: 12, backgroundColor: COLORS.surfaceCard },
  th: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tdCode: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  td: { fontSize: 12, color: COLORS.textPrimary },
  tdCategory: { fontSize: 11, color: COLORS.textSecondary },
  badgeStock: { backgroundColor: COLORS.accentLight, color: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 11, fontWeight: 'bold' },
  badgeLow: { backgroundColor: '#FFEBEE', color: COLORS.danger },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  fabGemini: { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, elevation: 6, zIndex: 10 },
  fabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
});