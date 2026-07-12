import { supabase } from './supabase';
import type { Database } from '../types/database';
import type { Post } from '../types';

type PostRow = Database['public']['Tables']['posts']['Row'];
type PostLikeRow = Database['public']['Tables']['post_likes']['Row'];
type PostCollectionRow = Database['public']['Tables']['post_collections']['Row'];

type ProfileRow = { nickname: string | null; avatar_url: string | null } | null;

type PostWithProfile = PostRow & { profiles: ProfileRow };

type CommentRowWithProfile = Database['public']['Tables']['comments']['Row'] & { profiles: ProfileRow };

interface FetchPostsOptions {
  tag?: string;
}

export async function fetchPosts(options?: FetchPostsOptions): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey (nickname, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (options?.tag) {
    query = query.contains('tags', [options.tag]);
  }

  const result = await query;
  const data = result.data as PostWithProfile[] | null;
  const error = result.error;
  if (error || !data) {
    console.error('[Supabase] fetchPosts error:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    author: {
      id: row.user_id,
      nickname: row.profiles?.nickname || '匿名用户',
      avatar: row.profiles?.avatar_url || '',
    },
    title: row.title,
    content: row.content,
    images: row.images || [],
    tags: row.tags || [],
    likes: row.likes_count || 0,
    comments: [],
    createdAt: row.created_at,
    likedByMe: false,
    collectedByMe: false,
  }));
}

export async function fetchComments(postId: string) {
  const result = await supabase
    .from('comments')
    .select(`
      *,
      profiles (nickname, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  const data = result.data as CommentRowWithProfile[] | null;
  const error = result.error;
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    author: {
      id: row.user_id,
      nickname: row.profiles?.nickname || '匿名用户',
      avatar: row.profiles?.avatar_url || '',
    },
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function toggleLike(postId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const result = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.user.id)
    .maybeSingle();
  const existing = result.data as PostLikeRow | null;

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
    return true;
  }

  await supabase.from('post_likes').insert({ post_id: postId, user_id: user.user.id });
  return true;
}

export async function toggleCollect(postId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const result = await supabase
    .from('post_collections')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.user.id)
    .maybeSingle();
  const existing = result.data as PostCollectionRow | null;

  if (existing) {
    await supabase.from('post_collections').delete().eq('id', existing.id);
    return true;
  }

  await supabase.from('post_collections').insert({ post_id: postId, user_id: user.user.id });
  return true;
}

export async function createPost(post: {
  title: string;
  content: string;
  tags?: string[];
}): Promise<Post | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const response = await supabase
    .from('posts')
    .insert({
      user_id: user.user.id,
      title: post.title,
      content: post.content,
      tags: post.tags || [],
    })
    .select(`
      *,
      profiles!posts_user_id_fkey (nickname, avatar_url)
    `)
    .single();

  const data = response.data as PostWithProfile | null;
  if (response.error || !data) return null;

  return {
    id: data.id,
    author: {
      id: data.user_id,
      nickname: data.profiles?.nickname || '匿名用户',
      avatar: data.profiles?.avatar_url || '',
    },
    title: data.title,
    content: data.content,
    images: data.images || [],
    tags: data.tags || [],
    likes: data.likes_count || 0,
    comments: [],
    createdAt: data.created_at,
    likedByMe: false,
    collectedByMe: false,
  };
}

export async function addComment(postId: string, content: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.user.id,
    content,
  });

  return !error;
}
