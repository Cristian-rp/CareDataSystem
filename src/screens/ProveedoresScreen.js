import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import UdecLogo from '../components/UdecLogo';
import GeminiAssistantModal from '../components/GeminiAssistantModal';

export default function ProveedoresScreen({ navigation }) {
  const [showGemini, setShowGemini] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [proveedores, setProveedores] = useState([
    { id: '1', empresa: 'Droguerías e Insumos Médicos UDEC', telefono: '6015551234', correo: 'ventas@insumosmedicos.com', ciudad: 'Soacha' },
    { id: '2', empresa: 'Distribuidora Sanitaria Soacha', telefono: '3109876543', correo: 'contacto@dissanitaria.co', ciudad: 'Soacha' },
  ]);

  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [ciudad, setCiudad] = useState('');

  const handleGuardarProveedor = () => {
    if (!empresa.trim() || !telefono.trim()) return;
    setProveedores([...proveedores, { id: Date.now().toString(), empresa: empresa.trim(), telefono: telefono.trim(), correo: correo.trim() || 'N/A', ciudad: ciudad.trim() || 'Soacha' }]);
    setModalVisible(false);
    setEmpresa('');
    setTelefono('');
    setCorreo('');
    setCiudad('');
  };

  return (
    <View style={styles.mainLayout}>
      {!isMobile && (
        <View style={styles.sidebar}>
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
            <TouchableOpacity style={[styles.menuItem, styles.menuActive]}>
              <Text style={styles.menuTextActive}>🚚 Proveedores y Pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Historial')}>
              <Text style={styles.menuText}>📊 Historial y Reportes</Text>
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

      <View style={styles.contentWrapper}>
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
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); }}>
              <Text style={styles.mobileMenuTextActive}>🚚 Proveedores y Pedidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); navigation.navigate('Historial'); }}>
              <Text style={styles.mobileMenuText}>📊 Historial y Reportes</Text>
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
              <Text style={[styles.pageTitle, isMobile && { fontSize: 18 }]}>Directorio de Proveedores e Insumos</Text>
              <Text style={styles.pageSub}>Gestión de distribuidores para solicitudes de reabastecimiento</Text>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setModalVisible(true)}>
              <Text style={styles.btnPrimaryText}>+ Registrar Proveedor</Text>
            </TouchableOpacity>
          </View>

          {/* TABLA CORREGIDA */}
          <View style={styles.tableCard}>
            <View style={styles.tableTitleBar}>
              <Text style={styles.tableHeaderTitle}>TABLA DE PROVEEDORES AUTORIZADOS</Text>
            </View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={isMobile} contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flex: 1, minWidth: isMobile ? 700 : '100%' }}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, { flex: 2 }]}>EMPRESA / RAZÓN SOCIAL</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>TELÉFONO</Text>
                  <Text style={[styles.th, { flex: 2 }]}>CORREO ELECTRÓNICO</Text>
                  <Text style={[styles.th, { flex: 1 }]}>CIUDAD</Text>
                </View>
                {proveedores.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.td, { flex: 2, fontWeight: 'bold' }]}>{item.empresa}</Text>
                    <Text style={[styles.tdCode, { flex: 1.5 }]}>{item.telefono}</Text>
                    <Text style={[styles.tdCategory, { flex: 2 }]}>{item.correo}</Text>
                    <Text style={[styles.td, { flex: 1 }]}>{item.ciudad}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.fabGemini} onPress={() => setShowGemini(true)}>
        <Text style={styles.fabText}>✨ IA Gemini</Text>
      </TouchableOpacity>
      <GeminiAssistantModal visible={showGemini} onClose={() => setShowGemini(false)} />

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isMobile && { width: '90%' }]}>
            <View style={styles.modalHeaderBar}>
              <Text style={styles.modalHeaderBarText}>REGISTRAR NUEVO PROVEEDOR</Text>
            </View>
            <ScrollView style={{ padding: 20 }}>
              <TextInput style={styles.input} placeholder="Nombre de la Empresa / Distribuidor" placeholderTextColor="#888" value={empresa} onChangeText={setEmpresa} />
              <TextInput style={styles.input} placeholder="Teléfono de Contacto" placeholderTextColor="#888" keyboardType="numeric" value={telefono} onChangeText={setTelefono} />
              <TextInput style={styles.input} placeholder="Correo Electrónico" placeholderTextColor="#888" value={correo} onChangeText={setCorreo} />
              <TextInput style={styles.input} placeholder="Ciudad / Ubicación" placeholderTextColor="#888" value={ciudad} onChangeText={setCiudad} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSave} onPress={handleGuardarProveedor}>
                  <Text style={styles.btnSaveText}>Guardar Proveedor</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  
  tableCard: { backgroundColor: 'rgba(255, 255, 255, 0.88)', borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', width: '100%' }, // CORREGIDO
  tableTitleBar: { backgroundColor: COLORS.primary, padding: 12 },
  tableHeaderTitle: { fontSize: 11, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, padding: 12, backgroundColor: COLORS.surfaceCard },
  th: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tdCode: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  td: { fontSize: 12, color: COLORS.textPrimary },
  tdCategory: { fontSize: 11, color: COLORS.textSecondary },
  fabGemini: { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, elevation: 6, zIndex: 10 },
  fabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 420, backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', maxHeight: '90%' },
  modalHeaderBar: { backgroundColor: COLORS.primary, padding: 14 },
  modalHeaderBarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary, padding: 10, borderRadius: 6, marginBottom: 10, fontSize: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  btnCancel: { padding: 10 },
  btnCancelText: { color: COLORS.textSecondary, fontSize: 12 },
  btnSave: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  btnSaveText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
});