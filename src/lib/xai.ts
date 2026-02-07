export type XaiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type XaiChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string | null } | null;
  }> | null;
};

export async function xaiChatCompletion({
  messages,
  model,
  temperature = 0.3,
  maxTokens = 900,
}: {
  messages: XaiChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing XAI_API_KEY");
  }

  const baseUrl = process.env.XAI_BASE_URL ?? "https://api.x.ai/v1";
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`xAI error ${res.status}: ${text.slice(0, 400)}`);
  }

  let parsed: XaiChatCompletionResponse;
  try {
    parsed = JSON.parse(text) as XaiChatCompletionResponse;
  } catch {
    throw new Error(`xAI returned non-JSON: ${text.slice(0, 200)}`);
  }

  const content = parsed.choices?.[0]?.message?.content;
  if (!content) throw new Error("xAI returned empty content");

  return content;
}

