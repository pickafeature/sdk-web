// Widget styles. Injected into the shadow root so host-page CSS can't leak in
// and ours can't leak out. Colors come from custom properties set on the
// `.pf-root` element by the widget, so theming is a matter of a few vars.
export const STYLES = `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }

.pf-root {
  --pf-primary: #6366f1;
  --pf-primary-fg: #ffffff;
  --pf-radius: 14px;
  --pf-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-family: var(--pf-font);
  font-size: 14px;
  line-height: 1.45;
  color: var(--pf-fg);
  -webkit-font-smoothing: antialiased;
}
.pf-root[data-theme="light"] {
  --pf-bg: #ffffff;
  --pf-fg: #0f172a;
  --pf-fg-muted: #475569;
  --pf-muted: #64748b;
  --pf-border: rgba(15, 23, 42, 0.12);
  --pf-surface: #f1f5f9;
  --pf-surface-hover: #e2e8f0;
  --pf-overlay: rgba(15, 23, 42, 0.45);
  --pf-success: #059669;
  --pf-danger: #dc2626;
}
.pf-root[data-theme="dark"] {
  --pf-bg: #111119;
  --pf-fg: #f1f5f9;
  --pf-fg-muted: #aab2c0;
  --pf-muted: #8b93a3;
  --pf-border: rgba(255, 255, 255, 0.12);
  --pf-surface: rgba(255, 255, 255, 0.07);
  --pf-surface-hover: rgba(255, 255, 255, 0.12);
  --pf-overlay: rgba(0, 0, 0, 0.6);
  --pf-success: #34d399;
  --pf-danger: #f87171;
}

/* Launcher (floating button) */
.pf-launcher {
  position: fixed;
  bottom: 20px;
  z-index: var(--pf-z);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 0;
  border-radius: 999px;
  background: var(--pf-primary);
  color: var(--pf-primary-fg);
  font: 600 14px var(--pf-font);
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transition: transform .15s ease, box-shadow .15s ease;
}
.pf-launcher[data-position="bottom-right"] { right: 20px; }
.pf-launcher[data-position="bottom-left"] { left: 20px; }
.pf-launcher:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22); }
.pf-launcher svg { width: 16px; height: 16px; }

/* Overlay + panel */
.pf-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--pf-z);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--pf-overlay);
  padding: 0;
  animation: pf-fade .15s ease;
}
@media (min-width: 640px) {
  .pf-overlay { align-items: center; padding: 24px; }
}
.pf-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  background: var(--pf-bg);
  color: var(--pf-fg);
  border: 1px solid var(--pf-border);
  border-radius: var(--pf-radius) var(--pf-radius) 0 0;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  animation: pf-rise .2s ease;
}
@media (min-width: 640px) {
  .pf-panel { border-radius: var(--pf-radius); max-height: 85vh; }
}
@keyframes pf-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pf-rise { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .pf-overlay, .pf-panel { animation: none; }
}

.pf-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--pf-border);
}
.pf-header-text { flex: 1; min-width: 0; }
.pf-title { margin: 0; font-size: 16px; font-weight: 650; color: var(--pf-fg); }
.pf-subtitle { margin: 2px 0 0; font-size: 12.5px; color: var(--pf-muted); }
.pf-icon-btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--pf-muted);
  cursor: pointer;
}
.pf-icon-btn:hover { background: var(--pf-surface-hover); color: var(--pf-fg); }
.pf-icon-btn svg { width: 16px; height: 16px; }

.pf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px 4px;
}
.pf-tabs {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--pf-border);
  border-radius: 9px;
  background: var(--pf-surface);
}
.pf-tab {
  padding: 5px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--pf-muted);
  font: 500 12.5px var(--pf-font);
  cursor: pointer;
}
.pf-tab[aria-selected="true"] { background: var(--pf-primary); color: var(--pf-primary-fg); }

.pf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font: 600 13px var(--pf-font);
  cursor: pointer;
  transition: filter .12s ease, background .12s ease;
}
.pf-btn:disabled { opacity: .55; cursor: default; }
.pf-btn-primary { background: var(--pf-primary); color: var(--pf-primary-fg); }
.pf-btn-primary:not(:disabled):hover { filter: brightness(1.08); }
.pf-btn-ghost { background: transparent; color: var(--pf-fg-muted); }
.pf-btn-ghost:hover { background: var(--pf-surface-hover); color: var(--pf-fg); }
.pf-btn svg { width: 14px; height: 14px; }

.pf-body { flex: 1; overflow-y: auto; padding: 12px 18px 18px; }

.pf-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.pf-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--pf-border);
  border-radius: 12px;
  background: var(--pf-surface);
}
.pf-item:hover { background: var(--pf-surface-hover); }
.pf-vote {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  width: 46px;
  height: 52px;
  border: 1px solid var(--pf-border);
  border-radius: 10px;
  background: var(--pf-bg);
  color: var(--pf-fg-muted);
  font: 600 12px var(--pf-font);
  cursor: pointer;
  transition: background .12s ease, color .12s ease, border-color .12s ease;
}
.pf-vote:hover { border-color: var(--pf-primary); color: var(--pf-primary); }
.pf-vote[aria-pressed="true"] { background: var(--pf-primary); border-color: var(--pf-primary); color: var(--pf-primary-fg); }
.pf-vote:disabled { opacity: .6; cursor: default; }
.pf-vote svg { width: 14px; height: 14px; }
.pf-item-main {
  flex: 1;
  min-width: 0;
  text-align: left;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.pf-item-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.pf-item-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--pf-fg); }
.pf-item-desc {
  margin: 4px 0 0;
  color: var(--pf-fg-muted);
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pf-item-meta { margin-top: 6px; display: flex; gap: 10px; align-items: center; font-size: 11.5px; color: var(--pf-muted); }
.pf-item-meta svg { width: 12px; height: 12px; vertical-align: -2px; margin-right: 3px; }
.pf-badge {
  flex: none;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--pf-success) 16%, transparent);
  color: var(--pf-success);
}

.pf-empty {
  padding: 32px 16px;
  text-align: center;
  border: 1px dashed var(--pf-border);
  border-radius: 12px;
  color: var(--pf-fg-muted);
}
.pf-empty svg { width: 22px; height: 22px; color: var(--pf-muted); margin-bottom: 6px; }
.pf-link { border: 0; background: none; padding: 0; color: var(--pf-primary); font: 600 13px var(--pf-font); cursor: pointer; }
.pf-link:hover { text-decoration: underline; }

.pf-skeleton { height: 76px; border-radius: 12px; background: var(--pf-surface); animation: pf-pulse 1.2s ease-in-out infinite; }
@keyframes pf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }

.pf-notice { padding: 10px 12px; border-radius: 10px; font-size: 13px; }
.pf-notice-error { background: color-mix(in srgb, var(--pf-danger) 12%, transparent); color: var(--pf-danger); }
.pf-notice-success { background: color-mix(in srgb, var(--pf-success) 14%, transparent); color: var(--pf-success); }

/* Form */
.pf-field { margin-bottom: 14px; }
.pf-label { display: block; margin-bottom: 5px; font-size: 12px; font-weight: 600; color: var(--pf-fg-muted); }
.pf-label small { font-weight: 400; color: var(--pf-muted); }
.pf-input, .pf-textarea {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--pf-border);
  border-radius: 9px;
  background: var(--pf-surface);
  color: var(--pf-fg);
  font: 14px var(--pf-font);
  outline: none;
}
.pf-input::placeholder, .pf-textarea::placeholder { color: var(--pf-muted); }
.pf-input:focus, .pf-textarea:focus { border-color: var(--pf-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--pf-primary) 22%, transparent); }
.pf-textarea { resize: vertical; min-height: 110px; }
.pf-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.pf-help { margin: 0 0 14px; font-size: 12.5px; color: var(--pf-muted); }

/* Detail */
.pf-detail { display: flex; gap: 12px; }
.pf-detail-title { margin: 0; font-size: 16px; font-weight: 650; }
.pf-detail-desc { margin: 6px 0 0; color: var(--pf-fg-muted); white-space: pre-wrap; }
.pf-detail-meta { margin-top: 6px; font-size: 11.5px; color: var(--pf-muted); }
.pf-section-title { margin: 20px 0 8px; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--pf-muted); }
.pf-comments { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pf-comment { padding: 10px 12px; border: 1px solid var(--pf-border); border-radius: 10px; background: var(--pf-surface); }
.pf-comment[data-team="true"] { border-color: color-mix(in srgb, var(--pf-primary) 40%, transparent); background: color-mix(in srgb, var(--pf-primary) 10%, transparent); }
.pf-comment-meta { display: flex; gap: 6px; margin-bottom: 3px; font-size: 11px; color: var(--pf-muted); }
.pf-comment-meta b { font-weight: 600; color: var(--pf-fg-muted); }
.pf-comment[data-team="true"] .pf-comment-meta b { color: var(--pf-primary); }
.pf-comment-text { margin: 0; white-space: pre-wrap; color: var(--pf-fg); }
.pf-comment-form { display: flex; gap: 8px; margin-top: 12px; }
.pf-comment-form .pf-input { flex: 1; }

.pf-footer {
  padding: 8px 18px;
  border-top: 1px solid var(--pf-border);
  text-align: center;
  font-size: 11px;
  color: var(--pf-muted);
}
.pf-footer a { color: var(--pf-muted); text-decoration: none; font-weight: 600; }
.pf-footer a:hover { color: var(--pf-fg); }
.pf-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;
