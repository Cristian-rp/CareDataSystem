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

const GEMINI_API_KEY = 'AQ.Ab8RN6I8G9vAu4_fyg0srdONHXvViEgpwj1cZFGNv8KrfsORNQ';

export default function GeminiAssistantModal({ visible, onClose }) {
  const { inventario, atenciones } = useContext(DataContext);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [messages, setMessages] = useState([
    {
      sender: 'gemini',
      text: '¡Hola! Soy tu asistente de IA conectado con la API de Google Gemini. Puedo analizar en tiempo real los datos visibles en pantalla para ayudarte con la gestión de inventario y compras.',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputPrompt.trim()) return;

    const userText = inputPrompt.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputPrompt('');
    setLoading(true);

    try {
      const datosPantalla = {
        totalInsumosEnTabla: inventario ? inventario.length : 0,
        detalleInventario: inventario || [],
        totalAtencionesRegistradas: atenciones ? atenciones.length : 0,
      };

      const promptContexto = `
        Eres el asistente de IA oficial para el sistema CareData System de la Enfermería de la Universidad de Cundinamarca (UDEC Soacha).
        
        INSTRUCCIONES OBLIGATORIAS:
        1. Analiza EXCLUSIVAMENTE los datos de la pantalla actual provistos a continuación.
        2. NO utilices ni hagas referencia a conversaciones pasadas ni a historiales previos.
        3. Si la lista de insumos en la tabla tiene 0 elementos, indícalo explícitamente e informa que no hay productos registrados en pantalla.

        [DATOS ACTUALMENTE VISIBLES EN PANTALLA]:
        ${JSON.stringify(datosPantalla, null, 2)}

        [CONSULTA DEL USUARIO EN PANTALLA]:
        "${userText}"
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptContexto }] }] }),
        }
      );

      const data = await response.json();
      let botReply = '';
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        botReply = data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        botReply = `Error de Google API (${data.error.code}): ${data.error.message}`;
      } else {
        botReply = 'No se obtuvo una respuesta válida del servicio de Google Gemini.';
      }

      setMessages((prev) => [...prev, { sender: 'gemini', text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'gemini', text: `Error de red: ${error.message || 'No se pudo conectar con el servidor.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, isMobile && { padding: 0 }]}>
        <View style={[styles.chatWindow, isMobile && { width: '100%', height: '90%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>✨ Asistente IA - Google Gemini API</Text>
            <TouchableOpacity onPress={onClose} style={styles.btnClose}>
              <Text style={styles.btnCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messageArea}>
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.geminiBubble]}
              >
                <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.geminiText]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Gemini analizando la pantalla actual...</Text>
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
  modalOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)', padding: 20 },
  chatWindow: { width: 380, height: 480, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  chatHeader: { backgroundColor: COLORS.primary, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatHeaderTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  btnClose: { paddingHorizontal: 8 },
  btnCloseText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  messageArea: { flex: 1, padding: 12, backgroundColor: COLORS.background },
  messageBubble: { padding: 10, borderRadius: 8, marginBottom: 8, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  geminiBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border },
  messageText: { fontSize: 12 },
  userText: { color: '#FFFFFF' },
  geminiText: { color: COLORS.textPrimary },
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  loadingText: { fontSize: 11, color: COLORS.textSecondary },
  inputRow: { flexDirection: 'row', padding: 10, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  input: { flex: 1, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, paddingHorizontal: 10, fontSize: 12, color: COLORS.textPrimary },
  btnSend: { backgroundColor: COLORS.primary, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 6 },
  btnSendText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },
});