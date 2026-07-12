import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { CATEGORY_LABELS, Category } from '../types';

const FEATURED_TUTORIALS = [
  { id: '1', title: '下水道堵塞？三步搞定', category: 'plumbing' as Category, summary: '不用请师傅，学会这三招自己就能通。' },
  { id: '2', title: '门锁把手松了怎么换', category: 'carpentry' as Category, summary: '一把螺丝刀就能换新，教程超细。' },
  { id: '3', title: '墙面钉钉子不裂墙小技巧', category: 'decoration' as Category, summary: '用胶带和找准位置才是关键。' },
];

const QUICK_TIPS = [
  { emoji: '🔧', label: '管道', category: 'plumbing' as Category },
  { emoji: '⚡', label: '电路', category: 'electrical' as Category },
  { emoji: '🪚', label: '木工', category: 'carpentry' as Category },
  { emoji: '🧹', label: '清洁', category: 'cleaning' as Category },
  { emoji: '🔌', label: '家电', category: 'appliance' as Category },
  { emoji: '🎨', label: '翻新', category: 'decoration' as Category },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>SheCan</Text>
        <Text style={styles.heroSubtitle}>女生也可以自己动手 💪</Text>
      </View>

      {/* Quick tips grid */}
      <Text style={styles.sectionTitle}>🏠 生活技巧</Text>
      <View style={styles.tipsGrid}>
        {QUICK_TIPS.map((tip) => (
          <TouchableOpacity key={tip.label} style={styles.tipCard} activeOpacity={0.7}>
            <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            <Text style={styles.tipLabel}>{tip.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured tutorials */}
      <Text style={styles.sectionTitle}>🔥 热门教程</Text>
      {FEATURED_TUTORIALS.map((t) => (
        <TouchableOpacity key={t.id} style={styles.featuredCard} activeOpacity={0.8}>
          <View style={styles.featuredTop}>
            <Text style={styles.featuredCategory}>{CATEGORY_LABELS[t.category]}</Text>
          </View>
          <Text style={styles.featuredTitle}>{t.title}</Text>
          <Text style={styles.featuredSummary} numberOfLines={2}>{t.summary}</Text>
        </TouchableOpacity>
      ))}

      {/* Community CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>👭 姐妹互助社区</Text>
        <Text style={styles.ctaText}>遇到问题？去社区问问姐妹们，一起解决！</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  hero: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.xxl },
  heroTitle: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, paddingHorizontal: SPACING.xl },
  tipsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.xl, gap: SPACING.md, marginBottom: SPACING.xxl },
  tipCard: {
    width: (100 / 3) + '%' as any,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexBasis: '30%',
    flexGrow: 1,
  },
  tipEmoji: { fontSize: 28, marginBottom: 4 },
  tipLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  featuredCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredTop: { marginBottom: SPACING.sm },
  featuredCategory: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  featuredTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  featuredSummary: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  ctaSection: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  ctaText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
