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

export default function InventarioScreen({ navigation }) {
  const { inventario, atenciones, agregarInsumo, actualizarStock, eliminarInsumo } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 768; 

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('10');
  const [lote, setLote] = useState('');

  const totalUnidades = inventario.reduce((acc, item) => acc + item.stock, 0);
  const stockCriticoCount = inventario.filter((item) => item.stock <= item.stockMinimo).length;

  const handleGuardar = () => {
    if (!codigo.trim() || !nombre.trim() || !stock) {
      Alert.alert('Incompleto', 'Ingresa el código, nombre y stock del producto.');
      return;
    }
    agregarInsumo({ codigo, nombre, categoria, stock, stockMinimo, lote });
    setModalVisible(false);
    setCodigo('');
    setNombre('');
    setCategoria('');
    setStock('');
    setLote('');
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
            <TouchableOpacity style={[styles.menuItem, styles.menuActive]}>
              <Text style={styles.menuTextActive}>📦 Dashboard / Insumos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Usuarios')}>
              <Text style={styles.menuText}>📋 Registro de Atenciones</Text>
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
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); }}>
              <Text style={styles.mobileMenuTextActive}>📦 Dashboard / Insumos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mobileMenuItem} onPress={() => { setMenuAbierto(false); navigation.navigate('Usuarios'); }}>
              <Text style={styles.mobileMenuText}>📋 Registro de Atenciones</Text>
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
              <Text style={[styles.pageTitle, isMobile && { fontSize: 18 }]}>Inventario General de Enfermería</Text>
              <Text style={styles.pageSub}>Monitoreo en tiempo real de insumos y medicamentos</Text>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setModalVisible(true)}>
              <Text style={styles.btnPrimaryText}>+ Registrar Insumo</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.kpiRow, isMobile && { flexWrap: 'wrap' }]}>
            <View style={[styles.kpiCard, isMobile && { minWidth: '45%' }]}>
              <Text style={styles.kpiTitle}>Tipos de Insumos</Text>
              <Text style={styles.kpiValue}>{inventario.length}</Text>
            </View>
            <View style={[styles.kpiCard, isMobile && { minWidth: '45%' }]}>
              <Text style={styles.kpiTitle}>Unidades en Stock</Text>
              <Text style={styles.kpiValue}>{totalUnidades} u.</Text>
            </View>
            <View style={[styles.kpiCard, stockCriticoCount > 0 && styles.kpiCardWarning, isMobile && { minWidth: '45%' }]}>
              <Text style={styles.kpiTitle}>Stock Bajo / Crítico</Text>
              <Text style={[styles.kpiValue, stockCriticoCount > 0 && { color: COLORS.danger }]}>{stockCriticoCount}</Text>
            </View>
            <View style={[styles.kpiCard, isMobile && { minWidth: '45%' }]}>
              <Text style={styles.kpiTitle}>Atenciones Registradas</Text>
              <Text style={styles.kpiValue}>{atenciones.length}</Text>
            </View>
          </View>

          {/* TABLA CORREGIDA */}
          <View style={styles.tableCard}>
            <View style={styles.tableTitleBar}>
              <Text style={styles.tableHeaderTitle}>TABLA GENERAL DE MEDICAMENTOS Y MATERIALES</Text>
            </View>
            
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={isMobile} contentContainerStyle={{ flexGrow: 1 }}>
              <View style={{ flex: 1, minWidth: isMobile ? 700 : '100%' }}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, { flex: 1 }]}>CÓDIGO</Text>
                  <Text style={[styles.th, { flex: 2 }]}>NOMBRE DEL INSUMO</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>CATEGORÍA</Text>
                  <Text style={[styles.th, { flex: 1 }]}>LOTE</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>DISPONIBLE</Text>
                  <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>ACCIONES</Text>
                </View>
                {inventario.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>No hay elementos guardados en la tabla.</Text>
                    <Text style={styles.emptySub}>Presiona "+ Registrar Insumo" para comenzar a poblar la tabla.</Text>
                  </View>
                ) : (
                  inventario.map((item) => {
                    const isLow = item.stock <= item.stockMinimo;
                    return (
                      <View key={item.id} style={styles.tableRow}>
                        <Text style={[styles.tdCode, { flex: 1 }]}>{item.codigo}</Text>
                        <Text style={[styles.td, { flex: 2, fontWeight: 'bold' }]}>{item.nombre}</Text>
                        <Text style={[styles.tdCategory, { flex: 1.5 }]}>{item.categoria || 'General'}</Text>
                        <Text style={[styles.td, { flex: 1 }]}>{item.lote}</Text>
                        <View style={[{ flex: 1, alignItems: 'center' }]}>
                          <Text style={[styles.badgeStock, isLow && styles.badgeLow]}>{item.stock} u.</Text>
                        </View>
                        <View style={[styles.actionRow, { flex: 1.5 }]}>
                          <TouchableOpacity style={styles.btnSmall} onPress={() => actualizarStock(item.id, -1)}><Text style={styles.btnSmallText}>-1</Text></TouchableOpacity>
                          <TouchableOpacity style={styles.btnSmall} onPress={() => actualizarStock(item.id, 1)}><Text style={styles.btnSmallText}>+1</Text></TouchableOpacity>
                          <TouchableOpacity style={styles.btnDangerSmall} onPress={() => eliminarInsumo(item.id)}><Text style={styles.btnDangerText}>✕</Text></TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
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
              <Text style={styles.modalHeaderBarText}>REGISTRAR NUEVO INSUMO / MEDICAMENTO</Text>
            </View>
            <ScrollView style={{ padding: 20 }}>
              <TextInput style={styles.input} placeholder="Código (Ej. GA-001, IB-400)" placeholderTextColor="#888" value={codigo} onChangeText={setCodigo} />
              <TextInput style={styles.input} placeholder="Nombre del Producto" placeholderTextColor="#888" value={nombre} onChangeText={setNombre} />
              <TextInput style={styles.input} placeholder="Categoría (Ej. Curación, Analgésicos)" placeholderTextColor="#888" value={categoria} onChangeText={setCategoria} />
              <TextInput style={styles.input} placeholder="Número de Lote / Serie" placeholderTextColor="#888" value={lote} onChangeText={setLote} />
              <TextInput style={styles.input} placeholder="Stock Inicial (Unidades)" placeholderTextColor="#888" keyboardType="numeric" value={stock} onChangeText={setStock} />
              <TextInput style={styles.input} placeholder="Stock Mínimo de Alerta" placeholderTextColor="#888" keyboardType="numeric" value={stockMinimo} onChangeText={setStockMinimo} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text style={styles.btnCancelText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.btnSave} onPress={handleGuardar}><Text style={styles.btnSaveText}>Guardar en Tabla</Text></TouchableOpacity>
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
  kpiRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.82)', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  kpiCardWarning: { borderColor: COLORS.danger, backgroundColor: 'rgba(255, 235, 238, 0.88)' },
  kpiTitle: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  
  tableCard: { backgroundColor: 'rgba(255, 255, 255, 0.88)', borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', width: '100%' }, // Aseguramos 100% de ancho
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
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  btnSmall: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  btnSmallText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 11 },
  btnDangerSmall: { backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  btnDangerText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 11 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  fabGemini: { position: 'absolute', bottom: 24, right: 24, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, zIndex: 10 },
  fabText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 420, backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', maxHeight: '90%' },
  modalHeaderBar: { backgroundColor: COLORS.primary, padding: 14 },
  modalHeaderBarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary, padding: 10, borderRadius: 6, marginBottom: 10, fontSize: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  btnCancel: { padding: 10 },
  btnCancelText: { color: COLORS.textSecondary, fontSize: 12 },
  btnSave: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  btnSaveText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
});