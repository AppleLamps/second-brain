import crypto from "node:crypto";

export function base64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

export function sha256Base64Url(input: string) {
  const digest = crypto.createHash("sha256").update(input).digest();
  return Buffer.from(digest).toString("base64url");
}

export function randomBase64Url(bytes = 32) {
  return base64Url(crypto.randomBytes(bytes));
}

