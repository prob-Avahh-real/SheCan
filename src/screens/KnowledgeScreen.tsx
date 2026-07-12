import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Category, CATEGORY_LABELS, Tutorial, TutorialStep } from '../types';
import { fetchTutorials } from '../services/knowledge';
import { BackButton, CardBox, DetailHeader, LoadingState, ScreenHeader } from '../components/ui';

// 模拟数据作为 Supabase 未配置时的回退
const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: '1', title: '下水道堵塞？三步搞定', category: 'plumbing', difficulty: 'easy',
    duration: '15分钟', coverImage: '',
    summary: '厨房水槽下水慢、有异味？不用请师傅，学会这三招自己就能通。',
    steps: [
      { order: 1, title: '热水+洗洁精', description: '先烧一壶开水，倒入半瓶洗洁精，缓慢倒入下水口。热水能溶解油脂，洗洁精能润滑管壁。等5分钟后用大量清水冲洗。' },
      { order: 2, title: '小苏打+白醋', description: '倒入半杯小苏打，再倒入半杯白醋。会起泡冒气，盖住下水口等15分钟，再用热水冲。' },
      { order: 3, title: '手动疏通器', description: '以上都不行，买一个手摇疏通器插入下水管，顺时针旋转推进，感觉到阻力就来回抽拉。最后用热水冲一遍。' },
    ],
    tools: ['橡胶手套', '开水壶', '小苏打', '白醋', '手摇疏通器'],
    createdAt: '2025-05-01',
  },
  {
    id: '2', title: '门锁把手松了怎么换', category: 'carpentry', difficulty: 'medium',
    duration: '30分钟', coverImage: '',
    summary: '卧室门把手晃晃悠悠快掉了？一把螺丝刀就能换新，教程超细。',
    steps: [
      { order: 1, title: '拆旧把手', description: '找到把手内侧的两颗螺丝，用十字螺丝刀拧下来。把手会分成内外两半，轻轻拉出来。' },
      { order: 2, title: '取出锁芯', description: '把手拆掉后，侧面门边上还有两颗螺丝固定锁舌。拧下后锁舌就能从侧面抽出来。' },
      { order: 3, title: '安装新把手', description: '先装锁舌（斜面朝关门方向），再把把手内外对好孔位穿过去，拧紧螺丝。测试开关门是否顺畅。' },
    ],
    tools: ['十字螺丝刀', '新门锁把手', '卷尺'],
    createdAt: '2025-05-10',
  },
  {
    id: '3', title: '墙面钉钉子不裂墙小技巧', category: 'decoration', difficulty: 'easy',
    duration: '5分钟', coverImage: '',
    summary: '想在墙上挂画又怕敲裂墙皮？用胶带和找准位置才是关键。',
    steps: [
      { order: 1, title: '贴美纹胶带', description: '在要钉的位置十字交叉贴上美纹纸胶带，这样锤子打下去墙皮不会崩裂。' },
      { order: 2, title: '确认墙体材质', description: '用手敲墙面听声音。空心的是石膏板，实心的是混凝土。石膏板用膨胀螺栓，混凝土用钢钉。' },
      { order: 3, title: '斜向入钉', description: '钉子45度角斜向打入，比垂直更牢。如果遇到钢筋打不动，换个位置。' },
    ],
    tools: ['美纹纸胶带', '锤子', '钢钉/膨胀螺栓', '水平尺'],
    createdAt: '2025-05-15',
  },
  {
    id: '4', title: '洗衣机不排水怎么办', category: 'appliance', difficulty: 'medium',
    duration: '20分钟', coverImage: '',
    summary: '洗衣机洗完衣服水还在里面？先别叫维修，这几个原因自己就能排查。',
    steps: [
      { order: 1, title: '检查排水管', description: '看排水管有没有弯折、压扁。把管子从地漏拔出来看看是不是堵了杂物。' },
      { order: 2, title: '清理过滤器', description: '洗衣机右下角有个小门，打开后逆时针拧出过滤器。清理硬币、发卡等杂物。' },
      { order: 3, title: '检查排水泵', description: '拔掉电源，打开后盖，找到排水泵检查叶轮是否卡住。用手转动试试。' },
    ],
    tools: ['盆', '抹布', '螺丝刀', '手电筒'],
    createdAt: '2025-05-20',
  },
];

const categories: Category[] = ['plumbing', 'electrical', 'carpentry', 'cleaning', 'appliance', 'decoration', 'safety', 'other'];

const DIFFICULTY_MAP = {
  easy: { label: '⭐ 简单', color: COLORS.success },
  medium: { label: '⭐⭐ 中等', color: COLORS.warning },
  hard: { label: '⭐⭐⭐ 进阶', color: COLORS.error },
};

