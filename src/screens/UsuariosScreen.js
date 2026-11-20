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
import ResponsiveLayout from '../components/ResponsiveLayout';

export default function UsuariosScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    atenciones,
    inventario,
    registrarAtencion,
    editarAtencion,
    eliminarAtencion,
  } = useContext(DataContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [paciente, setPaciente] = useState('');
  const [documento, setDocumento] = useState('');
  const [rol, setRol] = useState('Estudiante');
  const [motivo, setMotivo] = useState('');
  const [insumoId, setInsumoId] = useState('');
  const [insumoTextoActual, setInsumoTextoActual] = useState('');

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);

  const rolesDisponibles = ['Estudiante', 'Docente', 'Administrativo'];

  const insumoSeleccionadoObj = inventario.find((i) => i.id === insumoId);
  const labelInsumoDefault = insumoSeleccionadoObj
    ? `${insumoSeleccionadoObj.nombre} (Disponible: ${insumoSeleccionadoObj.stock} u.)`
    : editingId && insumoTextoActual
    ? insumoTextoActual
    : 'Ninguno (Solo consulta / Valoración)';

  const abrirModalNuevo = () => {
    setEditingId(null);
    setPaciente('');
    setDocumento('');
    setRol('Estudiante');
    setMotivo('');
    setInsumoId('');
    setInsumoTextoActual('');
    setShowRoleDropdown(false);
    setShowInsumoDropdown(false);
    setModalVisible(true);
  };

  const abrirModalEditar = (item) => {
    setEditingId(item.id);
    setPaciente(item.paciente || '');
    setDocumento(item.documento || '');
    setRol(item.rol || 'Estudiante');
    setMotivo(item.motivo || '');

    const insumoEncontrado =
      inventario.find((i) => i.id === item.insumoId) ||
      inventario.find((i) => i.nombre === item.insumoSuministrado);

    setInsumoId(insumoEncontrado ? insumoEncontrado.id : '');
    setInsumoTextoActual(item.insumoSuministrado || 'Ninguno (Solo valoración)');
    setShowRoleDropdown(false);
    setShowInsumoDropdown(false);
    setModalVisible(true);
  };

  const handleGuardarAtencion = () => {
    if (!paciente.trim() || !documento.trim() || !motivo.trim()) {
      Alert.alert(
        'Incompleto',
        'Por favor completa el Nombre, Documento y Motivo.'
      );
      return;
    }

    if (editingId) {
      editarAtencion(
        editingId,
        {
          paciente: paciente.trim(),
          documento: documento.trim(),
          rol,
          motivo: motivo.trim(),
          insumoSuministrado: insumoTextoActual,
        },
        insumoId
      );
    } else {
      registrarAtencion(
        {
          paciente: paciente.trim(),
          documento: documento.trim(),
          rol,
          motivo: motivo.trim(),
        },
        insumoId
      );
    }

    setModalVisible(false);
    setEditingId(null);
    setPaciente('');
    setDocumento('');
    setRol('Estudiante');
    setMotivo('');
    setInsumoId('');
    setInsumoTextoActual('');
    setShowRoleDropdown(false);
    setShowInsumoDropdown(false);
  };

  return (
    <ResponsiveLayout activeScreen="Usuarios" navigation={navigation}>
      <View style={[styles.topHeader, isMobile && styles.topHeaderMobile]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, isMobile && { fontSize: 19 }]}>
            Registro Diario de Pacientes
          </Text>
          <Text style={styles.pageSub}>
            Historial de consultas e insumos entregados a la comunidad UDEC
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.btnPrimary, isMobile && styles.btnPrimaryMobile]}
          onPress={abrirModalNuevo}
        >
          <Text style={styles.btnPrimaryText}>+ Nueva Atención</Text>
        </TouchableOpacity>
      </View>

      {/* TARJETAS EN MÓVIL / TABLA EN ESCRITORIO */}
      {isMobile ? (
        <View>
          <View style={styles.mobileSectionHeader}>
            <Text style={styles.tableHeaderTitle}>
              ATENCIONES REGISTRADAS ({atenciones.length})
            </Text>
          </View>

          {atenciones.length === 0 ? (
            <View style={styles.mobileEmptyCard}>
              <Text style={styles.emptyText}>No hay atenciones registradas.</Text>
              <Text style={styles.emptySub}>
                Toca "+ Nueva Atención" para registrar un paciente.
              </Text>
            </View>
          ) : (
            atenciones.map((item) => (
              <View key={item.id} style={styles.mobileItemCard}>
                <View style={styles.mobileCardTop}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.mobileCodeBadge}>
                      {item.fecha} · Doc. {item.documento}
                    </Text>
                    <Text style={styles.mobileCardTitle}>{item.paciente}</Text>
                  </View>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{item.rol}</Text>
                  </View>
                </View>

                <Text style={styles.mobileMotivoText}>
                  <Text style={{ fontWeight: '800' }}>Motivo: </Text>
                  {item.motivo}
                </Text>

                <View style={styles.insumoBanner}>
                  <Text style={styles.insumoBannerText}>
                    💊 Suministro: {item.insumoSuministrado}
                  </Text>
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

                  {eliminarAtencion && (
                    <TouchableOpacity
                      style={[
                        styles.mobileActionBtn,
                        styles.mobileActionBtnDanger,
                      ]}
                      onPress={() => eliminarAtencion(item.id)}
                    >
                      <Text style={styles.mobileActionBtnDangerText}>
                        ✕ Eliminar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableTitleBar}>
            <Text style={styles.tableHeaderTitle}>
              TABLA DE REGISTROS DE ATENCIÓN MÉDICA
            </Text>
          </View>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 0.9 }]}>FECHA</Text>
            <Text style={[styles.th, { flex: 1.1 }]}>DOCUMENTO</Text>
            <Text style={[styles.th, { flex: 1.7 }]}>PACIENTE</Text>
            <Text style={[styles.th, { flex: 1 }]}>ROL</Text>
            <Text style={[styles.th, { flex: 1.9 }]}>MOTIVO / DIAGNÓSTICO</Text>
            <Text style={[styles.th, { flex: 1.6 }]}>INSUMO SUMINISTRADO</Text>
            <Text style={[styles.th, { flex: 1.1, textAlign: 'right' }]}>
              ACCIONES
            </Text>
          </View>

          {atenciones.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No hay atenciones registradas en la tabla.
              </Text>
              <Text style={styles.emptySub}>
                Presiona "+ Nueva Atención" para ingresar un paciente atendido.
              </Text>
            </View>
          ) : (
            atenciones.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 0.9 }]}>{item.fecha}</Text>
                <Text style={[styles.tdCode, { flex: 1.1 }]}>
                  {item.documento}
                </Text>
                <Text style={[styles.td, { flex: 1.7, fontWeight: 'bold' }]}>
                  {item.paciente}
                </Text>
                <Text style={[styles.tdCategory, { flex: 1 }]}>{item.rol}</Text>
                <Text style={[styles.td, { flex: 1.9 }]}>{item.motivo}</Text>
                <Text style={[styles.tdInsumo, { flex: 1.6 }]}>
                  {item.insumoSuministrado}
                </Text>

                <View style={[styles.actionRow, { flex: 1.1 }]}>
                  <TouchableOpacity
                    style={styles.btnEdit}
                    onPress={() => abrirModalEditar(item)}
                  >
                    <Text style={styles.btnEditText}>✏️ Editar</Text>
                  </TouchableOpacity>

                  {eliminarAtencion && (
                    <TouchableOpacity
                      style={styles.btnDangerSmall}
                      onPress={() => eliminarAtencion(item.id)}
                    >
                      <Text style={styles.btnDangerText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* MODAL REGISTRAR / EDITAR ATENCIÓN */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderBar}>
              <Text style={styles.modalHeaderBarText}>
                {editingId
                  ? 'EDITAR REGISTRO DE ATENCIÓN'
                  : 'REGISTRAR ATENCIÓN MÉDICA'}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: '85%' }}>
              <View style={{ padding: 18 }}>
                <Text style={styles.labelField}>
                  Nombre Completo del Paciente:
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre Completo del Paciente"
                  placeholderTextColor="#888"
                  value={paciente}
                  onChangeText={setPaciente}
                />

                <Text style={styles.labelField}>Documento de Identidad:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Documento de Identidad (ID / Cédula)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={documento}
                  onChangeText={setDocumento}
                />

                <Text style={styles.labelField}>Rol de la Persona:</Text>
                <TouchableOpacity
                  style={styles.selectHeader}
                  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                >
                  <Text style={styles.selectHeaderText}>{rol}</Text>
                  <Text style={styles.selectHeaderArrow}>
                    {showRoleDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showRoleDropdown && (
                  <View style={styles.dropdownContainer}>
                    {rolesDisponibles.map((itemRol) => (
                      <TouchableOpacity
                        key={itemRol}
                        style={[
                          styles.dropdownItem,
                          rol === itemRol && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setRol(itemRol);
                          setShowRoleDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{itemRol}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.labelField}>Motivo / Diagnóstico:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Motivo de la atención / Síntomas"
                  placeholderTextColor="#888"
                  value={motivo}
                  onChangeText={setMotivo}
                />

                <Text style={styles.labelField}>
                  Insumo Suministrado del Inventario:
                </Text>
                <TouchableOpacity
                  style={styles.selectHeader}
                  onPress={() => setShowInsumoDropdown(!showInsumoDropdown)}
                >
                  <Text style={styles.selectHeaderText}>
                    {labelInsumoDefault}
                  </Text>
                  <Text style={styles.selectHeaderArrow}>
                    {showInsumoDropdown ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showInsumoDropdown && (
                  <ScrollView style={styles.dropdownScrollContainer}>
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        insumoId === '' && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setInsumoId('');
                        setInsumoTextoActual('Ninguno (Solo valoración)');
                        setShowInsumoDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        Ninguno (Solo consulta / Valoración)
                      </Text>
                    </TouchableOpacity>

                    {inventario.map((ins) => (
                      <TouchableOpacity
                        key={ins.id}
                        style={[
                          styles.dropdownItem,
                          insumoId === ins.id && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setInsumoId(ins.id);
                          setInsumoTextoActual(ins.nombre);
                          setShowInsumoDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {ins.nombre} (Disponible: {ins.stock} u.)
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => {
                      setModalVisible(false);
                      setEditingId(null);
                      setShowRoleDropdown(false);
                      setShowInsumoDropdown(false);
                    }}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnSave}
                    onPress={handleGuardarAtencion}
                  >
                    <Text style={styles.btnSaveText}>
                      {editingId ? 'Actualizar' : 'Guardar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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

  // --- TARJETAS MÓVILES ---
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
    marginBottom: 8,
  },
  mobileCodeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  mobileCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  rolePill: {
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  mobileMotivoText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  insumoBanner: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  insumoBannerText: {
    fontSize: 12,
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

  // --- TABLA ESCRITORIO ---
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
  tdInsumo: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
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
    maxWidth: 440,
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
    marginBottom: 8,
    fontSize: 13,
  },
  selectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectHeaderText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  selectHeaderArrow: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
  dropdownContainer: {
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    marginBottom: 8,
  },
  dropdownScrollContainer: {
    maxHeight: 120,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    marginBottom: 8,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.accentLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  dropdownItemText: { color: COLORS.textPrimary, fontSize: 12 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
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