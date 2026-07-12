// 知识库 - 教程类型
export interface Tutorial {
  id: string;
  title: string;
  category: Category;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  coverImage: string;
  summary: string;
  steps: TutorialStep[];
  tools: string[];
  createdAt: string;
}

export interface TutorialStep {
  order: number;
  title: string;
  description: string;
  imageUrl?: string;
}

export type Category =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'cleaning'
  | 'appliance'
  | 'decoration'
  | 'safety'
  | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  plumbing: '🔧 管道疏通',
  electrical: '⚡ 电路维修',
  carpentry: '🪚 木工家具',
  cleaning: '🧹 清洁收纳',
  appliance: '🔌 家电维修',
  decoration: '🎨 墙面翻新',
  safety: '🛡️ 安全防护',
  other: '📦 其他',
};

// 社区 - 帖子类型
export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  likedByMe: boolean;
  collectedByMe: boolean;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
}

// AI 助手
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
