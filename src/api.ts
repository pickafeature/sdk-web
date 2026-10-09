// Thin client for the PickAFeature SDK API. Mirrors the Flutter SDK's wire
// format so web and mobile users of one project share a board: public project
// key in `x-api-key`, a stable per-browser `deviceId`, and an optional
// app-provided `userId` so a vote cast on one device is still "mine" on another.

export const DEFAULT_BASE_URL = "https://pickafeature.com/api/v1/sdk";

const DEVICE_ID_KEY = "pickafeature_device_id";
const UPVOTED_KEY = "pickafeature_upvoted_ids";

// The API exposes only "approved" (planned / in progress on the dashboard) and
// "completed" to SDK clients. Newly submitted requests are "pending" and are
// not listed until they're reviewed.
export type FeatureRequestStatus = "approved" | "completed";

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: FeatureRequestStatus;
  upvotes: number;
  category: string | null;
  /** "admin" when the project owner posted it from the dashboard. */
  authorType?: string;
  createdAt: string;
}

export interface FeatureComment {
  id: string;
  text: string;
  authorType: string;
  createdAt: string;
}

export interface Identity {
  id?: string | null;
  email?: string | null;
}

export class PickAFeatureError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "PickAFeatureError";
    this.status = status;
    this.retryAfter = retryAfter;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
  get isRateLimit(): boolean {
    return this.status === 429;
  }
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDeviceId(): string {
  const s = storage();
  const existing = s?.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = uuid();
  s?.setItem(DEVICE_ID_KEY, id);
  return id;
}

// There's no "my votes" endpoint, so (like the Flutter SDK) upvoted ids are
// remembered locally. A 409 from the server means "already voted" and is
// reconciled by the caller.
export function getUpvotedIds(): Set<string> {
  try {
    const raw = storage()?.getItem(UPVOTED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function setUpvotedIds(ids: Set<string>): void {
  storage()?.setItem(UPVOTED_KEY, JSON.stringify(Array.from(ids)));
}

export function clearLocalData(): void {
  const s = storage();
  s?.removeItem(DEVICE_ID_KEY);
  s?.removeItem(UPVOTED_KEY);
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  identity: Identity = {};

  constructor(apiKey: string, baseUrl: string = DEFAULT_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async request<T>(path: string, init: RequestInit, fallback: string): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          ...(init.headers || {}),
        },
      });
    } catch {
      throw new PickAFeatureError("Network error. Check your connection and try again.", 0);
    }

    if (!res.ok) {
      let message = fallback;
      try {
        const body = (await res.json()) as { error?: unknown };
        if (typeof body?.error === "string") message = body.error;
      } catch {
        /* keep fallback */
      }
      const retryHeader = res.headers.get("retry-after");
      const retryAfter = res.status === 429 && retryHeader ? Number(retryHeader) : undefined;
      throw new PickAFeatureError(message, res.status, retryAfter);
    }

    return (await res.json()) as T;
  }

  private who() {
    return {
      deviceId: getDeviceId(),
      userId: this.identity.id || undefined,
      platform: "web",
    };
  }

  async list(): Promise<FeatureRequest[]> {
    const data = await this.request<{ featureRequests: FeatureRequest[] }>(
      "/feedback",
      { method: "GET" },
      "Couldn't load feature requests",
    );
    return data.featureRequests || [];
  }

  async submit(input: { title: string; description: string; email?: string | null }): Promise<{ id: string }> {
    return this.request<{ id: string }>(
      "/feedback",
      {
        method: "POST",
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          email: input.email || this.identity.email || undefined,
          ...this.who(),
        }),
      },
      "Couldn't submit your request",
    );
  }

  async vote(featureRequestId: string, direction: "up" | "down"): Promise<{ upvotes: number }> {
    return this.request<{ success: boolean; upvotes: number }>(
      "/vote",
      {
        method: "POST",
        body: JSON.stringify({ featureRequestId, direction, ...this.who() }),
      },
      direction === "up" ? "Couldn't add your vote" : "Couldn't remove your vote",
    );
  }

  async comments(featureRequestId: string): Promise<FeatureComment[]> {
    const data = await this.request<{ comments: FeatureComment[] }>(
      `/comments?featureRequestId=${encodeURIComponent(featureRequestId)}`,
      { method: "GET" },
      "Couldn't load comments",
    );
    return data.comments || [];
  }

  async addComment(featureRequestId: string, text: string): Promise<FeatureComment> {
    return this.request<FeatureComment>(
      "/comments",
      {
        method: "POST",
        body: JSON.stringify({ featureRequestId, text, ...this.who() }),
      },
      "Couldn't post your comment",
    );
  }
}
