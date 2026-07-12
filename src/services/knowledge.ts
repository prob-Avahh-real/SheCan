import { supabase } from './supabase';
import type { Tutorial, TutorialStep, Category } from '../types';

export async function fetchTutorials(options?: {
  category?: Category | null;
  search?: string;
}): Promise<Tutorial[]> {
  let query = supabase
    .from('tutorials')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error('[Supabase] fetchTutorials error:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    duration: row.duration,
    coverImage: row.cover_image || '',
    summary: row.summary,
    steps: (row.steps as TutorialStep[]) || [],
    tools: row.tools || [],
    createdAt: row.created_at,
  }));
}
