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

const CATEGORIAS_INSUMOS = [
  'Analgésicos',
  'Curación',
  'Desinfectantes',
  'Soluciones',
  'Antiinflamatorios',
  'Insumos Descartables',
  'Equipos Médicos',
  'Primeros Auxilios',
  'General',
];

export default function InventarioScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    inventario,
    atenciones,
    agregarInsumo,
    actualizarStock,
    eliminarInsumo,
  } = useContext(DataContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Analgésicos');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('10');
  const [lote, setLote] = useState('');

  // Modal ajuste rápido
  const [ajusteModalVisible, setAjusteModalVisible] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
  const [modoAjuste, setModoAjuste] = useState('sumar');
  const [cantidadAjuste, setCantidadAjuste] = useState('');

  const totalUnidades = inventario.reduce((acc, item) => acc + item.stock, 0);
  const stockCriticoCount = inventario.filter(
    (item) => item.stock <= item.stockMinimo
  ).length;

  const handleAbrirModal = () => {
    setCategoria('Analgésicos');
    setDropdownOpen(false);
    setModalVisible(true);
  };

  const handleGuardar = () => {
    if (!codigo.trim() || !nombre.trim() || !stock) {
      Alert.alert(
        'Campos Incompletos',
        'Ingresa el código, nombre y stock inicial del insumo.'
      );
      return;
    }

    agregarInsumo({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      categoria,
      stock: parseInt(stock, 10) || 0,
      stockMinimo: parseInt(stockMinimo, 10) || 10,
      lote: lote.trim(),
    });

    setModalVisible(false);
    setDropdownOpen(false);
    setCodigo('');
    setNombre('');
    setCategoria('Analgésicos');
    setStock('');
    setStockMinimo('10');
    setLote('');
  };

  const abrirModalAjuste = (item) => {
    setInsumoSeleccionado(item);
    setModoAjuste('sumar');
    setCantidadAjuste('');
    setAjusteModalVisible(true);
  };

  const aplicarAjusteRapido = (delta) => {
    if (!insumoSeleccionado) return;
    actualizarStock(insumoSeleccionado.id, delta);
    setInsumoSeleccionado((prev) => ({
      ...prev,
      stock: Math.max(0, prev.stock + delta),
    }));
  };

  const confirmarAjustePersonalizado = () => {
    if (!insumoSeleccionado) return;
    const valor = parseInt(cantidadAjuste, 10);
    if (isNaN(valor) || valor < 0) {
      Alert.alert('Cantidad inválida', 'Ingresa un número entero válido.');
      return;
    }
    let delta = 0;
    if (modoAjuste === 'sumar') delta = valor;
    else if (modoAjuste === 'restar') delta = -valor;
    else if (modoAjuste === 'fijar') delta = valor - insumoSeleccionado.stock;

    if (delta !== 0) actualizarStock(insumoSeleccionado.id, delta);
    setAjusteModalVisible(false);
    setInsumoSeleccionado(null);
    setCantidadAjuste('');
  };

  return (
    <ResponsiveLayout activeScreen="Inventario" navigation={navigation}>
      {/* ENCABEZADO */}
      <View style={[styles.topHeader, isMobile && styles.topHeaderMobile]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, isMobile && { fontSize: 19 }]}>
            Inventario General de Enfermería
          </Text>
          <Text style={styles.pageSub}>
            Monitoreo en tiempo real de insumos y medicamentos
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.btnPrimary, isMobile && styles.btnPrimaryMobile]}
          onPress={handleAbrirModal}
        >
          <Text style={styles.btnPrimaryText}>+ Registrar Insumo</Text>
        </TouchableOpacity>
      </View>

      {/* MÉTRICAS KPI: 2x2 REAL EN MÓVIL / 4 EN FILA EN ESCRITORIO */}
      {isMobile ? (
        <View style={{ gap: 10, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Tipos de Insumos</Text>
              <Text style={styles.kpiValue}>{inventario.length}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Unidades en Stock</Text>
              <Text style={styles.kpiValue}>{totalUnidades} u.</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={[
                styles.kpiCard,
                stockCriticoCount > 0 && styles.kpiCardWarning,
              ]}
            >
              <Text style={styles.kpiTitle}>Stock Bajo / Crítico</Text>
              <Text
                style={[
                  styles.kpiValue,
                  stockCriticoCount > 0 && { color: COLORS.danger },
                ]}
              >
                {stockCriticoCount}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Atenciones</Text>
              <Text style={styles.kpiValue}>{atenciones.length}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Tipos de Insumos</Text>
            <Text style={styles.kpiValue}>{inventario.length}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Unidades en Stock</Text>
            <Text style={styles.kpiValue}>{totalUnidades} u.</Text>
          </View>
          <View
            style={[
              styles.kpiCard,
              stockCriticoCount > 0 && styles.kpiCardWarning,
            ]}
          >
            <Text style={styles.kpiTitle}>Stock Bajo / Crítico</Text>
            <Text
              style={[
                styles.kpiValue,
                stockCriticoCount > 0 && { color: COLORS.danger },
              ]}
            >
              {stockCriticoCount}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Atenciones Registradas</Text>
            <Text style={styles.kpiValue}>{atenciones.length}</Text>
          </View>
        </View>
      )}

      {/* LISTADO DE INSUMOS: TARJETAS EN MÓVIL / TABLA EN ESCRITORIO */}
      {isMobile ? (
        <View>
          <View style={styles.mobileSectionHeader}>
            <Text style={styles.tableHeaderTitle}>
              MEDICAMENTOS Y MATERIALES ({inventario.length})
            </Text>
          </View>

          {inventario.length === 0 ? (
            <View style={styles.mobileEmptyCard}>
              <Text style={styles.emptyText}>No hay insumos registrados.</Text>
              <Text style={styles.emptySub}>
                Toca "+ Registrar Insumo" para agregar uno.
              </Text>
            </View>
          ) : (
            inventario.map((item) => {
              const isLow = item.stock <= item.stockMinimo;
              return (
                <View key={item.id} style={styles.mobileItemCard}>
                  <View style={styles.mobileCardTop}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.mobileCodeBadge}>
                        Cód. {item.codigo} · Lote {item.lote || 'N/A'}
                      </Text>
                      <Text style={styles.mobileCardTitle}>{item.nombre}</Text>
                      <Text style={styles.mobileCardSub}>
                        {item.categoria || 'General'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.mobileStockPill,
                        isLow && styles.mobileStockPillLow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.mobileStockPillText,
                          isLow && { color: COLORS.danger },
                        ]}
                      >
                        {item.stock} u.
                      </Text>
                      <Text
                        style={[
                          styles.mobileStockLabel,
                          isLow && { color: COLORS.danger },
                        ]}
                      >
                        {isLow ? 'Crítico' : 'Disponible'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.mobileCardActions}>
                    <TouchableOpacity
                      style={styles.mobileActionBtn}
                      onPress={() => actualizarStock(item.id, -1)}
                    >
                      <Text style={styles.mobileActionBtnText}>-1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.mobileActionBtn}
                      onPress={() => actualizarStock(item.id, 1)}
                    >
                      <Text style={styles.mobileActionBtnText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.mobileActionBtn,
                        styles.mobileActionBtnPrimary,
                      ]}
                      onPress={() => abrirModalAjuste(item)}
                    >
                      <Text style={styles.mobileActionBtnPrimaryText}>
                        ± Ajustar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.mobileActionBtn,
                        styles.mobileActionBtnDanger,
                      ]}
                      onPress={() => eliminarInsumo(item.id)}
                    >
                      <Text style={styles.mobileActionBtnDangerText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableTitleBar}>
            <Text style={styles.tableHeaderTitle}>
              TABLA GENERAL DE MEDICAMENTOS Y MATERIALES
            </Text>
          </View>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 0.9 }]}>CÓDIGO</Text>
            <Text style={[styles.th, { flex: 2 }]}>NOMBRE DEL INSUMO</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>CATEGORÍA</Text>
            <Text style={[styles.th, { flex: 0.9 }]}>LOTE</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>
              DISPONIBLE
            </Text>
            <Text style={[styles.th, { flex: 1.8, textAlign: 'right' }]}>
              ACCIONES
            </Text>
          </View>

          {inventario.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No hay elementos guardados en la tabla.
              </Text>
              <Text style={styles.emptySub}>
                Presiona "+ Registrar Insumo" para comenzar a poblar la tabla.
              </Text>
            </View>
          ) : (
            inventario.map((item) => {
              const isLow = item.stock <= item.stockMinimo;
              return (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tdCode, { flex: 0.9 }]}>
                    {item.codigo}
                  </Text>
                  <Text style={[styles.td, { flex: 2, fontWeight: 'bold' }]}>
                    {item.nombre}
                  </Text>
                  <Text style={[styles.tdCategory, { flex: 1.4 }]}>
                    {item.categoria || 'General'}
                  </Text>
                  <Text style={[styles.td, { flex: 0.9 }]}>{item.lote}</Text>

                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text
                      style={[styles.badgeStock, isLow && styles.badgeLow]}
                    >
                      {item.stock} u.
                    </Text>
                  </View>

                  <View style={[styles.actionRow, { flex: 1.8 }]}>
                    <TouchableOpacity
                      style={styles.btnSmall}
                      onPress={() => actualizarStock(item.id, -1)}
                    >
                      <Text style={styles.btnSmallText}>-1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnSmall}
                      onPress={() => actualizarStock(item.id, 1)}
                    >
                      <Text style={styles.btnSmallText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnAdjust}
                      onPress={() => abrirModalAjuste(item)}
                    >
                      <Text style={styles.btnAdjustText}>± Ajustar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDangerSmall}
                      onPress={() => eliminarInsumo(item.id)}
                    >
                      <Text style={styles.btnDangerText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* MODAL 1: AJUSTE RÁPIDO */}
      <Modal
        visible={ajusteModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderBar}>
              <Text style={styles.modalHeaderBarText}>
                AJUSTE RÁPIDO DE EXISTENCIAS
              </Text>
            </View>

            {insumoSeleccionado && (
              <View style={{ padding: 18 }}>
                <View style={styles.ajusteInfoBox}>
                  <Text style={styles.ajusteInsumoName}>
                    {insumoSeleccionado.nombre}
                  </Text>
                  <Text style={styles.ajusteStockActual}>
                    Stock actual:{' '}
                    <Text style={{ fontWeight: '900', color: COLORS.primary }}>
                      {insumoSeleccionado.stock} u.
                    </Text>
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>Ajuste rápido por lote:</Text>
                <View style={styles.quickPresetsRow}>
                  {[-10, -5, +5, +10, +25].map((step) => {
                    const isNeg = step < 0;
                    return (
                      <TouchableOpacity
                        key={step}
                        style={[
                          styles.presetChip,
                          isNeg ? styles.presetNeg : styles.presetPos,
                        ]}
                        onPress={() => aplicarAjusteRapido(step)}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            { color: isNeg ? COLORS.danger : COLORS.primary },
                          ]}
                        >
                          {step > 0 ? `+${step}` : step}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                  O ingresa una cantidad exacta:
                </Text>
                <View style={styles.modeTabsRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      modoAjuste === 'sumar' && styles.modeTabActive,
                    ]}
                    onPress={() => setModoAjuste('sumar')}
                  >
                    <Text
                      style={[
                        styles.modeTabText,
                        modoAjuste === 'sumar' && styles.modeTabTextActive,
                      ]}
                    >
                      + Ingresar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      modoAjuste === 'restar' && styles.modeTabActive,
                    ]}
                    onPress={() => setModoAjuste('restar')}
                  >
                    <Text
                      style={[
                        styles.modeTabText,
                        modoAjuste === 'restar' && styles.modeTabTextActive,
                      ]}
                    >
                      - Retirar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      modoAjuste === 'fijar' && styles.modeTabActive,
                    ]}
                    onPress={() => setModoAjuste('fijar')}
                  >
                    <Text
                      style={[
                        styles.modeTabText,
                        modoAjuste === 'fijar' && styles.modeTabTextActive,
                      ]}
                    >
                      = Fijar
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder={
                    modoAjuste === 'fijar'
                      ? 'Nuevo stock total (Ej. 50)'
                      : 'Cantidad de unidades (Ej. 15)'
                  }
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={cantidadAjuste}
                  onChangeText={setCantidadAjuste}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setAjusteModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>Cerrar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnSave}
                    onPress={confirmarAjustePersonalizado}
                  >
                    <Text style={styles.btnSaveText}>Aplicar Cambio</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: REGISTRAR NUEVO INSUMO */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderBar}>
              <Text style={styles.modalHeaderBarText}>
                REGISTRAR NUEVO INSUMO
              </Text>
            </View>

            <ScrollView style={{ maxHeight: '85%' }}>
              <View style={{ padding: 18 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Código (Ej. GA-001, IB-400)"
                  placeholderTextColor="#888"
                  value={codigo}
                  onChangeText={setCodigo}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Nombre del Producto"
                  placeholderTextColor="#888"
                  value={nombre}
                  onChangeText={setNombre}
                />

                <View style={styles.dropdownWrapper}>
                  <Text style={styles.fieldLabel}>Categoría del Insumo:</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    activeOpacity={0.8}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <Text style={styles.dropdownSelectedText}>{categoria}</Text>
                    <Text style={styles.dropdownArrow}>
                      {dropdownOpen ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {dropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      <ScrollView
                        style={{ maxHeight: 150 }}
                        nestedScrollEnabled={true}
                      >
                        {CATEGORIAS_INSUMOS.map((cat) => {
                          const isSelected = cat === categoria;
                          return (
                            <TouchableOpacity
                              key={cat}
                              style={[
                                styles.dropdownOption,
                                isSelected && styles.dropdownOptionActive,
                              ]}
                              onPress={() => {
                                setCategoria(cat);
                                setDropdownOpen(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownOptionText,
                                  isSelected && styles.dropdownOptionTextActive,
                                ]}
                              >
                                {cat}
                              </Text>
                              {isSelected && (
                                <Text style={styles.checkIcon}>✓</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Número de Lote / Serie"
                  placeholderTextColor="#888"
                  value={lote}
                  onChangeText={setLote}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Stock Inicial (Unidades)"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Stock Mínimo de Alerta"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={stockMinimo}
                  onChangeText={setStockMinimo}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => {
                      setModalVisible(false);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnSave}
                    onPress={handleGuardar}
                  >
                    <Text style={styles.btnSaveText}>Guardar</Text>
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
  btnPrimaryMobile: {
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },

  kpiRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiCardWarning: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255, 235, 238, 0.92)',
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  kpiValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },

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
    marginBottom: 12,
  },
  mobileCodeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  mobileCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  mobileCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mobileStockPill: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 74,
  },
  mobileStockPillLow: {
    backgroundColor: '#FFEBEE',
  },
  mobileStockPillText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  mobileStockLabel: {
    fontSize: 9,
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
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  mobileActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  mobileActionBtnPrimary: {
    flex: 1.6,
    backgroundColor: '#DCFCE7',
    borderColor: COLORS.primary,
  },
  mobileActionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  mobileActionBtnDanger: {
    flex: 0.8,
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
  badgeStock: {
    backgroundColor: COLORS.accentLight,
    color: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeLow: { backgroundColor: '#FFEBEE', color: COLORS.danger },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 5 },
  btnSmall: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnSmallText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 11 },
  btnAdjust: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  btnAdjustText: { color: COLORS.primary, fontWeight: '800', fontSize: 11 },
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

  // --- MODALES ---
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
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  ajusteInfoBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  ajusteInsumoName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  ajusteStockActual: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quickPresetsRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  presetNeg: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  presetPos: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  presetChipText: { fontWeight: '800', fontSize: 12 },
  modeTabsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeTabText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  modeTabTextActive: { color: '#FFFFFF', fontWeight: '900' },
  dropdownWrapper: { marginBottom: 10 },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 10,
    borderRadius: 6,
  },
  dropdownSelectedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropdownArrow: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  dropdownMenu: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionActive: { backgroundColor: '#DCFCE7' },
  dropdownOptionText: { fontSize: 12, color: '#1E293B' },
  dropdownOptionTextActive: { fontWeight: '800', color: '#04562B' },
  checkIcon: { fontSize: 12, fontWeight: '900', color: '#04562B' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
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