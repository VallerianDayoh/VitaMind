import { useAction, useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Mengambil riwayat chat dari backend secara real-time
  const messages = useQuery(api.messages.list) || [];
  
  // Fungsi untuk menyimpan pesan ke database
  const sendMessage = useMutation(api.messages.send);
  
  // Fungsi untuk memanggil AI Gemini
  const getAI = useAction(api.gemini.getAIPrompt);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput(''); // Kosongkan input segera
    setLoading(true);

    // 1. Simpan pesan User ke Database
    await sendMessage({ text: userText, isUser: true });

    try {
      // 2. Minta jawaban AI
      const aiResponse = await getAI({ prompt: userText });
      
      // 3. Simpan jawaban AI ke Database
      await sendMessage({ text: aiResponse, isUser: false });
    } catch (error) {
      console.error("Gagal memanggil AI:", error);
      await sendMessage({ text: "Maaf, sepertinya aku sedang kesulitan memproses pikiranmu saat ini.", isUser: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
      
      <View style={styles.inputContainer}>
        <TextInput 
          value={input} 
          onChangeText={setInput} 
          placeholder="Tulis apa yang kamu rasakan..."
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? "..." : "Kirim"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  listContainer: { padding: 20 },
  bubble: { padding: 15, borderRadius: 20, marginVertical: 5, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start' },
  bubbleText: { color: 'white', fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: 'white' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, height: 40 },
  sendButton: { marginLeft: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 20, borderRadius: 20 },
  sendButtonText: { color: 'white', fontWeight: 'bold' }
});