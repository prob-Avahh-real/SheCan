-- SheCan 数据库初始化 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行此文件

-- 1. 开启必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '新姐妹')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. 教程表
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration TEXT NOT NULL DEFAULT '10分钟',
  cover_image TEXT,
  summary TEXT NOT NULL DEFAULT '',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  tools TEXT[] NOT NULL DEFAULT '{}',
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 社区帖子表
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. 点赞表（防止重复点赞）
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 点赞时自动更新 posts.likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_like ON post_likes;
CREATE TRIGGER on_post_like
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 6. 收藏表
CREATE TABLE IF NOT EXISTS post_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 7. 评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====== RLS 策略 ======
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- profiles: 所有人可读，本人可写
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- tutorials: 所有人可读，仅管理员可写（后续可细化）
CREATE POLICY "tutorials_read_all" ON tutorials FOR SELECT USING (true);

-- posts: 所有人可读，登录后可写
CREATE POLICY "posts_read_all" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_auth" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (auth.uid() = user_id);

-- post_likes: 所有人可读，登录后可操作
CREATE POLICY "likes_read_all" ON post_likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_auth" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- post_collections: 所有人可读，登录后可操作
CREATE POLICY "collections_read_all" ON post_collections FOR SELECT USING (true);
CREATE POLICY "collections_insert_auth" ON post_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_delete_own" ON post_collections FOR DELETE USING (auth.uid() = user_id);

-- comments: 所有人可读，登录后可写
CREATE POLICY "comments_read_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ====== 种子数据 ======
INSERT INTO tutorials (title, category, difficulty, duration, summary, steps, tools) VALUES
(
  '下水道堵塞？三步搞定',
  'plumbing',
  'easy',
  '15分钟',
  '厨房水槽下水慢、有异味？不用请师傅，学会这三招自己就能通。',
  '[
    {"order":1,"title":"热水+洗洁精","description":"先烧一壶开水，倒入半瓶洗洁精，缓慢倒入下水口。热水能溶解油脂，洗洁精能润滑管壁。等5分钟后用大量清水冲洗。"},
    {"order":2,"title":"小苏打+白醋","description":"倒入半杯小苏打，再倒入半杯白醋。会起泡冒气，盖住下水口等15分钟，再用热水冲。"},
    {"order":3,"title":"手动疏通器","description":"买手摇疏通器插入下水管，顺时针旋转推进，感觉到阻力就来回抽拉。最后用热水冲。"}
  ]'::jsonb,
  ARRAY['橡胶手套','开水壶','小苏打','白醋','手摇疏通器']
),
(
  '门锁把手松了怎么换',
  'carpentry',
  'medium',
  '30分钟',
  '卧室门把手晃晃悠悠快掉了？一把螺丝刀就能换新。',
  '[
    {"order":1,"title":"拆旧把手","description":"找到把手内侧的两颗螺丝，用十字螺丝刀拧下来。把手会分成内外两半，轻轻拉出来。"},
    {"order":2,"title":"取出锁芯","description":"侧面门边上还有两颗螺丝固定锁舌。拧下后锁舌就能从侧面抽出来。"},
    {"order":3,"title":"安装新把手","description":"先装锁舌，再把把手内外对好孔位穿过去，拧紧螺丝。测试开关门是否顺畅。"}
  ]'::jsonb,
  ARRAY['十字螺丝刀','新门锁把手','卷尺']
),
(
  '墙面钉钉子不裂墙小技巧',
  'decoration',
  'easy',
  '5分钟',
  '想在墙上挂画又怕敲裂墙皮？用胶带和找准位置才是关键。',
  '[
    {"order":1,"title":"贴美纹胶带","description":"在要钉的位置十字交叉贴上美纹纸胶带，这样锤子打下去墙皮不会崩裂。"},
    {"order":2,"title":"确认墙体材质","description":"用手敲墙面听声音。空心的是石膏板，实心的是混凝土。石膏板用膨胀螺栓，混凝土用钢钉。"},
    {"order":3,"title":"斜向入钉","description":"钉子45度角斜向打入，比垂直更牢。如果遇到钢筋打不动就别硬敲，换个位置。"}
  ]'::jsonb,
  ARRAY['美纹纸胶带','锤子','钢钉/膨胀螺栓','水平尺']
),
(
  '洗衣机不排水怎么办',
  'appliance',
  'medium',
  '20分钟',
  '洗衣机洗完衣服水还在里面？先别叫维修，这几个原因自己就能排查。',
  '[
    {"order":1,"title":"检查排水管","description":"看排水管有没有弯折、压扁。把管子从地漏拔出来看看是不是堵了杂物。"},
    {"order":2,"title":"清理过滤器","description":"洗衣机右下角有个小门，打开后逆时针拧出过滤器。清理硬币、发卡等杂物。"},
    {"order":3,"title":"检查排水泵","description":"拔掉电源，打开后盖，找到排水泵检查叶轮是否卡住。用手转动试试。"}
  ]'::jsonb,
  ARRAY['盆','抹布','螺丝刀','手电筒']
),
(
  '空调不制冷？先清洗滤网',
  'appliance',
  'easy',
  '10分钟',
  '天热打开空调发现不凉？估计是滤网太脏了。',
  '[
    {"order":1,"title":"打开面板","description":"空调面板两侧有卡扣，轻轻向上掀开即可看到滤网。"},
    {"order":2,"title":"取出滤网","description":"滤网通常有两片，抓住下方的拉手轻轻抽出。"},
    {"order":3,"title":"清洗晾干","description":"用水冲掉灰尘，可以加点中性洗洁精。晾干后装回，注意方向不要反。"}
  ]'::jsonb,
  ARRAY['抹布','中性洗洁精','吸尘器(可选)']
);
