import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { DataContext } from '../context/DataContext';
import { COLORS } from '../theme/colors';

// Lee la clave desde .env (EXPO_PUBLIC_GEMINI_API_KEY) para evitar bloqueos de GitHub
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export default function GeminiAssistantModal({ visible, onClose }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { inventario = [], atenciones = [], proveedores = [] } = useContext(DataContext);
  const [messages, setMessages] = useState([
    {
      sender: 'gemini',
      text: '¡Hola! Soy tu asistente de IA conectado con Google Gemini. Analizo en tiempo real los datos visibles en pantalla para ayudarte con la gestión de inventario y compras.',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const consultarModelo = async (modelo, promptContexto) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${GEMINI_API_KEY.trim()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptContexto }],
            },
          ],
        }),
      }
    );
    return await response.json();
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim()) return;

    const userText = inputPrompt.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputPrompt('');
    setLoading(true);

    try {
      if (!GEMINI_API_KEY.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'gemini',
            text: 'Falta configurar EXPO_PUBLIC_GEMINI_API_KEY en el archivo .env de la raíz del proyecto.',
          },
        ]);
        setLoading(false);
        return;
      }

      const stockBajo = inventario.filter(
        (item) => item.stock <= (item.stockMinimo || 5)
      );

      const datosPantalla = {
        totalTiposInsumos: inventario.length,
        insumosEnStockBajo: stockBajo.map((i) => ({
          nombre: i.nombre,
          stockActual: i.stock,
          stockMinimo: i.stockMinimo || 5,
        })),
        inventarioCompleto: inventario.map((i) => ({
          codigo: i.codigo,
          nombre: i.nombre,
          categoria: i.categoria,
          stock: i.stock,
        })),
        totalAtenciones: atenciones.length,
        totalProveedores: proveedores.length,
      };

      const promptContexto = `
Eres el asistente de IA oficial de CareData System (Enfermería Universidad de Cundinamarca, Sede Soacha).
Reglas:
- Analiza ÚNICAMENTE los datos actuales en pantalla enviados abajo.
- No inventes productos ni uses historial de chats anteriores.
- Responde de forma clara, breve, directa y sin formato Markdown complejo.

[DATOS EN PANTALLA]:
${JSON.stringify(datosPantalla)}

[CONSULTA DEL USUARIO]:
${userText}
      `.trim();

      // Cadena de modelos vigentes solicitados por la API de Google
      const modelos = ['gemini-3.0-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
      let data = null;

      for (const modelo of modelos) {
        data = await consultarModelo(modelo, promptContexto);
        if (!data.error || (data.error.code !== 404 && data.error.code !== 400)) {
          break;
        }
      }

      let botReply = '';
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        botReply = data.candidates[0].content.parts[0].text;
      } else if (data?.error) {
        botReply = `Error de Google API (${data.error.code}): ${data.error.message}`;
      } else {
        botReply = 'No se recibió respuesta del modelo Gemini.';
      }

      setMessages((prev) => [...prev, { sender: 'gemini', text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: `Error de conexión: ${error.message || 'Verifica tu conexión a internet.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
        <View style={[styles.chatWindow, isMobile && styles.chatWindowMobile]}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>✨ Asistente IA - Google Gemini</Text>
            <TouchableOpacity onPress={onClose} style={styles.btnClose}>
              <Text style={styles.btnCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messageArea}>
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.geminiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userText : styles.geminiText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Gemini analizando inventario...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Pregunta a Gemini..."
              placeholderTextColor="#888"
              value={inputPrompt}
              onChangeText={setInputPrompt}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity style={styles.btnSend} onPress={handleSendMessage}>
              <Text style={styles.btnSendText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
  },
  modalOverlayMobile: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  chatWindow: {
    width: 380,
    height: 480,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  chatWindowMobile: {
    width: '100%',
    height: '78%',
  },
  chatHeader: {
    backgroundColor: COLORS.primary,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  btnClose: { paddingHorizontal: 8 },
  btnCloseText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  messageArea: { flex: 1, padding: 12, backgroundColor: COLORS.background },
  messageBubble: { padding: 10, borderRadius: 8, marginBottom: 8, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  geminiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: { fontSize: 12, lineHeight: 17 },
  userText: { color: '#FFFFFF' },
  geminiText: { color: COLORS.textPrimary },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  loadingText: { fontSize: 11, color: COLORS.textSecondary },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  btnSend: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 6,
  },
  btnSendText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },
});