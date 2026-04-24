import { Colors } from '@/src/constants/Colors';
import { useRouter } from 'expo-router';
import { Bot, ChevronLeft, Send, Sparkles, User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Halo! Saya asisten AI kesehatan mentalmu. Ada yang ingin kamu ceritakan atau tanyakan hari ini?", isAi: true }
  ]);

  const handleSend = () => {
    if (message.trim() === '') return;

    const newUserMsg = { id: Date.now(), text: message, isAi: false };
    setChatHistory(prev => [...prev, newUserMsg]);
    setMessage('');

    // Simulasi Jawaban AI
    setTimeout(() => {
      const aiRes = { 
        id: Date.now() + 1, 
        text: "Terima kasih sudah berbagi ceritamu. Tetap semangat menjalani hari-hari kuliah di UNKLAB ya! ✨", 
        isAi: true 
      };
      setChatHistory(prev => [...prev, aiRes]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Custom (Pengganti SafeArea agar offset lebih akurat) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <Sparkles size={20} color={Colors.primary} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 25} // Jika masih tertutup di Android, naikkan 25 menjadi 40
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chatHistory.map((item) => (
            <View key={item.id} style={[styles.messageRow, item.isAi ? styles.aiRow : styles.userRow]}>
              {item.isAi && (
                <View style={styles.avatarAi}>
                  <Bot size={16} color="#FFF" />
                </View>
              )}
              <View style={[styles.bubble, item.isAi ? styles.aiBubble : styles.userBubble]}>
                <Text style={[styles.msgText, item.isAi ? styles.aiText : styles.userText]}>
                  {item.text}
                </Text>
              </View>
              {!item.isAi && (
                <View style={styles.avatarUser}>
                  <User size={16} color="#FFF" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.input} 
            placeholder="Tulis ceritamu..." 
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { opacity: message.trim() === '' ? 0.6 : 1 }]} 
            onPress={handleSend}
            disabled={message.trim() === ''}
          >
            <Send size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { marginRight: 15 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 5 },
  onlineText: { fontSize: 12, color: '#6B7280' },
  chatContent: { padding: 20, paddingBottom: 10 },
  messageRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
  aiRow: { alignSelf: 'flex-start' },
  userRow: { alignSelf: 'flex-end' },
  avatarAi: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarUser: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#6B7280', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  bubble: { padding: 12, borderRadius: 18, maxWidth: '75%' },
  aiBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, elevation: 1 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 22 },
  aiText: { color: '#374151' },
  userText: { color: '#FFF' },
  inputArea: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#FFF', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 30 : 12
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 15, 
    height: 45, 
    borderRadius: 22,
    fontSize: 15,
    color: '#111827'
  },
  sendBtn: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginLeft: 10
  }
});