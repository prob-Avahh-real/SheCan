import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { Post, Comment } from '../types';
import {
  fetchPosts, fetchComments, toggleLike,
  toggleCollect, createPost, addComment,
} from '../services/community';
import { BackButton, CardBox, DetailHeader, LoadingState, ScreenHeader, TagRow } from '../components/ui';

const MOCK_POSTS: Post[] = [
  {
    id: '1', author: { id: 'u1', nickname: '装修小能手阿琳', avatar: '' },
    title: '自己换了全屋开关面板，省了500块！',
    content: '上周家里的开关面板发黄了，问了下师傅报价500还不包材料。淘宝买了10个品牌面板才花了80块，自己照着网上的视频全部换好了！\n\n要点：\n1. 一定要先关电闸！用测电笔试一下确认没电再动手\n2. 拆之前拍照记住火线零线的位置\n3. L接火线，N接零线，地线接中间',
    images: [], tags: ['电路', '开关面板', '省钱'], likes: 238,
    comments: [
      { id: 'c1', author: { id: 'u2', nickname: '小圆子', avatar: '' }, content: '太厉害了！求链接！', createdAt: '2025-05-18' },
      { id: 'c2', author: { id: 'u3', nickname: '北北', avatar: '' }, content: '学到了！下次也试试', createdAt: '2025-05-19' },
    ],
    createdAt: '2025-05-17', likedByMe: false, collectedByMe: true,
  },
  {
    id: '2', author: { id: 'u4', nickname: '独居女孩CC', avatar: '' },
    title: '卫生间下水道反味，花5块钱搞定了',
    content: '一个人住最怕下水道反味。试了买的各种除臭剂都没用。最后发现是洗手台下面的S弯没水了（水封失效），倒了两杯水进去味道全没了！地漏芯老化了也会反味，淘宝买个硅胶防臭地漏芯自己拧上去就行。',
    images: [], tags: ['卫生间', '下水道', '除臭'], likes: 567,
    comments: [], createdAt: '2025-05-20', likedByMe: true, collectedByMe: false,
  },
  {
    id: '3', author: { id: 'u5', nickname: '动手的猫', avatar: '' },
    title: '空调不制冷？先清洗滤网再说',
    content: '最近天热打开空调发现吹出来的风不凉。差点就叫维修了，打开面板一看滤网厚厚一层灰！拆下来水冲一下晾干装回去，制冷效果直接拉满。每年用空调前一定要洗滤网！重要的事说三遍！',
    images: [], tags: ['空调', '清洗', '家电'], likes: 312,
    comments: [
      { id: 'c3', author: { id: 'u6', nickname: '夏天来了', avatar: '' }, content: '每年必做的功课哈哈哈', createdAt: '2025-05-21' },
    ],
    createdAt: '2025-05-21', likedByMe: false, collectedByMe: false,
  },
];

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data.length > 0 ? data : MOCK_POSTS);
    } catch {
      setPosts(MOCK_POSTS);
    } finally { setLoading(false); }
  };

  const handleSelectPost = async (post: Post) => {
    setSelectedPost(post);
    try {
      const comments = await fetchComments(post.id);
      setPostComments(comments.length > 0 ? comments : post.comments);
    } catch { setPostComments(post.comments); }
  };

  const handleLike = async (postId: string) => {
    try { await toggleLike(postId); } catch {}
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleCollect = async (postId: string) => {
    try { await toggleCollect(postId); } catch {}
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, collectedByMe: !p.collectedByMe } : p));
  };

  const handlePublish = async () => {
    if (!newTitle.trim() || !newContent.trim()) { Alert.alert('提示', '请填写标题和内容'); return; }
    try {
      const np = await createPost({ title: newTitle.trim(), content: newContent.trim(), tags: newTag.trim() ? newTag.split(/[,，]/).map(t => t.trim()) : [] });
      if (np) { setPosts(prev => [np, ...prev]); } else {
        setPosts(prev => [{ id: Date.now().toString(), author: { id: 'me', nickname: '我', avatar: '' }, title: newTitle.trim(), content: newContent.trim(), images: [], tags: newTag.trim() ? newTag.split(/[,，]/).map(t => t.trim()) : [], likes: 0, comments: [], createdAt: new Date().toISOString(), likedByMe: false, collectedByMe: false }, ...prev]);
      }
      setShowPublish(false); setNewTitle(''); setNewContent(''); setNewTag('');
    } catch { Alert.alert('发布失败', '请检查网络后重试'); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    const ok = await addComment(selectedPost.id, newComment.trim());
    if (ok) { setPostComments(prev => [...prev, { id: Date.now().toString(), author: { id: 'me', nickname: '我', avatar: '' }, content: newComment.trim(), createdAt: new Date().toISOString() }]); setNewComment(''); }
  };

  if (selectedPost) {
    return (
      <View style={styles.container}>
        <DetailHeader>
          <BackButton onPress={() => setSelectedPost(null)} />
          <View style={styles.detailAuthor}>
            <View style={styles.authorAvatar}><Text style={styles.authorAvatarText}>{selectedPost.author.nickname[0]}</Text></View>
            <View><Text style={styles.authorName}>{selectedPost.author.nickname}</Text><Text style={styles.postTime}>{selectedPost.createdAt}</Text></View>
          </View>
          <Text style={styles.detailTitle}>{selectedPost.title}</Text>
        </DetailHeader>
        <FlatList
          data={postComments} keyExtractor={item => item.id} style={styles.detailBody}
          ListHeaderComponent={
            <View>
              <Text style={styles.detailContent}>{selectedPost.content}</Text>
              {selectedPost.tags.length > 0 && <TagRow tags={selectedPost.tags} />}
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleLike(selectedPost.id)}><Text style={styles.actionBtnText}>{selectedPost.likedByMe ? '❤️' : '🤍'} {selectedPost.likes}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleCollect(selectedPost.id)}><Text style={styles.actionBtnText}>{selectedPost.collectedByMe ? '⭐' : '☆'} 收藏</Text></TouchableOpacity>
              </View>
              <Text style={styles.commentTitle}>💬 评论 ({postComments.length})</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.commentInputRow}>
              <TextInput style={styles.commentInput} placeholder="写下你的评论..." placeholderTextColor={COLORS.textMuted} value={newComment} onChangeText={setNewComment} />
              <TouchableOpacity style={[styles.commentSendBtn, !newComment.trim() && styles.commentSendBtnDisabled]} onPress={handleAddComment} disabled={!newComment.trim()}><Text style={styles.commentSendText}>发送</Text></TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{item.author.nickname[0]}</Text></View>
              <View style={styles.commentBody}><Text style={styles.commentAuthor}>{item.author.nickname}</Text><Text style={styles.commentContent}>{item.content}</Text></View>
            </View>
          )}
          ListEmptyComponent={<View style={styles.noComments}><Text style={styles.noCommentsText}>还没有评论，来抢沙发吧~</Text></View>}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="姐妹互助社" subtitle="分享经验，互相帮助 🌸" />
      {loading ? <LoadingState text="加载中..." /> :
        <FlatList data={posts} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CardBox onPress={() => handleSelectPost(item)}>
              <View style={styles.cardAuthor}>
                <View style={styles.authorAvatarSmall}><Text style={styles.authorAvatarSmallText}>{item.author.nickname[0]}</Text></View>
                <Text style={styles.cardAuthorName}>{item.author.nickname}</Text><Text style={styles.cardTime}>{item.createdAt}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>
              {item.tags.length > 0 && <TagRow tags={item.tags} />}
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleLike(item.id)}><Text style={styles.actionText}>{item.likedByMe ? '❤️' : '🤍'} {item.likes}</Text></TouchableOpacity>
                <Text style={styles.actionText}>💬 {item.comments.length}</Text>
                <TouchableOpacity onPress={() => handleCollect(item.id)}><Text style={styles.actionText}>{item.collectedByMe ? '⭐' : '☆'} 收藏</Text></TouchableOpacity>
              </View>
            </CardBox>
          )}
        />
      }
      <TouchableOpacity style={styles.fab} onPress={() => setShowPublish(true)} activeOpacity={0.8}><Text style={styles.fabText}>✏️</Text></TouchableOpacity>
      <Modal visible={showPublish} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.publishContainer}>
          <View style={styles.publishHeader}>
            <TouchableOpacity onPress={() => setShowPublish(false)}><Text style={styles.publishCancel}>取消</Text></TouchableOpacity>
            <Text style={styles.publishTitle}>分享你的经验</Text>
            <TouchableOpacity onPress={handlePublish}><Text style={styles.publishSubmit}>发布</Text></TouchableOpacity>
          </View>
          <TextInput style={styles.publishTitleInput} placeholder="标题（如：自己修好了漏水的水龙头）" placeholderTextColor={COLORS.textMuted} value={newTitle} onChangeText={setNewTitle} maxLength={50} />
          <TextInput style={styles.publishContentInput} placeholder="分享你的经验和步骤..." placeholderTextColor={COLORS.textMuted} value={newContent} onChangeText={setNewContent} multiline textAlignVertical="top" />
          <TextInput style={styles.publishTagInput} placeholder="标签，用逗号分隔（如：水龙头,厨房,漏水）" placeholderTextColor={COLORS.textMuted} value={newTag} onChangeText={setNewTag} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  cardAuthor: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  authorAvatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  authorAvatarSmallText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cardAuthorName: { fontSize: 14, fontWeight: '600', color: COLORS.text, flex: 1 },
  cardTime: { fontSize: 12, color: COLORS.textMuted },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  cardContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: SPACING.md },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  actionText: { fontSize: 14, color: COLORS.textSecondary, marginRight: SPACING.xl },
  fab: { position: 'absolute', bottom: 30, right: SPACING.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  fabText: { fontSize: 24 },
  publishContainer: { flex: 1, backgroundColor: COLORS.background, paddingTop: SPACING.xxxl + 20 },
  publishHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg },
  publishCancel: { fontSize: 16, color: COLORS.textSecondary },
  publishTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  publishSubmit: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  publishTitleInput: { fontSize: 18, fontWeight: '600', color: COLORS.text, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  publishContentInput: { flex: 1, fontSize: 15, color: COLORS.text, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, lineHeight: 22 },
  publishTagInput: { fontSize: 14, color: COLORS.text, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  detailAuthor: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  authorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  authorAvatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  authorName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  postTime: { fontSize: 12, color: COLORS.textMuted },
  detailTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  detailBody: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  detailContent: { fontSize: 15, color: COLORS.text, lineHeight: 24, marginBottom: SPACING.lg },
  actionRow: { flexDirection: 'row', paddingBottom: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: SPACING.xl },
  actionBtnText: { fontSize: 15, color: COLORS.textSecondary },
  commentTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  commentItem: { flexDirection: 'row', marginBottom: SPACING.lg },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  commentAvatarText: { fontWeight: '700', fontSize: 12, color: COLORS.primary },
  commentBody: { flex: 1 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  commentContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  noComments: { alignItems: 'center', paddingTop: SPACING.xxxl },
  noCommentsText: { fontSize: 14, color: COLORS.textMuted },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.md },
  commentInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 14, color: COLORS.text },
  commentSendBtn: { marginLeft: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.primary, borderRadius: RADIUS.md },
  commentSendBtnDisabled: { opacity: 0.4 },
  commentSendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
