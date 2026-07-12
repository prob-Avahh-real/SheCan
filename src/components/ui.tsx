import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
    </View>
  );
}

export function BackButton({
  onPress,
  label = '← 返回',
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backBtn}>
      <Text style={styles.backBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function DetailHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.detailHeader}>{children}</View>;
}

export function CardBox({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.card, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

export function LoadingState({ text }: { text: string }) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

export function TagRow({ tags }: { tags: string[] }) {
  return (
    <View style={styles.tagRow}>
      {tags.map((tag, index) => (
        <View key={index} style={styles.tagItem}>
          <Text style={styles.tagText}>#{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxxl + 20, paddingBottom: SPACING.lg },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 16, color: COLORS.textSecondary, marginTop: SPACING.xs },
  backBtn: { marginBottom: SPACING.md },
  backBtnText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  detailHeader: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxxl + 20, paddingBottom: SPACING.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.md },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.xs, marginBottom: SPACING.md },
  tagItem: { backgroundColor: COLORS.surfaceAlt, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, margin: SPACING.xs },
  tagText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
});
