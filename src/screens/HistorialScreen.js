import React, { useContext, useMemo } from 'react';
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
import { DataContext } from '../context/DataContext';
import { COLORS } from '../theme/colors';
import ResponsiveLayout from '../components/ResponsiveLayout';

export default function HistorialScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    historial = [],
    inventario = [],
    atenciones = [],
  } = useContext(DataContext);

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
          div[data-testid="sidebar-container"] {
            display: none !important;
          }
          button,
          div[style*="bottom: 24px"],
          div[style*="bottom: 16px"] {
            display: none !important;
          }
          html, body, #root, div {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            background-color: #FFFFFF !important;
          }
          div[data-testid="content-container"] {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `;
      window.print();
    } else {
      Alert.alert('Reporte Generado', 'Vista previa del reporte preparada.');
    }
  };

  return (
    <ResponsiveLayout activeScreen="Historial" navigation={navigation}>
      {/* ENCABEZADO RESPONSIVO */}
      <View style={[styles.topHeader, isMobile && styles.topHeaderMobile]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, isMobile && { fontSize: 18 }]}>
            Analítica, Historial y Auditoría
          </Text>
          <Text style={styles.pageSub}>
            Indicadores gráficos en tiempo real conectados a inventario y atenciones
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.btnPrimary, isMobile && styles.btnPrimaryMobile]}
          onPress={handleExportarPDF}
        >
          <Text style={styles.btnPrimaryText}>📄 Generar Reporte PDF</Text>
        </TouchableOpacity>
      </View>

      {/* TARJETAS KPI (4 columnas en PC, 2x2 en Celular) */}
      <View style={[styles.kpiRow, isMobile && styles.kpiRowMobile]}>
        <View style={[styles.kpiCard, isMobile && styles.kpiCardMobile]}>
          <Text style={styles.kpiTitle}>Movimientos Registrados</Text>
          <Text style={styles.kpiValue}>{historial.length}</Text>
        </View>

        <View style={[styles.kpiCard, isMobile && styles.kpiCardMobile]}>
          <Text style={styles.kpiTitle}>Unidades Ingresadas</Text>
          <Text style={styles.kpiValue}>+{analytics.totalEntradas} u.</Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            isMobile && styles.kpiCardMobile,
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

        <View style={[styles.kpiCard, isMobile && styles.kpiCardMobile]}>
          <Text style={styles.kpiTitle}>Consultas Atendidas</Text>
          <Text style={styles.kpiValue}>{analytics.totalAtencionesReal}</Text>
        </View>
      </View>

      {/* GRÁFICAS (2 columnas en PC, apiladas verticalmente en Celular) */}
      <View style={[styles.chartsGrid, isMobile && styles.chartsGridMobile]}>
        {/* GRÁFICA 1: EXISTENCIAS POR INSUMO */}
        <View style={styles.chartCard}>
          <View style={styles.chartTitleBar}>
            <Text style={styles.tableHeaderTitle}>
              EXISTENCIAS ACTUALES POR INSUMO
            </Text>
            <Text style={styles.sourceBadge}>Inventario</Text>
          </View>

          <View style={styles.chartBody}>
            {analytics.topInventario.length === 0 ? (
              <Text style={styles.emptySub}>
                No hay productos registrados en el inventario.
              </Text>
            ) : (
              analytics.topInventario.map((item) => {
                const pct = Math.min(
                  100,
                  Math.round((item.stock / analytics.maxStock) * 100)
                );
                const isLow = item.stock <= (item.stockMinimo || 5);
                return (
                  <View key={item.id} style={styles.barItem}>
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

        {/* COLUMNA DERECHA: FLUJO Y ATENCIONES POR ROL */}
        <View style={styles.rightChartsColumn}>
          {/* GRÁFICA 2 */}
          <View style={[styles.chartCard, { marginBottom: 14 }]}>
            <View style={styles.chartTitleBar}>
              <Text style={styles.tableHeaderTitle}>
                BALANCE DE FLUJO DE INVENTARIO
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

              <View style={[styles.barItem, { marginBottom: 0 }]}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>Salidas / Consumo Médico</Text>
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

          {/* GRÁFICA 3 */}
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
                        idx === arr.length - 1 && { marginBottom: 0 },
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

      {/* TABLA DE TRAZABILIDAD CON SCROLL HORIZONTAL EN MÓVIL */}
      <View style={styles.tableCard}>
        <View style={styles.tableTitleBar}>
          <Text style={styles.tableHeaderTitle}>
            REGISTRO DE TRAZABILIDAD DE INVENTARIO
          </Text>
        </View>

        <ScrollView horizontal={isMobile} showsHorizontalScrollIndicator={true}>
          <View style={isMobile ? { minWidth: 700 } : { width: '100%' }}>
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
                        style={[
                          styles.badgeStock,
                          isSalida && styles.badgeLow,
                        ]}
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
        </ScrollView>
      </View>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  topHeaderMobile: { flexDirection: 'column', alignItems: 'flex-start' },
  pageTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  pageSub: { fontSize: 12, color: COLORS.textSecondary },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnPrimaryMobile: { alignSelf: 'stretch', alignItems: 'center' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },

  kpiRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  kpiRowMobile: { flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiCardMobile: { flex: undefined, width: '48%' },
  kpiCardWarning: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(255, 235, 238, 0.88)',
  },
  kpiTitle: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },

  chartsGrid: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  chartsGridMobile: { flexDirection: 'column' },
  rightChartsColumn: { flex: 1 },
  chartCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  chartTitleBar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartBody: { padding: 14 },
  barItem: { marginBottom: 11 },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    maxWidth: '72%',
  },
  barValueText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  barTrack: {
    height: 9,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },

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
    letterSpacing: 1,
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
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
});