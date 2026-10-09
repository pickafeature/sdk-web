import {
  ApiClient,
  PickAFeatureError,
  getUpvotedIds,
  setUpvotedIds,
  type FeatureComment,
  type FeatureRequest,
  type FeatureRequestStatus,
  type Identity,
} from "./api";
import { STYLES } from "./styles";
import { DEFAULT_LOCALE, LOCALES, resolveLocale } from "./locales";

export type Theme = "light" | "dark" | "auto";

export interface Strings {
  title: string;
  subtitle: string;
  tabPlanned: string;
  tabCompleted: string;
  suggest: string;
  emptyPlanned: string;
  emptyCompleted: string;
  formHelp: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  emailLabel: string;
  emailHint: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  cancel: string;
  back: string;
  close: string;
  submitted: string;
  comments: string;
  noComments: string;
  commentPlaceholder: string;
  post: string;
  team: string;
  user: string;
  done: string;
  loading: string;
  retry: string;
  errorGeneric: string;
  rateLimited: string;
  validation: string;
  poweredBy: string;
  launcher: string;
  upvote: string;
  removeVote: string;
}

export const DEFAULT_STRINGS: Strings = {
  title: "Feature requests",
  subtitle: "Vote for what we build next",
  tabPlanned: "Planned",
  tabCompleted: "Completed",
  suggest: "Suggest a feature",
  emptyPlanned: "Nothing planned yet. Be the first to suggest something.",
  emptyCompleted: "Shipped features will show up here.",
  formHelp: "Tell us what would make this product more useful for you. Approved requests appear on the board so others can vote on them.",
  titleLabel: "Title",
  titlePlaceholder: "Short summary",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Describe your feature idea and how you'd use it…",
  emailLabel: "Email",
  emailHint: "optional, so we can follow up",
  emailPlaceholder: "you@example.com",
  submit: "Submit",
  submitting: "Submitting…",
  cancel: "Cancel",
  back: "Back",
  close: "Close",
  submitted: "Thanks! We read every request and will review yours soon.",
  comments: "Comments",
  noComments: "No comments yet. Start the conversation.",
  commentPlaceholder: "Add a comment…",
  post: "Post",
  team: "Team",
  user: "User",
  done: "Done",
  loading: "Loading…",
  retry: "Try again",
  errorGeneric: "Something went wrong. Please try again.",
  rateLimited: "Too many requests. Please try again in a minute.",
  validation: "Please add a title and a description.",
  poweredBy: "Powered by",
  launcher: "Feedback",
  upvote: "Upvote",
  removeVote: "Remove vote",
};

export interface LauncherOptions {
  position?: "bottom-right" | "bottom-left";
  label?: string;
}

export interface PickAFeatureOptions {
  /** Project API key from the dashboard (Settings → API Keys). */
  apiKey: string;
  /** Override the API base URL. Defaults to https://pickafeature.com/api/v1/sdk. */
  baseUrl?: string;
  /** "auto" follows prefers-color-scheme. Default "auto". */
  theme?: Theme;
  /** Any CSS color. Default #6366f1. */
  primaryColor?: string;
  /** Text color used on top of primaryColor. Default #ffffff. */
  primaryTextColor?: string;
  /** Panel corner radius in px. Default 14. */
  borderRadius?: number;
  /** z-index for the overlay and launcher. Default 2147483000. */
  zIndex?: number;
  /** Show the optional email field on the submit form. Default true. */
  showEmailField?: boolean;
  /** Identify the signed-in user so their votes follow them across devices. */
  user?: Identity;
  /**
   * UI language. "auto" (default) follows the visitor's browser language;
   * otherwise a code like "es" or "pt". Unsupported codes fall back to English.
   * See LOCALE_NAMES for the built-in set.
   */
  locale?: string;
  /** Override any UI text. Applied on top of the locale's built-in strings. */
  strings?: Partial<Strings>;
  /** Render a floating "Feedback" button. Default false. */
  launcher?: boolean | LauncherOptions;
  /**
   * Render the board inline inside this element (selector or element) instead
   * of as a modal. No overlay, launcher, or close button; the board is always
   * open. Used by hosted board pages and for embedding a board in your own page.
   */
  container?: string | HTMLElement;
  /** Show the "Powered by pick a feature" footer. Default true. */
  poweredBy?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onSubmit?: (request: { id: string; title: string }) => void;
  onVote?: (vote: { id: string; direction: "up" | "down"; upvotes: number }) => void;
  onComment?: (comment: { featureRequestId: string; id: string }) => void;
  onError?: (error: PickAFeatureError | Error) => void;
}

