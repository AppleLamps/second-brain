import { xaiChatCompletion } from "@/lib/xai";
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
  items: z.array(BookmarkItemSchema).min(1).max(30),
});

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

  const model = process.env.XAI_MODEL ?? "grok-2-latest";

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
    "Your job: help the user retrieve and revisit what they saved.",
    "Important: X bookmark lookup does not include the true 'saved at' timestamp. If a field named savedAt is present, treat it as approximate and do not reason about recency from it.",
    "",
    "Output schema:",
    "{",
    '  "title": string,',
    '  "oneLiner": string,',
    '  "themes": [{"label": string, "why": string}],',
    '  "suggestedTags": string[],',
    '  "resurfaced": [{"id": string, "reason": string, "questionToRevisit": string}],',
    '  "nextActions": string[]',
    "}",
  ].join("\n");

  const user = [
    "Analyze these bookmarks (JSON array).",
    "Focus on: recurring themes, missing tags that would improve retrieval, and 3-8 concrete next actions.",
    "Pick 3-6 items to resurface with a specific reason + a question that makes the user do work.",
    "",
    JSON.stringify(compact),
  ].join("\n");

  try {
    const content = await xaiChatCompletion({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.25,
      maxTokens: 900,
    });

    const insights = JSON.parse(content) as GrokInsights;
    return NextResponse.json({ insights, demo: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: message, insights: demoInsights(items), demo: true },
      { status: 200 },
    );
  }
}
