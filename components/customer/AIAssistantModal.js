import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../theme';
import Button from '../ui/Button';

const { width } = Dimensions.get('window');

const QUICK_PROMPTS = [
  { id: 'status', label: 'Where is my order?', icon: 'compass-outline' },
  { id: 'urgent', label: 'Book an urgent order', icon: 'flash-outline' },
  { id: 'measurements', label: 'Check my measurements', icon: 'tape-measure' },
  { id: 'alteration', label: 'Request alteration', icon: 'scissors-cutting' },
];

export default function AIAssistantModal({
  visible,
  onClose,
  customerName = 'Customer',
  orders = [],
  measurements = null,
  onNavigateTab,
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${customerName}! I am your Tailor24 Smart Assistant. How can I help you today?`,
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handlePromptClick = (promptId) => {
    let userMsg = '';
    let aiResponse = '';

    if (promptId === 'status') {
      userMsg = 'Where is my order?';
      if (orders.length === 0) {
        aiResponse =
          "You currently don't have any active orders. When you place a bill at our shop, your real-time garment production status will appear here!";
      } else {
        const activeOrder = orders[0];
        aiResponse = `Order #${activeOrder.bill_number || activeOrder.id} (${
          activeOrder.garment_type || 'Garment'
        }) is currently: "${activeOrder.status || 'In Production'}". Delivery due: ${
          activeOrder.due_date || 'Soon'
        }.`;
      }
    } else if (promptId === 'urgent') {
      userMsg = 'Book an urgent order';
      aiResponse =
        '⚡ Urgent Order Booking:\n\nOur master tailors can expedite express production within 24–48 hours.\n\nPlease visit the shop or contact us directly to confirm fabric availability!';
    } else if (promptId === 'measurements') {
      userMsg = 'Check my measurements';
      if (!measurements) {
        aiResponse =
          'No saved measurements were found for your mobile number. You can visit our shop anytime to have your master fit recorded.';
      } else {
        const keys = Object.keys(measurements).filter(
          (k) => !['id', 'created_at', 'updated_at', 'mobile_number', 'customer_name'].includes(k) && measurements[k]
        );
        aiResponse = `We have ${keys.length} verified body dimensions on file for you. Your dimensions ensure your custom stitching fits perfectly every time.`;
      }
    } else if (promptId === 'alteration') {
      userMsg = 'Request alteration';
      aiResponse =
        '✂️ Alteration Service:\n\nIf any finished garment needs fine-tuning (length, waist, or sleeve adjustment), bring it to our counter. Minor adjustments are completely complimentary!';
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userMsg },
      { id: Date.now() + 1, sender: 'ai', text: aiResponse },
    ]);
  };

  const handleSendCustom = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text },
      {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Thank you for your message! Our tailoring support team has received your query regarding "${text}". For immediate updates, call or WhatsApp our shop counter.`,
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.aiBadgeRow}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.aiTitle}>Tailor24 Smart Assistant</Text>
                <Text style={styles.aiSubtitle}>AI Automated Operations</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Action Chips */}
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {QUICK_PROMPTS.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  style={styles.chip}
                  onPress={() => handlePromptClick(q.id)}
                >
                  <Ionicons name={q.icon.includes('scissors') ? 'cut-outline' : q.icon} size={14} color={Colors.primary} />
                  <Text style={styles.chipText}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Message Thread */}
          <ScrollView style={styles.messagesList} contentContainerStyle={styles.messagesContent}>
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.messageBubble,
                  m.sender === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {m.sender === 'ai' && (
                  <View style={styles.aiMessageHeader}>
                    <Ionicons name="sparkles" size={12} color={Colors.accent} />
                    <Text style={styles.aiLabel}>Tailor24 AI</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    m.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {m.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Ask about orders, alteration, delivery..."
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendCustom}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendCustom}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    height: '75%',
    maxHeight: 650,
    display: 'flex',
    flexDirection: 'column',
    ...Shadows.popover,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  aiTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  aiSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  chipsContainer: {
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  messageBubble: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.accent,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: Colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
