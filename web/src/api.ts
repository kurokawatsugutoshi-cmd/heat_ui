export type LangCode = "ja" | "en" | "id" | "vi" | "zh-CN";

export type Question = {
  code: string;
  formType: "arrival" | "break";
  valueKind: "VK-INT" | "VK-CODE" | "VK-YN";
  unit: string | null;
  required: boolean;
  sort: number;
  text: string;
  options?: { code: string; text: string }[];
  minInt: number | null;
  maxInt: number | null;
};

export type SitePayload = {
  siteId: string;
  siteName: string;
  formType: "arrival" | "break";
  allowManualIdentity: boolean;
  emergencyPhone: string;
  languages: LangCode[];
  organizations: { id: string; name: string }[];
  questions: Question[];
  notices: { id: string; title: string; body: string }[];
};

export type PersonPayload = {
  workerId: string;
  name: string;
  organizationId: string;
  organizationName: string;
  siteId: string;
  siteName: string;
  expiresAt: string;
  allowManualIdentity: boolean;
  formTokens: { arrival?: string; break?: string };
};

export type SubmitResult = {
  id: string;
  level: "normal" | "caution" | "alert";
  submittedAt?: string;
  formType?: "arrival" | "break";
  deduped?: boolean;
  overwritten?: boolean;
};

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({ error: "SERVER" }));
  if (!response.ok) {
    const error = new Error(body.error ?? "SERVER") as Error & { status: number; body: unknown };
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body as T;
}

export function getSite(token: string, lang: LangCode) {
  return fetch(`/api/public/sites/${encodeURIComponent(token)}?lang=${lang}`).then((response) =>
    parse<SitePayload>(response),
  );
}

export function getPerson(token: string) {
  return fetch(`/api/public/person/${encodeURIComponent(token)}`).then((response) => parse<PersonPayload>(response));
}

export function submitResponse(payload: unknown) {
  return fetch("/api/public/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((response) => parse<SubmitResult>(response));
}

export function adminFetch<T>(path: string, init?: RequestInit) {
  return fetch(path, { credentials: "include", ...init }).then((response) => parse<T>(response));
}
