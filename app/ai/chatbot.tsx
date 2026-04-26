import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

// ── Types ──────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'vita';
  timestamp: number;
}

// ── Crisis Detection (client-side instant fallback) ────────

const CRISIS_KEYWORDS = ['putus asa', 'mati', 'menyakiti', 'bunuh diri', 'tidak ingin hidup'];

const isCrisisMessage = (text: string): boolean =>
  CRISIS_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

const CRISIS_RESPONSE =
  'Aku sangat menghargai keberanianmu untuk bercerita. Perasaanmu valid, tapi aku ingin memastikan kamu aman. Tolong hubungi bantuan profesional sekarang:\n\n📞 Hotline Into The Light Indonesia: 119 ext 8\n📞 Sejiwa (119 ext 8)\n\nKamu tidak sendirian. Mereka siap membantu kamu 24 jam.';

// ── Component ──────────────────────────────────────────────

export default function VitaChatbotScreen() {
  const flatRef = useRef<FlatList>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const userId = convexUserId as Id<"users">;

  // Convex hooks
  const chatHistory = useQuery(
    api.chat.list,
    convexUserId ? { userId } : "skip"
  );
  const sendChatMsg = useMutation(api.chat.send);
  const askVita = useAction(api.ai.chat);

  // Transform Convex data to local Message format
  const messages: Message[] = [
    {
      id: '0',
      text: 'Hai! Aku Vita, teman virtual yang siap mendengarkan ceritamu. Ada yang ingin kamu sampaikan hari ini? 💜',
      sender: 'vita',
      timestamp: Date.now() - 100000,
    },
    ...(chatHistory ?? []).map((m) => ({
      id: m._id,
      text: m.text,
      sender: m.sender as 'user' | 'vita',
      timestamp: m.timestamp,
    })),
  ];

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatHistory?.length]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !convexUserId) return;

    setInput('');
    setIsTyping(true);

    try {
      // 1. Save user message to Convex
      await sendChatMsg({ userId, text: trimmed, sender: 'user' });

      // 2. Check for crisis — instant client-side response
      if (isCrisisMessage(trimmed)) {
        await sendChatMsg({ userId, text: CRISIS_RESPONSE, sender: 'vita' });
        setIsTyping(false);
        return;
      }

      // 3. Build conversation history for context
      const recentMsgs = (chatHistory ?? []).slice(-10);
      const historyStr = recentMsgs
        .map((m) => `${m.sender === 'user' ? 'User' : 'Vita'}: ${m.text}`)
        .join('\n');

      // 4. Call AI via Convex action
      const aiResponse = await askVita({
        userMessage: trimmed,
        conversationHistory: historyStr || undefined,
      });

      // 5. Save AI response to Convex
      await sendChatMsg({ userId, text: aiResponse, sender: 'vita' });
    } catch (err) {
      console.error('Chat error:', err);
      await sendChatMsg({
        userId,
        text: 'Maaf, Vita sedang mengalami gangguan teknis. Coba lagi nanti ya 💛',
        sender: 'vita',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const isCrisis = !isUser && item.text.includes('119 ext 8') && item.text.includes('Hotline');

    return (
      <View style={[styles.bubbleWrap, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleVita,
            isCrisis && styles.bubbleCrisis,
          ]}
        >
          {isUser ? (
            <LinearGradient
              colors={Colors.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.userBubbleGradient}
            >
              <Text style={styles.bubbleTextUser}>{item.text}</Text>
            </LinearGradient>
          ) : isCrisis ? (
            <>
              <Text style={styles.bubbleTextVita}>
                {item.text.split('📞')[0]}
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('tel:119')}>
                <Text style={styles.hotlineText}>
                  📞 Hotline Into The Light Indonesia:{' '}
                  <Text style={styles.hotlineNumber}>119 ext 8</Text>
                </Text>
              </TouchableOpacity>
              <Text style={styles.bubbleTextVita}>
                Kamu tidak sendirian. Mereka siap membantu kamu 24 jam.
              </Text>
            </>
          ) : (
            <Text style={styles.bubbleTextVita}>{item.text}</Text>
          )}
        </View>
        <Text style={[styles.timestamp, isUser && { textAlign: 'right' }]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundTop, Colors.backgroundBottom]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Disclaimer banner */}
        <TouchableOpacity
          style={styles.disclaimer}
          onPress={() => Linking.openURL('tel:119')}
          activeOpacity={0.8}
        >
          <Text style={styles.disclaimerText}>
            <Ionicons name="warning-outline" size={14} color={Colors.warning} />{' '}
            Vita adalah teman virtual, bukan psikolog. Jika butuh bantuan profesional,{' '}
            <Text style={styles.disclaimerLink}>tap di sini.</Text>
          </Text>
        </TouchableOpacity>

        {/* Chat list */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={[styles.bubbleWrap, styles.bubbleLeft]}>
                <View style={[styles.bubble, styles.bubbleVita]}>
                  <Text style={styles.typingDots}>Vita sedang mengetik...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Tulis pesan..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isTyping) && { opacity: 0.4 }]}
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={Colors.buttonGradient}
              style={styles.sendBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: 'rgba(255, 107, 122, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 122, 0.2)',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  disclaimerLink: {
    color: Colors.error,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Chat list
  chatList: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  // Bubbles
  bubbleWrap: { marginBottom: Spacing.md, maxWidth: '85%' },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end' },
  bubble: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  userBubbleGradient: {
    padding: Spacing.md,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleVita: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  bubbleCrisis: {
    borderColor: Colors.error,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 107, 122, 0.1)',
  },
  bubbleTextUser: {
    color: '#FFF',
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  bubbleTextVita: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  hotlineText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    lineHeight: 28,
    marginVertical: Spacing.sm,
  },
  hotlineNumber: {
    fontWeight: '800',
    color: Colors.error,
    fontSize: Typography.sizes.lg,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    marginHorizontal: 4,
  },

  // Typing indicator
  typingDots: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
    fontSize: Typography.sizes.sm,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(10, 14, 41, 0.9)',
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
