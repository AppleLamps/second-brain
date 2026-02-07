import { xaiAgenticResponse } from "@/lib/xai";
import type { BookmarkItem, GrokInsights } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const BookmarkItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
  createdAt: z.string(),
  savedAt: z.string(),
  url: z.string().optional(),
  folderId: z.string().optional(),
  metrics: z
    .object({
      likeCount: z.number().optional(),
      repostCount: z.number().optional(),
      replyCount: z.number().optional(),
      impressionCount: z.number().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});

const ReqSchema = z.object({
  items: z.array(BookmarkItemSchema).min(1).max(500),
});

const InsightsSchema = z.object({
  title: z.string(),
  oneLiner: z.string(),
  aboutUser: z.string(),
  interestSignals: z.array(
    z.object({
      label: z.string(),
      evidence: z.array(z.string()),
    }),
  ),
  recentBookmarks: z.array(
    z.object({
      id: z.string(),
      summary: z.string(),
      why: z.string(),
    }),
  ),
  themes: z.array(
    z.object({
      label: z.string(),
      why: z.string(),
    }),
  ),
  suggestedTags: z.array(z.string()),
  resurfaced: z.array(
    z.object({
      id: z.string(),
      reason: z.string(),
      questionToRevisit: z.string(),
    }),
  ),
  nextActions: z.array(z.string()),
});

function parseInsights(text: string) {
  try {
    return InsightsSchema.parse(JSON.parse(text));
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Grok returned non-JSON content");
    }
    const trimmed = text.slice(start, end + 1);
    return InsightsSchema.parse(JSON.parse(trimmed));
  }
}

function demoInsights(items: BookmarkItem[]): GrokInsights {
  const tags = new Map<string, number>();
  for (const b of items) {
    for (const t of b.tags ?? []) tags.set(t, (tags.get(t) ?? 0) + 1);
  }
  const suggestedTags = [...tags.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  return {
    title: "Demo insights (no key configured)",
    oneLiner:
      "Set XAI_API_KEY to enable Grok. Until then: lightweight heuristics on your existing tags.",
    themes: [
      { label: "Recurring interests", why: "Top tags summarize your default attention loops." },
      { label: "Durable saves", why: "High-signal items are great candidates for weekly resurfacing." },
      { label: "Missing structure", why: "Turn folders into intent: ‘learn’, ‘decide’, ‘ship’, ‘watch’." },
    ],
    suggestedTags,
    resurfaced: items.slice(0, 5).map((b) => ({
      id: b.id,
      reason: "Recent save with strong framing.",
      questionToRevisit: "What did you do with this information?",
    })),
    nextActions: [
      "Add one meta-tag per save: learn / decide / ship / watch.",
      "Create a 'Claims to verify' tag, and revisit weekly.",
      "Generate a list of authors you frequently bookmark.",
    ],
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ReqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const items = parsed.data.items as BookmarkItem[];

  // If the user hasn't configured Grok yet, keep the UX working.
  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ insights: demoInsights(items), demo: true });
  }

  const model = process.env.XAI_MODEL ?? "grok-4-1-fast-reasoning";

  const compact = items.map((b) => ({
    id: b.id,
    text: b.text,
    author: `@${b.author.username}`,
    createdAt: b.createdAt,
    savedAt: b.savedAt,
    url: b.url,
    tags: b.tags ?? [],
    metrics: b.metrics ?? {},
  }));

  const system = [
    "You are Grok, acting as a personal research assistant for X bookmarks.",
    "Return ONLY valid JSON. No markdown. No extra keys.",
    "Your job: deliver deep, specific observations about the user's bookmarks, interests, and patterns.",
    "Important: X bookmark lookup does not include the true 'saved at' timestamp. If a field named savedAt is present, treat it as approximate and do not reason about recency from it.",
    "If a URL or author is unclear, you may use web_search or x_search to gather context. Only cite information you learned from tools.",
    "",
    "Output schema:",
    "{",
    '  "title": string,',
    '  "oneLiner": string,',
    '  "aboutUser": string,',
    '  "interestSignals": [{"label": string, "evidence": string[]}],',
    '  "recentBookmarks": [{"id": string, "summary": string, "why": string}],',
    '  "themes": [{"label": string, "why": string}],',
    '  "suggestedTags": string[],',
    '  "resurfaced": [{"id": string, "reason": string, "questionToRevisit": string}],',
    '  "nextActions": string[]',
    "}",
  ].join("\n");

  const user = [
    "Analyze these bookmarks (JSON array).",
    "Focus on: what this collection says about the user, their strongest interests, and what they bookmarked most recently (use createdAt as post time; do not claim saved time).",
    "Provide 5-8 interest signals with evidence (bookmark ids or short quotes).",
    "Include 4-8 recent bookmarks with why they matter.",
    "Provide 6-10 concrete next actions.",
    "Pick 4-8 items to resurface with a specific reason + a question that makes the user do work.",
    "Make themes specific and evidence-based, not generic.",
    "Suggested tags should be precise and practical (avoid duplicates or near-synonyms).",
    "",
    JSON.stringify(compact),
  ].join("\n");

  try {
    const content = await xaiAgenticResponse({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [{ type: "web_search" }, { type: "x_search" }, { type: "code_interpreter" }],
      temperature: 0.2,
      maxTokens: 200000,
      maxTurns: 8,
    });

    const insights = parseInsights(content) as GrokInsights;
    return NextResponse.json({ insights, demo: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: message, insights: demoInsights(items), demo: true },
      { status: 200 },
    );
  }
}
