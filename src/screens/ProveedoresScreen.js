import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { COLORS } from '../theme/colors';
import ResponsiveLayout from '../components/ResponsiveLayout';

export default function ProveedoresScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    proveedores,
    agregarProveedor,
    editarProveedor,
    eliminarProveedor,
  } = useContext(DataContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [ciudad, setCiudad] = useState('');

  const abrirModalNuevo = () => {
    setEditingId(null);
    setEmpresa('');
    setTelefono('');
    setCorreo('');
    setCiudad('Soacha');
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    setEditingId(item.id);
    setEmpresa(item.empresa || '');
    setTelefono(item.telefono || '');
    setCorreo(item.correo || '');
    setCiudad(item.ciudad || 'Soacha');
    setModalVisible(true);
  };

  const handleGuardarProveedor = () => {
    if (!empresa.trim() || !telefono.trim()) {
      Alert.alert(
        'Campos Incompletos',
        'Por favor ingresa el nombre de la empresa y el teléfono.'
      );
      return;
    }

    const payload = {
      empresa: empresa.trim(),
      telefono: telefono.trim(),
      correo: correo.trim() || 'N/A',
      ciudad: ciudad.trim() || 'Soacha',
    };

    if (editingId) {
      editarProveedor(editingId, payload);
    } else {
      agregarProveedor(payload);
    }

    setModalVisible(false);
    setEditingId(null);
    setEmpresa('');
    setTelefono('');
    setCorreo('');
    setCiudad('');
  };

  return (
    <ResponsiveLayout activeScreen="Proveedores" navigation={navigation}>
      <View style={[styles.topHeader, isMobile && styles.topHeaderMobile]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, isMobile && { fontSize: 19 }]}>
            Directorio de Proveedores
          </Text>
          <Text style={styles.pageSub}>
            Gestión de distribuidores para solicitudes de reabastecimiento
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.btnPrimary, isMobile && styles.btnPrimaryMobile]}
          onPress={abrirModalNuevo}
        >
          <Text style={styles.btnPrimaryText}>+ Registrar Proveedor</Text>
        </TouchableOpacity>
      </View>

      {isMobile ? (
        <View>
          <View style={styles.mobileSectionHeader}>
            <Text style={styles.tableHeaderTitle}>
              PROVEEDORES AUTORIZADOS ({proveedores.length})
            </Text>
          </View>

          {proveedores.length === 0 ? (
            <View style={styles.mobileEmptyCard}>
              <Text style={styles.emptyText}>No hay proveedores registrados.</Text>
              <Text style={styles.emptySub}>
                Toca "+ Registrar Proveedor" para agregar uno.
              </Text>
            </View>
          ) : (
            proveedores.map((item) => (
              <View key={item.id} style={styles.mobileItemCard}>
                <View style={styles.mobileCardTop}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.mobileCardTitle}>{item.empresa}</Text>
                    <Text style={styles.mobilePhoneText}>
                      📞 {item.telefono}
                    </Text>
                    <Text style={styles.mobileCardSub}>✉️ {item.correo}</Text>
                  </View>
                  <View style={styles.cityPill}>
                    <Text style={styles.cityPillText}>{item.ciudad}</Text>
                  </View>
                </View>

                <View style={styles.mobileCardActions}>
                  <TouchableOpacity
                    style={[
                      styles.mobileActionBtn,
                      styles.mobileActionBtnPrimary,
                    ]}
                    onPress={() => abrirModalEditar(item)}
                  >
                    <Text style={styles.mobileActionBtnPrimaryText}>
                      ✏️ Editar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.mobileActionBtn,
                      styles.mobileActionBtnDanger,
                    ]}
                    onPress={() => eliminarProveedor(item.id)}
                  >
                    <Text style={styles.mobileActionBtnDangerText}>
                      ✕ Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableTitleBar}>
            <Text style={styles.tableHeaderTitle}>
              TABLA DE PROVEEDORES AUTORIZADOS
            </Text>
          </View>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 2.1 }]}>
              EMPRESA / RAZÓN SOCIAL
            </Text>
            <Text style={[styles.th, { flex: 1.3 }]}>TELÉFONO</Text>
            <Text style={[styles.th, { flex: 2 }]}>CORREO ELECTRÓNICO</Text>
            <Text style={[styles.th, { flex: 1 }]}>CIUDAD</Text>
            <Text style={[styles.th, { flex: 1.1, textAlign: 'right' }]}>
              ACCIONES
            </Text>
          </View>

          {proveedores.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No hay proveedores registrados en la tabla.
              </Text>
              <Text style={styles.emptySub}>
                Presiona "+ Registrar Proveedor" para agregar un distribuidor.
              </Text>
            </View>
          ) : (
            proveedores.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2.1, fontWeight: 'bold' }]}>
                  {item.empresa}
                </Text>
                <Text style={[styles.tdCode, { flex: 1.3 }]}>
                  {item.telefono}
                </Text>
                <Text style={[styles.tdCategory, { flex: 2 }]}>
                  {item.correo}
                </Text>
                <Text style={[styles.td, { flex: 1 }]}>{item.ciudad}</Text>

                <View style={[styles.actionRow, { flex: 1.1 }]}>
                  <TouchableOpacity
                    style={styles.btnEdit}
                    onPress={() => abrirModalEditar(item)}
                  >
                    <Text style={styles.btnEditText}>✏️ Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDangerSmall}
                    onPress={() => eliminarProveedor(item.id)}
                  >
                    <Text style={styles.btnDangerText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* MODAL REGISTRAR / EDITAR PROVEEDOR */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderBar}>
              <Text style={styles.modalHeaderBarText}>
                {editingId
                  ? 'EDITAR DATOS DEL PROVEEDOR'
                  : 'REGISTRAR NUEVO PROVEEDOR'}
              </Text>
            </View>

            <View style={{ padding: 18 }}>
              <Text style={styles.labelField}>Empresa / Razón Social:</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la Empresa / Distribuidor"
                placeholderTextColor="#888"
                value={empresa}
                onChangeText={setEmpresa}
              />

              <Text style={styles.labelField}>Teléfono de Contacto:</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono de Contacto"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={telefono}
                onChangeText={setTelefono}
              />

              <Text style={styles.labelField}>Correo Electrónico:</Text>
              <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={correo}
                onChangeText={setCorreo}
              />

              <Text style={styles.labelField}>Ciudad / Ubicación:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ciudad / Ubicación"
                placeholderTextColor="#888"
                value={ciudad}
                onChangeText={setCiudad}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingId(null);
                  }}
                >
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnSave}
                  onPress={handleGuardarProveedor}
                >
                  <Text style={styles.btnSaveText}>
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  topHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  pageTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  pageSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
  },
  btnPrimaryMobile: { alignItems: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },

  mobileSectionHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  mobileEmptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 28,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  mobileItemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  mobileCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mobileCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  mobilePhoneText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  mobileCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cityPill: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cityPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  mobileCardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  mobileActionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  mobileActionBtnPrimary: {
    backgroundColor: '#DCFCE7',
    borderColor: COLORS.primary,
  },
  mobileActionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  mobileActionBtnDanger: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FECACA',
  },
  mobileActionBtnDangerText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.danger,
  },

  tableCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tableTitleBar: { backgroundColor: COLORS.primary, padding: 12 },
  tableHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 12,
    backgroundColor: COLORS.surfaceCard,
  },
  th: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tdCode: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  td: { fontSize: 12, color: COLORS.textPrimary },
  tdCategory: { fontSize: 11, color: COLORS.textSecondary },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  btnEdit: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnEditText: { color: COLORS.primary, fontWeight: '800', fontSize: 11 },
  btnDangerSmall: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnDangerText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 11 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  modalHeaderBar: { backgroundColor: COLORS.primary, padding: 14 },
  modalHeaderBarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  labelField: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  btnCancel: { padding: 10 },
  btnCancelText: { color: COLORS.textSecondary, fontSize: 13 },
  btnSave: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnSaveText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});