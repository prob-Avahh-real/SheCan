import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { AIMessage } from '../types';
import { fetchAIResponse } from '../services/ai';
import { ScreenHeader } from '../components/ui';

const QUICK_QUESTIONS = [
  '下水道堵了怎么办',
  '灯泡不亮但开关没坏',
  '马桶水箱一直流水',
  '墙皮发霉怎么处理',
  '门锁钥匙断在里面了',
];

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '嗨！我是你的赛博云友 👋\n\n不管是通下水道、换灯泡、修门锁，还是任何生活维修问题，尽管问我。我不会笑话你，只会手把手教你搞定！\n\n你也可以直接告诉我你现在遇到了什么问题~',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      const aiContent = await fetchAIResponse(text.trim(), history);
      const aiMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <ScreenHeader title="AI 问答助手" subtitle="随时问，不笑话你 ✨" />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.role === 'assistant' && <Text style={styles.aiAvatar}>🧑‍🔧</Text>}
            <View style={[styles.bubbleContent, item.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
              <Text style={[styles.bubbleText, item.role === 'user' ? styles.userBubbleText : styles.aiBubbleText]}>
                {item.content}
              </Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          messages.length === 1 ? (
            <View style={styles.quickSection}>
              <Text style={styles.quickTitle}>💬 试试这些问题</Text>
              <View style={styles.quickGrid}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <TouchableOpacity key={i} style={styles.quickChip} onPress={() => sendMessage(q)}>
                    <Text style={styles.quickChipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator style={styles.loadingIcon} size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>正在思考...</Text>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="描述你遇到的问题..."
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}>
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messageList: { flex: 1 },
  messageContent: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  messageBubble: { flexDirection: 'row', marginBottom: SPACING.lg, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  aiAvatar: { fontSize: 28, marginRight: SPACING.sm },
  bubbleContent: { maxWidth: '80%', borderRadius: RADIUS.lg, padding: SPACING.md },
  userBubbleContent: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiBubbleContent: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userBubbleText: { color: COLORS.white },
  aiBubbleText: { color: COLORS.text },
  quickSection: { marginBottom: SPACING.xxl },
  quickTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.md },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.sm },
  quickChip: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, margin: SPACING.sm,
  },
  quickChipText: { fontSize: 14, color: COLORS.text },
  loadingBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  loadingIcon: { marginRight: SPACING.sm },
  loadingText: { fontSize: 13, color: COLORS.textSecondary },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: SPACING.md, backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: SPACING.xxl + 10,
  },
  textInput: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md, paddingBottom: SPACING.md,
    fontSize: 15, color: COLORS.text, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
});