type View = "list" | "detail" | "form";

const ICONS = {
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  children: Array<Node | string | null | undefined> = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === "className") node.className = String(v);
    else if (k === "html") node.innerHTML = String(v); // trusted static SVG only
    else node.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children) {
    if (c === null || c === undefined) continue;
    node.append(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function icon(name: keyof typeof ICONS): HTMLElement {
  return el("span", { html: ICONS[name], "aria-hidden": "true", style: "display:inline-flex" });
}

function formatDate(iso: string, locale?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d.toDateString();
  }
}

export class PickAFeatureWidget {
  private opts: PickAFeatureOptions;
  private api: ApiClient;
  private strings: Strings = DEFAULT_STRINGS;
  private locale: string = DEFAULT_LOCALE;

  private host: HTMLElement | null = null;
  private shadow: ShadowRoot | null = null;
  private root: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private launcherEl: HTMLElement | null = null;
  private mediaQuery: MediaQueryList | null = null;

  private view: View = "list";
  private tab: FeatureRequestStatus = "approved";
  private requests: FeatureRequest[] = [];
  private loaded = false;
  private loading = false;
  private loadError = "";
  private upvoted = new Set<string>();
  private voting = new Set<string>();
  private selected: FeatureRequest | null = null;
  private comments: FeatureComment[] | null = null;
  private commentsError = "";
  private formError = "";
  private submitting = false;
  private notice = "";

  private onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.overlay) this.close();
  };
  private onDocClick = (e: MouseEvent) => {
    const target = e.target as Element | null;
    const trigger = target?.closest?.("[data-pickafeature-open]");
    if (trigger) {
      e.preventDefault();
      this.open();
    }
  };

  constructor(opts: PickAFeatureOptions) {
    if (!opts || !opts.apiKey) throw new Error("PickAFeature: apiKey is required");
    this.opts = opts;
    this.api = new ApiClient(opts.apiKey, opts.baseUrl);
    this.api.identity = opts.user || {};
    this.applyLocale();
    this.upvoted = getUpvotedIds();

    document.addEventListener("click", this.onDocClick);
    if (opts.container) this.open();
    else if (opts.launcher) this.mount();
  }

  private get inline(): boolean {
    return !!this.opts.container;
  }

  private resolveContainer(): HTMLElement {
    const c = this.opts.container;
    const el = typeof c === "string" ? document.querySelector<HTMLElement>(c) : c || null;
    if (!el) throw new Error(`PickAFeature: container ${typeof c === "string" ? c : ""} not found`);
    return el;
  }

  // ─── Public API ───

  identify(user: Identity): void {
    this.api.identity = { ...this.api.identity, ...user };
  }

  reset(): void {
    this.api.identity = {};
  }

  open(): void {
    this.mount();
    if (this.overlay) return;
    this.view = "list";
    this.notice = "";
    this.renderOverlay();
    if (!this.inline) document.addEventListener("keydown", this.onKeydown);
    if (!this.loaded) void this.load();
    this.opts.onOpen?.();
  }

  close(): void {
    if (!this.overlay || this.inline) return;
    this.overlay.remove();
    this.overlay = null;
    document.removeEventListener("keydown", this.onKeydown);
    this.opts.onClose?.();
  }

  isOpen(): boolean {
    return !!this.overlay;
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  update(opts: Partial<PickAFeatureOptions>): void {
    this.opts = { ...this.opts, ...opts };
    if (opts.strings || opts.locale) this.applyLocale();
    if (opts.user) this.api.identity = { ...this.api.identity, ...opts.user };
    this.applyTheme();
    if (this.overlay) this.renderPanel();
  }

  destroy(): void {
    this.close();
    document.removeEventListener("click", this.onDocClick);
    this.mediaQuery?.removeEventListener?.("change", this.applyThemeBound);
    this.host?.remove();
    this.host = null;
    this.shadow = null;
    this.root = null;
    this.launcherEl = null;
  }

  // ─── Mount / theme / locale ───

  private applyThemeBound = () => this.applyTheme();

  // Strings resolve in three layers: English defaults, then the locale's
  // built-in translation, then whatever the customer passed in `strings`.
  private applyLocale(): void {
    const requested = this.opts.locale || "auto";
    this.locale =
      requested === "auto"
        ? resolveLocale(typeof navigator !== "undefined" ? navigator.languages || [navigator.language] : null)
        : resolveLocale([requested]);
    this.strings = { ...DEFAULT_STRINGS, ...(LOCALES[this.locale] || {}), ...(this.opts.strings || {}) };
    if (this.root) this.root.lang = this.locale;
  }

  private mount(): void {
    if (this.host) return;
    this.host = document.createElement("div");
    this.host.id = "pickafeature-root";
    this.shadow = this.host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLES;
    this.shadow.append(style);
    this.root = el("div", { className: this.inline ? "pf-root pf-root-inline" : "pf-root" });
    this.root.lang = this.locale;
    this.shadow.append(this.root);
    (this.inline ? this.resolveContainer() : document.body).append(this.host);

    this.mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)") ?? null;
    this.mediaQuery?.addEventListener?.("change", this.applyThemeBound);
    this.applyTheme();

    if (this.opts.launcher && !this.inline) this.renderLauncher();
  }

  private applyTheme(): void {
    if (!this.root) return;
    const theme = this.opts.theme || "auto";
    const resolved = theme === "auto" ? (this.mediaQuery?.matches ? "dark" : "light") : theme;
    this.root.dataset.theme = resolved;
    this.root.style.setProperty("--pf-primary", this.opts.primaryColor || "#6366f1");
    this.root.style.setProperty("--pf-primary-fg", this.opts.primaryTextColor || "#ffffff");
    this.root.style.setProperty("--pf-radius", `${this.opts.borderRadius ?? 14}px`);
    this.root.style.setProperty("--pf-z", String(this.opts.zIndex ?? 2147483000));
  }

  private renderLauncher(): void {
    if (!this.root || this.launcherEl) return;
    const cfg = typeof this.opts.launcher === "object" ? this.opts.launcher : {};
    this.launcherEl = el(
      "button",
      { className: "pf-launcher", type: "button", "data-position": cfg.position || "bottom-right" },
      [icon("bulb"), cfg.label || this.strings.launcher],
    );
    this.launcherEl.addEventListener("click", () => this.open());
    this.root.append(this.launcherEl);
  }

  // ─── Data ───

  private async load(): Promise<void> {
    this.loading = true;
    this.loadError = "";
    this.renderPanel();
    try {
      const list = await this.api.list();
      // Team posts first so announcements are seen, then by votes, then newest.
      const team = (r: FeatureRequest) => (r.authorType === "admin" ? 1 : 0);
      list.sort((a, b) => team(b) - team(a) || b.upvotes - a.upvotes || b.createdAt.localeCompare(a.createdAt));
      this.requests = list;
      this.loaded = true;
    } catch (err) {
      this.loadError = this.errorMessage(err);
      this.opts.onError?.(err as Error);
    } finally {
      this.loading = false;
      this.renderPanel();
    }
  }

  private errorMessage(err: unknown): string {
    if (err instanceof PickAFeatureError) {
      if (err.isRateLimit) return this.strings.rateLimited;
      if (err.isNetworkError) return err.message;
      return err.message || this.strings.errorGeneric;
    }
    return this.strings.errorGeneric;
  }

  private async toggleVote(req: FeatureRequest): Promise<void> {
    if (this.voting.has(req.id)) return;
    const wasUpvoted = this.upvoted.has(req.id);
    const direction: "up" | "down" = wasUpvoted ? "down" : "up";

    const applyLocal = (isUp: boolean, delta: number) => {
      if (isUp) this.upvoted.add(req.id);
      else this.upvoted.delete(req.id);
      setUpvotedIds(this.upvoted);
      const r = this.requests.find((x) => x.id === req.id);
      if (r) r.upvotes = Math.max(0, r.upvotes + delta);
    };

    this.voting.add(req.id);
    applyLocal(!wasUpvoted, wasUpvoted ? -1 : 1);
    this.renderPanel();

    try {
      const res = await this.api.vote(req.id, direction);
      const r = this.requests.find((x) => x.id === req.id);
      if (r) r.upvotes = res.upvotes;
      this.opts.onVote?.({ id: req.id, direction, upvotes: res.upvotes });
    } catch (err) {
      if (err instanceof PickAFeatureError && err.status === 409) {
        applyLocal(true, 0); // server already has our vote (e.g. from another device)
      } else if (err instanceof PickAFeatureError && err.status === 404 && direction === "down") {
        applyLocal(false, 0); // nothing to remove; local state was stale
      } else {
        applyLocal(wasUpvoted, wasUpvoted ? 1 : -1);
        this.notice = this.errorMessage(err);
        this.opts.onError?.(err as Error);
      }
    } finally {
      this.voting.delete(req.id);
      this.renderPanel();
    }
  }

  private async openDetail(req: FeatureRequest): Promise<void> {
    this.selected = req;
    this.comments = null;
    this.commentsError = "";
    this.view = "detail";
    this.renderPanel();
    try {
      const list = await this.api.comments(req.id);
      if (this.selected?.id !== req.id) return;
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      this.comments = list;
    } catch (err) {
      if (this.selected?.id !== req.id) return;
      this.commentsError = this.errorMessage(err);
    }
    this.renderPanel();
  }

  // ─── Rendering ───

  private renderOverlay(): void {
    if (!this.root) return;
    this.overlay = el("div", { className: this.inline ? "pf-inline" : "pf-overlay" });
    if (!this.inline) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.close();
      });
    }
    const panel = el("div", { className: "pf-panel", role: "dialog", "aria-modal": "true", "aria-label": this.strings.title || DEFAULT_STRINGS.title });
    this.overlay.append(panel);
    this.root.append(this.overlay);
    this.renderPanel();
  }

  private renderPanel(): void {
    const panel = this.overlay?.querySelector<HTMLElement>(".pf-panel");
    if (!panel) return;
    // Keep in-progress form input intact: only rebuild the form view on explicit state changes.
    if (this.view === "form" && panel.dataset.view === "form" && !this.formError && !this.submitting && panel.querySelector(".pf-textarea")) {
      const btn = panel.querySelector<HTMLButtonElement>(".pf-submit");
      if (btn) btn.disabled = this.submitting;
      return;
    }
    panel.dataset.view = this.view;
    panel.replaceChildren();
    const header = this.renderHeader();
    if (header) panel.append(header);
    if (this.view === "list") panel.append(this.renderToolbar(), this.renderList());
    else if (this.view === "detail") panel.append(this.renderDetail());
    else panel.append(this.renderForm());
    if (this.opts.poweredBy !== false) {
      panel.append(
        el("div", { className: "pf-footer" }, [
          `${this.strings.poweredBy} `,
          el("a", { href: "https://pickafeature.com?utm_source=widget", target: "_blank", rel: "noopener noreferrer" }, ["pick a feature"]),
        ]),
      );
    }
    if (this.view === "form") panel.querySelector<HTMLInputElement>(".pf-input")?.focus();
  }

  // Returns null on the list view when there is nothing to show: inline
  // boards that already have their own page heading pass empty title and
  // subtitle strings to avoid a second header.
  private renderHeader(): HTMLElement | null {
    const s = this.strings;
    const isRoot = this.view === "list";
    if (isRoot && this.inline && !s.title && !s.subtitle) return null;
    const title = isRoot ? s.title : this.view === "form" ? s.suggest : this.tab === "completed" ? s.tabCompleted : s.tabPlanned;
    const leading = isRoot
      ? null
      : (() => {
          const b = el("button", { className: "pf-icon-btn", type: "button", "aria-label": s.back }, [icon("back")]);
          b.addEventListener("click", () => {
            this.view = "list";
            this.formError = "";
            this.renderPanel();
          });
          return b;
        })();
    let closeBtn: HTMLElement | null = null;
    if (!this.inline) {
      closeBtn = el("button", { className: "pf-icon-btn", type: "button", "aria-label": s.close }, [icon("close")]);
      closeBtn.addEventListener("click", () => this.close());
    }
    return el("div", { className: "pf-header" }, [
      leading,
      el("div", { className: "pf-header-text" }, [
        el("h2", { className: "pf-title" }, [title]),
        isRoot && s.subtitle ? el("p", { className: "pf-subtitle" }, [s.subtitle]) : null,
      ]),
      closeBtn,
    ]);
  }

  private renderToolbar(): HTMLElement {
    const s = this.strings;
    const tabs = el("div", { className: "pf-tabs", role: "tablist" });
    (
      [
        ["approved", s.tabPlanned],
        ["completed", s.tabCompleted],
      ] as [FeatureRequestStatus, string][]
    ).forEach(([value, label]) => {
      const b = el("button", { className: "pf-tab", type: "button", role: "tab", "aria-selected": String(this.tab === value) }, [label]);
      b.addEventListener("click", () => {
        this.tab = value;
        this.renderPanel();
      });
      tabs.append(b);
    });
    const suggest = el("button", { className: "pf-btn pf-btn-primary", type: "button" }, [icon("bulb"), s.suggest]);
    suggest.addEventListener("click", () => this.showForm());
    return el("div", { className: "pf-toolbar" }, [tabs, suggest]);
  }

  private showForm(): void {
    this.view = "form";
    this.formError = "";
    this.notice = "";
    this.renderPanel();
  }

  private renderList(): HTMLElement {
    const s = this.strings;
    const body = el("div", { className: "pf-body" });

    if (this.notice) {
      const n = el("div", { className: "pf-notice pf-notice-error", style: "margin-bottom:10px" }, [this.notice]);
      body.append(n);
    }

    if (this.loading && !this.loaded) {
      body.append(...[0, 1, 2].map(() => el("div", { className: "pf-skeleton", style: "margin-bottom:10px" })));
      return body;
    }
    if (this.loadError) {
      const retry = el("button", { className: "pf-link", type: "button", style: "margin-top:8px" }, [s.retry]);
      retry.addEventListener("click", () => void this.load());
      body.append(el("div", { className: "pf-empty" }, [el("div", {}, [this.loadError]), retry]));
      return body;
    }

    const visible = this.requests.filter((r) => r.status === this.tab);
    if (visible.length === 0) {
      const empty = el("div", { className: "pf-empty" }, [
        icon("bulb"),
        el("div", {}, [this.tab === "approved" ? s.emptyPlanned : s.emptyCompleted]),
      ]);
      if (this.tab === "approved") {
        const b = el("button", { className: "pf-link", type: "button", style: "margin-top:8px" }, [s.suggest]);
        b.addEventListener("click", () => this.showForm());
        empty.append(b);
      }
      body.append(empty);
      return body;
    }

    const list = el("ul", { className: "pf-list" });
    for (const req of visible) {
      const main = el("button", { className: "pf-item-main", type: "button" }, [
        el("div", { className: "pf-item-head" }, [
          el("h3", { className: "pf-item-title" }, [req.title]),
          req.authorType === "admin" ? el("span", { className: "pf-badge pf-badge-team" }, [s.team]) : null,
          req.status === "completed" ? el("span", { className: "pf-badge" }, [s.done]) : null,
        ]),
        el("p", { className: "pf-item-desc" }, [req.description]),
        el("div", { className: "pf-item-meta" }, [
          el("span", {}, [formatDate(req.createdAt, this.locale)]),
          el("span", {}, [icon("comment"), s.comments]),
        ]),
      ]);
      main.addEventListener("click", () => void this.openDetail(req));
      list.append(el("li", { className: "pf-item" }, [this.renderVoteButton(req), main]));
    }
    body.append(list);
    return body;
  }

  private renderVoteButton(req: FeatureRequest): HTMLElement {
    const isUp = this.upvoted.has(req.id);
    const b = el(
      "button",
      {
        className: "pf-vote",
        type: "button",
        "aria-pressed": String(isUp),
        "aria-label": isUp ? this.strings.removeVote : this.strings.upvote,
        disabled: this.voting.has(req.id),
      },
      [icon("up"), String(req.upvotes)],
    );
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      void this.toggleVote(req);
    });
    return b;
  }

  private renderDetail(): HTMLElement {
    const s = this.strings;
    const body = el("div", { className: "pf-body" });
    const req = this.selected;
    if (!req) return body;
    const live = this.requests.find((r) => r.id === req.id) || req;

    body.append(
      el("div", { className: "pf-detail" }, [
        this.renderVoteButton(live),
        el("div", { style: "min-width:0;flex:1" }, [
          el("h3", { className: "pf-detail-title" }, [live.title]),
          el("p", { className: "pf-detail-desc" }, [live.description]),
          el("div", { className: "pf-detail-meta" }, [
            live.authorType === "admin" ? el("span", { className: "pf-badge pf-badge-team", style: "margin-right:8px" }, [s.team]) : null,
            formatDate(live.createdAt, this.locale),
          ]),
        ]),
      ]),
    );
    if (this.notice) body.append(el("div", { className: "pf-notice pf-notice-error", style: "margin-top:12px" }, [this.notice]));

    body.append(el("h4", { className: "pf-section-title" }, [s.comments]));
    if (this.comments === null && !this.commentsError) {
      body.append(el("p", { className: "pf-help" }, [s.loading]));
    } else if (this.commentsError) {
      body.append(el("div", { className: "pf-notice pf-notice-error" }, [this.commentsError]));
    } else if (this.comments && this.comments.length === 0) {
      body.append(el("p", { className: "pf-help" }, [s.noComments]));
    } else if (this.comments) {
      const list = el("ul", { className: "pf-comments" });
      // One level of threading: each top-level comment is followed by the
      // team replies attached to it. Replies whose parent is gone show flat.
      const replies = new Map<string, FeatureComment[]>();
      for (const c of this.comments) {
        if (c.parentId) replies.set(c.parentId, [...(replies.get(c.parentId) || []), c]);
      }
      const ids = new Set(this.comments.map((c) => c.id));
      const ordered: Array<{ c: FeatureComment; reply: boolean }> = [];
      for (const c of this.comments) {
        if (c.parentId && ids.has(c.parentId)) continue;
        ordered.push({ c, reply: false });
        for (const r of replies.get(c.id) || []) ordered.push({ c: r, reply: true });
      }
      for (const { c, reply } of ordered) {
        const team = c.authorType === "admin";
        list.append(
          el("li", { className: reply ? "pf-comment pf-comment-reply" : "pf-comment", "data-team": String(team) }, [
            el("div", { className: "pf-comment-meta" }, [el("b", {}, [team ? s.team : s.user]), el("span", {}, ["·"]), el("span", {}, [formatDate(c.createdAt, this.locale)])]),
            el("p", { className: "pf-comment-text" }, [c.text]),
          ]),
        );
      }
      body.append(list);
    }

    const input = el("input", { className: "pf-input", type: "text", maxlength: "5000", placeholder: s.commentPlaceholder });
    const post = el("button", { className: "pf-btn pf-btn-primary", type: "submit", "aria-label": s.post }, [icon("send")]);
    const form = el("form", { className: "pf-comment-form" }, [input, post]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      post.disabled = true;
      try {
        const created = await this.api.addComment(live.id, text);
        this.comments = [...(this.comments || []), created];
        this.notice = "";
        this.opts.onComment?.({ featureRequestId: live.id, id: created.id });
      } catch (err) {
        this.notice = this.errorMessage(err);
        this.opts.onError?.(err as Error);
      }
      this.renderPanel();
    });
    body.append(form);
    return body;
  }

  private renderForm(): HTMLElement {
    const s = this.strings;
    const body = el("div", { className: "pf-body" });
    const title = el("input", { className: "pf-input", type: "text", maxlength: "200", placeholder: s.titlePlaceholder });
    const desc = el("textarea", { className: "pf-textarea", maxlength: "5000", placeholder: s.descriptionPlaceholder });
    const showEmail = this.opts.showEmailField !== false;
    const email = el("input", { className: "pf-input", type: "email", placeholder: s.emailPlaceholder });
    if (this.api.identity.email) email.value = this.api.identity.email;

    const cancel = el("button", { className: "pf-btn pf-btn-ghost", type: "button" }, [s.cancel]);
    cancel.addEventListener("click", () => {
      this.view = "list";
      this.formError = "";
      this.renderPanel();
    });
    const submit = el("button", { className: "pf-btn pf-btn-primary pf-submit", type: "submit" }, [icon("send"), this.submitting ? s.submitting : s.submit]);

    const form = el("form", {}, [
      el("p", { className: "pf-help" }, [s.formHelp]),
      el("div", { className: "pf-field" }, [el("label", { className: "pf-label" }, [s.titleLabel]), title]),
      el("div", { className: "pf-field" }, [el("label", { className: "pf-label" }, [s.descriptionLabel]), desc]),
      showEmail
        ? el("div", { className: "pf-field" }, [
            el("label", { className: "pf-label" }, [s.emailLabel, " ", el("small", {}, [`(${s.emailHint})`])]),
            email,
          ])
        : null,
      this.formError ? el("div", { className: "pf-notice pf-notice-error", style: "margin-bottom:12px" }, [this.formError]) : null,
      el("div", { className: "pf-actions" }, [cancel, submit]),
    ]);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this.submitting) return;
      const t = title.value.trim();
      const d = desc.value.trim();
      if (!t || !d) {
        this.formError = s.validation;
        this.renderPanel();
        // Restore what they typed after the re-render.
        const p = this.overlay?.querySelector<HTMLElement>(".pf-panel");
        const nt = p?.querySelector<HTMLInputElement>('input[type="text"]');
        const nd = p?.querySelector<HTMLTextAreaElement>(".pf-textarea");
        const ne = p?.querySelector<HTMLInputElement>('input[type="email"]');
        if (nt) nt.value = title.value;
        if (nd) nd.value = desc.value;
        if (ne) ne.value = email.value;
        return;
      }
      this.submitting = true;
      submit.disabled = true;
      submit.replaceChildren(icon("send"), s.submitting);
      try {
        const res = await this.api.submit({ title: t, description: d, email: showEmail ? email.value.trim() || null : null });
        this.submitting = false;
        this.formError = "";
        this.view = "list";
        this.renderPanel();
        const panelBody = this.overlay?.querySelector<HTMLElement>(".pf-body");
        panelBody?.prepend(el("div", { className: "pf-notice pf-notice-success", style: "margin-bottom:10px" }, [s.submitted]));
        this.opts.onSubmit?.({ id: res.id, title: t });
      } catch (err) {
        this.submitting = false;
        this.formError = this.errorMessage(err);
        this.opts.onError?.(err as Error);
        this.renderPanel();
        const p = this.overlay?.querySelector<HTMLElement>(".pf-panel");
        const nt = p?.querySelector<HTMLInputElement>('input[type="text"]');
        const nd = p?.querySelector<HTMLTextAreaElement>(".pf-textarea");
        const ne = p?.querySelector<HTMLInputElement>('input[type="email"]');
        if (nt) nt.value = t;
        if (nd) nd.value = d;
        if (ne) ne.value = email.value;
      }
    });

    body.append(form);
    return body;
  }
}
