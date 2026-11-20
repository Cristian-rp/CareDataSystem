import React, { useContext, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { COLORS } from '../theme/colors';
import ResponsiveLayout from '../components/ResponsiveLayout';
import UdecLogo from '../components/UdecLogo';

export default function HistorialScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isPrinting, setIsPrinting] = useState(false);

  const {
    historial = [],
    inventario = [],
    atenciones = [],
    currentUser,
  } = useContext(DataContext);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleAfterPrint = () => {
        setIsPrinting(false);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      return () => window.removeEventListener('afterprint', handleAfterPrint);
    }
  }, []);

  const analytics = useMemo(() => {
    let totalEntradas = 0;
    let totalSalidas = 0;

    historial.forEach((mov) => {
      const num =
        Math.abs(parseInt(String(mov.cantidad).replace(/[^0-9-]/g, ''), 10)) ||
        0;
      if (mov.tipo === 'Entrada') {
        totalEntradas += num;
      } else if (
        mov.tipo === 'Salida_Atencion' ||
        mov.tipo === 'Salida' ||
        mov.tipo === 'Ajuste' ||
        mov.tipo === 'Baja'
      ) {
        totalSalidas += num;
      }
    });

    const maxMovimiento = Math.max(totalEntradas, totalSalidas, 1);

    const topInventario = [...inventario]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 6);
    const maxStock = Math.max(...topInventario.map((i) => i.stock), 1);

    const rolesCount = {
      Estudiante: 0,
      Docente: 0,
      Administrativo: 0,
    };

    atenciones.forEach((at) => {
      if (rolesCount[at.rol] !== undefined) {
        rolesCount[at.rol] += 1;
      }
    });

    const totalAtencionesReal = atenciones.length;
    const totalAtencionesDivisor = totalAtencionesReal || 1;

    return {
      totalEntradas,
      totalSalidas,
      maxMovimiento,
      topInventario,
      maxStock,
      rolesCount,
      totalAtencionesReal,
      totalAtencionesDivisor,
    };
  }, [historial, inventario, atenciones]);

  const handleExportarPDF = () => {
    if (Platform.OS === 'web') {
      const styleId = 'print-pdf-clean-styles';
      let styleElement = document.getElementById(styleId);

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      styleElement.innerHTML = `
        @media print {
          html, body, #root, div {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `;

      setIsPrinting(true);
      setTimeout(() => {
        window.print();
        setTimeout(() => setIsPrinting(false), 500);
      }, 150);
    } else {
      Alert.alert('Reporte Generado', 'Vista previa del reporte preparada.');
    }
  };

  return (
    <ResponsiveLayout
      activeScreen="Historial"
      navigation={navigation}
      hideChrome={isPrinting}
    >
      {/* ENCABEZADO EXCLUSIVO PARA EL PDF */}
      {isPrinting && (
        <View style={styles.printOnlyHeader}>
          <UdecLogo width={52} height={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.printBrand}>
              UNIVERSIDAD DE CUNDINAMARCA · SEDE SOACHA
            </Text>
            <Text style={styles.printSystem}>
              CareData System — Reporte Analítico de Enfermería
            </Text>
            <Text style={styles.printMeta}>
              Generado por: {currentUser?.nombreCompleto || 'Personal de Turno'} · Fecha:{' '}
              {new Date().toLocaleDateString('es-CO')}
            </Text>
          </View>
        </View>
      )}

      {/* ENCABEZADO NORMAL (Oculto en PDF) */}
      {!isPrinting && (
        <View style={[styles.topHeader, isMobile && styles.topHeaderMobile]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, isMobile && { fontSize: 19 }]}>
              Analítica, Historial y Auditoría
            </Text>
            <Text style={styles.pageSub}>
              Indicadores gráficos conectados a inventario y atenciones
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, isMobile && styles.btnPrimaryMobile]}
            onPress={handleExportarPDF}
          >
            <Text style={styles.btnPrimaryText}>📄 Generar Reporte PDF</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TARJETAS KPI: 2x2 REAL EN MÓVIL / 4 EN FILA EN ESCRITORIO Y PDF */}
      {isMobile && !isPrinting ? (
        <View style={{ gap: 10, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Movimientos</Text>
              <Text style={styles.kpiValue}>{historial.length}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Ingresadas</Text>
              <Text style={styles.kpiValue}>+{analytics.totalEntradas} u.</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={[
                styles.kpiCard,
                analytics.totalSalidas > 0 && styles.kpiCardWarning,
              ]}
            >
              <Text style={styles.kpiTitle}>Suministradas</Text>
              <Text
                style={[
                  styles.kpiValue,
                  analytics.totalSalidas > 0 && { color: COLORS.danger },
                ]}
              >
                -{analytics.totalSalidas} u.
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Consultas</Text>
              <Text style={styles.kpiValue}>
                {analytics.totalAtencionesReal}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Movimientos Registrados</Text>
            <Text style={styles.kpiValue}>{historial.length}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Unidades Ingresadas</Text>
            <Text style={styles.kpiValue}>+{analytics.totalEntradas} u.</Text>
          </View>
          <View
            style={[
              styles.kpiCard,
              analytics.totalSalidas > 0 && styles.kpiCardWarning,
            ]}
          >
            <Text style={styles.kpiTitle}>Unidades Suministradas</Text>
            <Text
              style={[
                styles.kpiValue,
                analytics.totalSalidas > 0 && { color: COLORS.danger },
              ]}
            >
              -{analytics.totalSalidas} u.
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Consultas Atendidas</Text>
            <Text style={styles.kpiValue}>
              {analytics.totalAtencionesReal}
            </Text>
          </View>
        </View>
      )}

      {/* GRÁFICAS */}
      <View
        style={[
          styles.chartsGrid,
          isMobile && !isPrinting && styles.chartsGridMobile,
        ]}
      >
        {/* GRÁFICA IZQUIERDA */}
        <View
          style={[
            styles.chartCard,
            (!isMobile || isPrinting) && { flex: 1 },
          ]}
        >
          <View style={styles.chartTitleBar}>
            <Text style={styles.tableHeaderTitle}>
              EXISTENCIAS POR INSUMO
            </Text>
            <Text style={styles.sourceBadge}>Inventario</Text>
          </View>

          <View style={styles.chartBody}>
            {analytics.topInventario.length === 0 ? (
              <Text style={styles.emptySub}>
                No hay productos registrados en el inventario.
              </Text>
            ) : (
              analytics.topInventario.map((item, idx, arr) => {
                const pct = Math.min(
                  100,
                  Math.round((item.stock / analytics.maxStock) * 100)
                );
                const isLow = item.stock <= (item.stockMinimo || 5);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.barItem,
                      idx === arr.length - 1 && { marginBottom: 2 },
                    ]}
                  >
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabel} numberOfLines={1}>
                        {item.nombre}
                      </Text>
                      <Text
                        style={[
                          styles.barValueText,
                          isLow && { color: COLORS.danger },
                        ]}
                      >
                        {item.stock} u. {isLow ? '(Bajo)' : ''}
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max(pct, 4)}%`,
                            backgroundColor: isLow
                              ? COLORS.danger
                              : COLORS.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* COLUMNA DERECHA */}
        <View style={styles.rightChartsColumn}>
          {/* GRÁFICA SUPERIOR DERECHA */}
          <View style={styles.chartCard}>
            <View style={styles.chartTitleBar}>
              <Text style={styles.tableHeaderTitle}>
                FLUJO DE INVENTARIO
              </Text>
              <Text style={styles.sourceBadge}>Historial</Text>
            </View>

            <View style={styles.chartBody}>
              <View style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>Entradas / Cargas</Text>
                  <Text style={styles.barValueText}>
                    {analytics.totalEntradas} u.
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${
                          analytics.totalEntradas === 0
                            ? 2
                            : Math.round(
                                (analytics.totalEntradas /
                                  analytics.maxMovimiento) *
                                  100
                              )
                        }%`,
                        backgroundColor: COLORS.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={[styles.barItem, { marginBottom: 2 }]}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>Salidas / Consumo</Text>
                  <Text
                    style={[styles.barValueText, { color: COLORS.danger }]}
                  >
                    {analytics.totalSalidas} u.
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${
                          analytics.totalSalidas === 0
                            ? 2
                            : Math.round(
                                (analytics.totalSalidas /
                                  analytics.maxMovimiento) *
                                  100
                              )
                        }%`,
                        backgroundColor: COLORS.danger,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* GRÁFICA INFERIOR DERECHA: POBLACIÓN ATENDIDA POR ROL */}
          <View style={styles.chartCard}>
            <View style={styles.chartTitleBar}>
              <Text style={styles.tableHeaderTitle}>
                POBLACIÓN ATENDIDA POR ROL
              </Text>
              <Text style={styles.sourceBadge}>Atenciones</Text>
            </View>

            <View style={styles.chartBody}>
              {Object.entries(analytics.rolesCount).map(
                ([rolName, count], idx, arr) => {
                  const pct =
                    analytics.totalAtencionesReal === 0
                      ? 0
                      : Math.round(
                          (count / analytics.totalAtencionesDivisor) * 100
                        );
                  const barColor =
                    rolName === 'Estudiante'
                      ? COLORS.primary
                      : rolName === 'Docente'
                      ? COLORS.accent || '#00A859'
                      : '#2E7D32';

                  return (
                    <View
                      key={rolName}
                      style={[
                        styles.barItem,
                        idx === arr.length - 1 && { marginBottom: 2 },
                      ]}
                    >
                      <View style={styles.barLabelRow}>
                        <Text style={styles.barLabel}>{rolName}</Text>
                        <Text style={styles.barValueText}>
                          {count} ({pct}%)
                        </Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${pct === 0 ? 2 : pct}%`,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          </View>
        </View>
      </View>

      {/* TRAZABILIDAD: OCULTA COMPLETAMENTE AL GENERAR EL PDF */}
      {!isPrinting && (
        <>
          {isMobile ? (
            <View>
              <View style={styles.mobileSectionHeader}>
                <Text style={styles.tableHeaderTitle}>
                  TRAZABILIDAD DE MOVIMIENTOS ({historial.length})
                </Text>
              </View>

              {historial.length === 0 ? (
                <View style={styles.mobileEmptyCard}>
                  <Text style={styles.emptyText}>No hay movimientos registrados.</Text>
                  <Text style={styles.emptySub}>
                    Los ingresos y salidas aparecerán aquí automáticamente.
                  </Text>
                </View>
              ) : (
                historial.map((item, index) => {
                  const isSalida =
                    String(item.cantidad).includes('-') ||
                    item.tipo === 'Salida_Atencion';
                  return (
                    <View key={item.id || index} style={styles.mobileItemCard}>
                      <View style={styles.mobileCardTop}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.mobileCodeBadge}>
                            {item.fecha} · {item.tipo}
                          </Text>
                          <Text style={styles.mobileCardTitle}>{item.insumo}</Text>
                        </View>
                        <Text
                          style={[styles.badgeStock, isSalida && styles.badgeLow]}
                        >
                          {item.cantidad}
                        </Text>
                      </View>
                      <Text style={styles.mobileObsText}>{item.obs}</Text>
                    </View>
                  );
                })
              )}
            </View>
          ) : (
            <View style={styles.tableCard}>
              <View style={styles.tableTitleBar}>
                <Text style={styles.tableHeaderTitle}>
                  REGISTRO DE TRAZABILIDAD DE INVENTARIO
                </Text>
              </View>

              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, { flex: 1.4 }]}>FECHA / HORA</Text>
                <Text style={[styles.th, { flex: 1.1 }]}>TIPO</Text>
                <Text style={[styles.th, { flex: 2 }]}>INSUMO / PRODUCTO</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>
                  CANTIDAD
                </Text>
                <Text style={[styles.th, { flex: 2.5 }]}>
                  OBSERVACIONES / DETALLE
                </Text>
              </View>

              {historial.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    No hay movimientos registrados en la tabla.
                  </Text>
                  <Text style={styles.emptySub}>
                    Los ingresos de stock y descuentos por atención aparecerán aquí automáticamente.
                  </Text>
                </View>
              ) : (
                historial.map((item, index) => {
                  const isSalida =
                    String(item.cantidad).includes('-') ||
                    item.tipo === 'Salida_Atencion';
                  return (
                    <View key={item.id || index} style={styles.tableRow}>
                      <Text style={[styles.tdCode, { flex: 1.4 }]}>
                        {item.fecha}
                      </Text>
                      <Text style={[styles.tdCategory, { flex: 1.1 }]}>
                        {item.tipo}
                      </Text>
                      <Text style={[styles.td, { flex: 2, fontWeight: 'bold' }]}>
                        {item.insumo}
                      </Text>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text
                          style={[styles.badgeStock, isSalida && styles.badgeLow]}
                        >
                          {item.cantidad}
                        </Text>
                      </View>
                      <Text style={[styles.td, { flex: 2.5 }]}>{item.obs}</Text>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </>
      )}
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  printOnlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 12,
    marginBottom: 18,
  },
  printBrand: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  printSystem: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  printMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
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

  kpiRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
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

  chartsGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
    marginBottom: 20,
  },
  chartsGridMobile: {
    flexDirection: 'column',
    gap: 14,
  },
  rightChartsColumn: {
    flex: 1,
    gap: 14,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  chartTitleBar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  barItem: {
    marginBottom: 14,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: '72%',
  },
  barValueText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  barTrack: {
    height: 10,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },

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
    marginBottom: 6,
  },
  mobileCodeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  mobileCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  mobileObsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  badgeStock: {
    backgroundColor: COLORS.accentLight,
    color: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
  },
  badgeLow: { backgroundColor: '#FFEBEE', color: COLORS.danger },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
});