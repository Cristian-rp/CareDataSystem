import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { COLORS } from '../theme/colors';
import UdecLogo from '../components/UdecLogo';
import GeminiAssistantModal from '../components/GeminiAssistantModal';

export default function UsuariosScreen({ navigation }) {
  const { atenciones, inventario, registrarAtencion } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [paciente, setPaciente] = useState('');
  const [documento, setDocumento] = useState('');
  const [rol, setRol] = useState('Estudiante');
  const [motivo, setMotivo] = useState('');
  const [insumoId, setInsumoId] = useState('');

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);

  const rolesDisponibles = ['Estudiante', 'Docente', 'Administrativo'];

  const insumoSeleccionadoObj = inventario.find((i) => i.id === insumoId);
  const labelInsumoDefault = insumoSeleccionadoObj
    ? `${insumoSeleccionadoObj.nombre} (Disponible: ${insumoSeleccionadoObj.stock} u.)`
    : 'Ninguno (Solo consulta / Valoración)';

  const handleGuardarAtencion = () => {
    if (!paciente.trim() || !documento.trim() || !motivo.trim()) {
      Alert.alert('Incompleto', 'Por favor completa el Nombre, Documento y Motivo.');
      return;
    }
    registrarAtencion({ paciente: paciente.trim(), documento: documento.trim(), rol, motivo: motivo.trim() }, insumoId);
    setModalVisible(false);
    setPaciente('');
    setDocumento('');
    setRol('Estudiante');
    setMotivo('');
    setInsumoId('');
    setShowRoleDropdown(false);
    setShowInsumoDropdown(false);
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
            <TouchableOpacity style={[styles.menuItem, styles.menuActive]}>
              <Text style={styles.menuTextActive}>📋 Registro de Atenciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Proveedores')}>
              <Text style={styles.menuText}>🚚 Proveedores y Pedidos</Text>
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
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); }}>
              <Text style={styles.mobileMenuTextActive}>📋 Registro de Atenciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); navigation.navigate('Proveedores'); }}>
              <Text style={styles.mobileMenuText}>🚚 Proveedores y Pedidos</Text>
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
              <Text style={[styles.pageTitle, isMobile && { fontSize: 18 }]}>Registro Diario de Pacientes Atendidos</Text>
              <Text style={styles.pageSub}>Historial de consultas e insumos entregados a la comunidad UDEC</Text>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setModalVisible(true)}>
              <Text style={styles.btnPrimaryText}>+ Nueva Atención</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableTitleBar}>
              <Text style={styles.tableHeaderTitle}>TABLA DE REGISTROS DE ATENCIÓN MÉDICA</Text>
            </View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={isMobile} contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flex: 1, minWidth: isMobile ? 800 : '100%' }}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, { flex: 1 }]}>FECHA</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>DOCUMENTO</Text>
                  <Text style={[styles.th, { flex: 2 }]}>PACIENTE</Text>
                  <Text style={[styles.th, { flex: 1 }]}>ROL</Text>
                  <Text style={[styles.th, { flex: 2 }]}>MOTIVO / DIAGNÓSTICO</Text>
                  <Text style={[styles.th, { flex: 2 }]}>INSUMO SUMINISTRADO</Text>
                </View>
                {atenciones.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No hay atenciones registradas en la tabla.</Text>
                    <Text style={styles.emptySub}>Presiona "+ Nueva Atención" para ingresar un paciente atendido.</Text>
                  </View>
                ) : (
                  atenciones.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.td, { flex: 1 }]}>{item.fecha}</Text>
                      <Text style={[styles.tdCode, { flex: 1.5 }]}>{item.documento}</Text>
                      <Text style={[styles.td, { flex: 2, fontWeight: 'bold' }]}>{item.paciente}</Text>
                      <Text style={[styles.tdCategory, { flex: 1 }]}>{item.rol}</Text>
                      <Text style={[styles.td, { flex: 2 }]}>{item.motivo}</Text>
                      <Text style={[styles.tdInsumo, { flex: 2 }]}>{item.insumoSuministrado}</Text>
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

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isMobile && { width: '90%' }]}>
            <View style={styles.modalHeaderBar}>
              <Text style={styles.modalHeaderBarText}>REGISTRAR ATENCIÓN MÉDICA</Text>
            </View>
            <ScrollView style={{ padding: 20 }}>
              <TextInput style={styles.input} placeholder="Nombre Completo del Paciente" placeholderTextColor="#888" value={paciente} onChangeText={setPaciente} />
              <TextInput style={styles.input} placeholder="Documento de Identidad (ID / Cédula)" placeholderTextColor="#888" keyboardType="numeric" value={documento} onChangeText={setDocumento} />
              
              <Text style={styles.labelField}>Rol de la Persona:</Text>
              <TouchableOpacity style={styles.selectHeader} onPress={() => setShowRoleDropdown(!showRoleDropdown)}>
                <Text style={styles.selectHeaderText}>{rol}</Text>
                <Text style={styles.selectHeaderArrow}>{showRoleDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showRoleDropdown && (
                <View style={styles.dropdownContainer}>
                  {rolesDisponibles.map((itemRol) => (
                    <TouchableOpacity key={itemRol} style={[styles.dropdownItem, rol === itemRol && styles.dropdownItemActive]} onPress={() => { setRol(itemRol); setShowRoleDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{itemRol}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Motivo de la atención / Síntomas" placeholderTextColor="#888" value={motivo} onChangeText={setMotivo} />
              
              <Text style={styles.labelField}>Suministrar Insumo del Inventario (Opcional):</Text>
              <TouchableOpacity style={styles.selectHeader} onPress={() => setShowInsumoDropdown(!showInsumoDropdown)}>
                <Text style={styles.selectHeaderText}>{labelInsumoDefault}</Text>
                <Text style={styles.selectHeaderArrow}>{showInsumoDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showInsumoDropdown && (
                <ScrollView style={styles.dropdownScrollContainer}>
                  <TouchableOpacity style={[styles.dropdownItem, insumoId === '' && styles.dropdownItemActive]} onPress={() => { setInsumoId(''); setShowInsumoDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>Ninguno (Solo consulta / Valoración)</Text>
                  </TouchableOpacity>
                  {inventario.map((ins) => (
                    <TouchableOpacity key={ins.id} style={[styles.dropdownItem, insumoId === ins.id && styles.dropdownItemActive]} onPress={() => { setInsumoId(ins.id); setShowInsumoDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{ins.nombre} (Disponible: {ins.stock} u.)</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => { setModalVisible(false); setShowRoleDropdown(false); setShowInsumoDropdown(false); }}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSave} onPress={handleGuardarAtencion}>
                  <Text style={styles.btnSaveText}>Guardar Registro</Text>
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
  
  tableCard: { backgroundColor: 'rgba(255, 255, 255, 0.88)', borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', width: '100%' },
  tableTitleBar: { backgroundColor: COLORS.primary, padding: 12 },
  tableHeaderTitle: { fontSize: 11, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, padding: 12, backgroundColor: COLORS.surfaceCard },
  th: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tdCode: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  td: { fontSize: 12, color: COLORS.textPrimary },
  tdCategory: { fontSize: 11, color: COLORS.textSecondary },
  tdInsumo: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  fabGemini: { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, elevation: 6, zIndex: 10 },
  fabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 440, backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', maxHeight: '90%' },
  modalHeaderBar: { backgroundColor: COLORS.primary, padding: 14 },
  modalHeaderBarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  labelField: { fontSize: 11, fontWeight: '800', color: COLORS.primary, marginBottom: 4, marginTop: 6 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary, padding: 10, borderRadius: 6, marginBottom: 8, fontSize: 12 },
  selectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.primary, padding: 10, borderRadius: 6, marginBottom: 4 },
  selectHeaderText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  selectHeaderArrow: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
  dropdownContainer: { backgroundColor: COLORS.surfaceCard, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, marginBottom: 8 },
  dropdownScrollContainer: { maxHeight: 120, backgroundColor: COLORS.surfaceCard, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, marginBottom: 8 },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemActive: { backgroundColor: COLORS.accentLight, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  dropdownItemText: { color: COLORS.textPrimary, fontSize: 11 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  btnCancel: { padding: 10 },
  btnCancelText: { color: COLORS.textSecondary, fontSize: 12 },
  btnSave: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  btnSaveText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
});