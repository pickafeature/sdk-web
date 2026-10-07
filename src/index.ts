// pick a feature - web SDK
//
// Two ways to use it:
//
// 1. Script tag (any site):
//    <script src="https://pickafeature.com/sdk/v1/pickafeature.js" data-api-key="wk_…" defer></script>
//    <button data-pickafeature-open>Feature requests</button>
//
// 2. npm (`npm i pickafeature`):
//    import PickAFeature from "pickafeature";
//    PickAFeature.init({ apiKey: "wk_…", theme: "auto" });
//    PickAFeature.open();

import { PickAFeatureWidget, type PickAFeatureOptions, type Strings, type Theme } from "./widget";
import { ApiClient, PickAFeatureError, clearLocalData, type FeatureComment, type FeatureRequest, type Identity } from "./api";

export { PickAFeatureWidget, PickAFeatureError, ApiClient };
export { LOCALES, LOCALE_NAMES, SUPPORTED_LOCALES, resolveLocale } from "./locales";
export type { PickAFeatureOptions, Strings, Theme, FeatureComment, FeatureRequest, Identity };

export const version = "0.2.1";

let instance: PickAFeatureWidget | null = null;

function getInstance(): PickAFeatureWidget {
  if (!instance) throw new Error("PickAFeature: call PickAFeature.init({ apiKey }) first");
  return instance;
}

/** Create (or replace) the widget. Safe to call more than once. */
export function init(options: PickAFeatureOptions): PickAFeatureWidget {
  if (instance) instance.destroy();
  instance = new PickAFeatureWidget(options);
  return instance;
}

export function open(): void {
  getInstance().open();
}

export function close(): void {
  getInstance().close();
}

export function isOpen(): boolean {
  return instance?.isOpen() ?? false;
}

/** Attach the signed-in user so votes and requests follow them across devices. */
export function identify(user: Identity): void {
  getInstance().identify(user);
}

/** Forget the identified user (call on sign-out). Pass `true` to also drop local device data. */
export function reset(clearDevice = false): void {
  instance?.reset();
  if (clearDevice) clearLocalData();
}

export function refresh(): Promise<void> {
  return getInstance().refresh();
}

export function update(options: Partial<PickAFeatureOptions>): void {
  getInstance().update(options);
}

export function destroy(): void {
  instance?.destroy();
  instance = null;
}

/** Programmatic access to the API without the UI. */
export function client(apiKey: string, baseUrl?: string): ApiClient {
  return new ApiClient(apiKey, baseUrl);
}

const PickAFeature = { init, open, close, isOpen, identify, reset, refresh, update, destroy, client, version, PickAFeatureError, PickAFeatureWidget, ApiClient };
export default PickAFeature;

// Auto-init when loaded via a <script> tag carrying data-api-key.
if (typeof document !== "undefined") {
  const script = document.currentScript as HTMLScriptElement | null;
  const apiKey = script?.dataset?.apiKey;
  if (apiKey) {
    const ds = script!.dataset;
    const boot = () =>
      init({
        apiKey,
        theme: (ds.theme as Theme) || "auto",
        locale: ds.locale || "auto",
        // data-title="" / data-subtitle="" hide the board's own header, for
        // pages that already have one above the inline container.
        strings: {
          ...(ds.title !== undefined ? { title: ds.title } : {}),
          ...(ds.subtitle !== undefined ? { subtitle: ds.subtitle } : {}),
        },
        primaryColor: ds.primaryColor,
        launcher: ds.launcher === "false" ? false : { position: (ds.position as "bottom-right" | "bottom-left") || "bottom-right", label: ds.label },
        showEmailField: ds.emailField !== "false",
        container: ds.container || undefined,
      });
    if (document.body) boot();
    else document.addEventListener("DOMContentLoaded", boot, { once: true });
  }
}
