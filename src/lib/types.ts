export type BookmarkFolder = {
  id: string;
  name: string;
};

export type BookmarkItem = {
  id: string; // post id
  text: string;
  author: {
    id: string;
    name: string;
    username: string;
  };
  createdAt: string; // ISO
  savedAt: string; // ISO (best-effort; X bookmark lookup doesn't return a saved-at timestamp)
  url?: string;
  folderId?: string;
  metrics?: {
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
    impressionCount?: number;
  };
  tags?: string[];
};

export type GrokInsights = {
  title: string;
  oneLiner: string;
  aboutUser: string;
  interestSignals: Array<{ label: string; evidence: string[] }>;
  recentBookmarks: Array<{ id: string; summary: string; why: string }>;
  themes: Array<{ label: string; why: string }>;
  suggestedTags: string[];
  resurfaced: Array<{
    id: string;
    reason: string;
    questionToRevisit: string;
  }>;
  nextActions: string[];
};