export default function KnowledgeScreen() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    setLoading(true);
    try {
      const data = await fetchTutorials();
      if (data.length > 0) {
        setTutorials(data);
      } else {
        setTutorials(MOCK_TUTORIALS);
      }
    } catch {
      setTutorials(MOCK_TUTORIALS);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutorials = tutorials.filter((t) => {
    const matchCategory = !selectedCategory || t.category === selectedCategory;
    const matchSearch = !searchText || t.title.includes(searchText) || t.summary.includes(searchText);
    return matchCategory && matchSearch;
  });

  // 教程详情页
  if (selectedTutorial) {
    const diff = DIFFICULTY_MAP[selectedTutorial.difficulty];
    return (
      <View style={styles.container}>
        <DetailHeader>
          <BackButton onPress={() => setSelectedTutorial(null)} />
          <Text style={styles.detailTitle}>{selectedTutorial.title}</Text>
          <View style={styles.detailMeta}>
            <View style={[styles.diffBadge, { backgroundColor: diff.color + '20' }]}>
              <Text style={[styles.diffBadgeText, { color: diff.color }]}>{diff.label}</Text>
            </View>
            <Text style={styles.detailDuration}>⏱ {selectedTutorial.duration}</Text>
          </View>
        </DetailHeader>

        <FlatList
          data={selectedTutorial.steps}
          keyExtractor={(item) => String(item.order)}
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.toolsSection}>
              <Text style={styles.sectionTitle}>🧰 准备工具</Text>
              <View style={styles.toolsList}>
                {selectedTutorial.tools.map((tool, i) => (
                  <View key={i} style={styles.toolTag}>
                    <Text style={styles.toolTagText}>{tool}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>📋 操作步骤</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.detailFooter}>
              <Text style={styles.footerText}>💪 你已经比90%的人更会动手了！</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{item.order}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.description}</Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="SheCan 知识库" subtitle="生活难题，自己动手 💪" />

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索你想解决的问题..."
          placeholderTextColor={COLORS.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        horizontal
        data={['all', ...categories]}
        keyExtractor={(item) => item}
        style={styles.categoryScroll}
        contentContainerStyle={{ paddingHorizontal: SPACING.xl }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isAll = item === 'all';
          const active = isAll ? !selectedCategory : selectedCategory === item;
          return (
            <TouchableOpacity
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(isAll ? null : item as Category)}>
              <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                {isAll ? '全部' : CATEGORY_LABELS[item as Category]}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <LoadingState text="加载教程中..." />
      ) : (
        <FlatList
          data={filteredTutorials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const diff = DIFFICULTY_MAP[item.difficulty];
            return (
              <CardBox onPress={() => setSelectedTutorial(item)}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardCategory}>{CATEGORY_LABELS[item.category as Category]}</Text>
                  <View style={[styles.cardDiff, { backgroundColor: diff.color + '20' }]}>
                    <Text style={[styles.cardDiffText, { color: diff.color }]}>{diff.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardDuration}>⏱ {item.duration}</Text>
                  <Text style={styles.cardArrow}>→</Text>
                </View>
              </CardBox>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>🔍 没找到相关教程</Text>
              <Text style={styles.emptySub}>试试其他关键词或分类</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.xl, marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, height: 48,
    shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  categoryScroll: { maxHeight: 44, marginBottom: SPACING.md },
  categoryChip: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: 14, color: COLORS.textSecondary },
  categoryChipTextActive: { color: COLORS.white, fontWeight: '600' },
  listContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cardCategory: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  cardDiff: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  cardDiffText: { fontSize: 11, fontWeight: '600' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  cardSummary: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.md },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDuration: { fontSize: 13, color: COLORS.textMuted },
  cardArrow: { fontSize: 18, color: COLORS.primary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  emptySub: { fontSize: 13, color: COLORS.textMuted },
  // Detail styles
  detailTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  detailMeta: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  diffBadge: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.sm, marginRight: SPACING.md },
  diffBadgeText: { fontSize: 12, fontWeight: '600' },
  detailDuration: { fontSize: 13, color: COLORS.textSecondary },
  detailContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.xxxl },
  toolsSection: { marginBottom: SPACING.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  toolsList: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.sm },
  toolTag: {
    backgroundColor: COLORS.surfaceAlt, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, margin: SPACING.sm,
  },
  toolTagText: { fontSize: 13, color: COLORS.text },
  stepCard: {
    flexDirection: 'row', marginBottom: SPACING.lg, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.lg,
  },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  stepNumberText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  stepDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  detailFooter: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  footerText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
});
