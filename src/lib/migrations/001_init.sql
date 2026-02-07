-- Second Brain schema (Neon/Postgres)

create table if not exists sb_users (
  x_user_id text primary key,
  username text,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sb_bookmark_folders (
  x_user_id text not null references sb_users(x_user_id) on delete cascade,
  folder_id text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (x_user_id, folder_id)
);

create table if not exists sb_bookmarks (
  x_user_id text not null references sb_users(x_user_id) on delete cascade,
  tweet_id text not null,
  folder_id text,
  text text,
  author_id text,
  author_username text,
  author_name text,
  post_created_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  like_count int,
  repost_count int,
  reply_count int,
  impression_count int,
  url text,
  tags jsonb,
  primary key (x_user_id, tweet_id)
);

create index if not exists sb_bookmarks_user_folder_idx
  on sb_bookmarks (x_user_id, folder_id, last_seen_at desc);

create index if not exists sb_bookmarks_user_last_seen_idx
  on sb_bookmarks (x_user_id, last_seen_at desc);

