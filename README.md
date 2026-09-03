# pick a feature - web SDK

Embeddable feature-request board for any website. Your users suggest features,
vote on what matters, and comment; you see it all in the
[pick a feature dashboard](https://pickafeature.com). Shares a board with the
[Flutter SDK](https://pub.dev/packages/pickafeature), so web and mobile votes
add up.

## Script tag (any site)

```html
<script
  src="https://pickafeature.com/sdk/v1/pickafeature.js"
  data-api-key="YOUR_API_KEY"
  defer
></script>

<!-- Any element with this attribute opens the board -->
<button data-pickafeature-open>Feature requests</button>
```

Optional `data-` attributes on the script tag: `data-theme="light|dark|auto"`,
`data-primary-color="#6366f1"`, `data-launcher="false"` (hide the floating
button), `data-position="bottom-left"`, `data-label="Feedback"`,
`data-email-field="false"`.

## npm

```bash
npm i pickafeature
```

```ts
import PickAFeature from "pickafeature";

PickAFeature.init({
  apiKey: "YOUR_API_KEY",
  theme: "auto",            // "light" | "dark" | "auto"
  primaryColor: "#6366f1",
  launcher: false,          // or true / { position: "bottom-right", label: "Feedback" }
  user: { id: currentUser.id, email: currentUser.email }, // optional
  strings: { title: "What should we build next?" },       // any UI text
  onSubmit: ({ id, title }) => analytics.track("feature_request_submitted", { id, title }),
});

PickAFeature.open();
PickAFeature.identify({ id, email }); // after sign-in
PickAFeature.reset();                 // on sign-out
```

### React / Next.js

```tsx
"use client";
import { useEffect } from "react";
import PickAFeature from "pickafeature";

export function FeatureRequestsButton({ user }) {
  useEffect(() => {
    PickAFeature.init({ apiKey: "YOUR_API_KEY", user: { id: user?.uid, email: user?.email } });
    return () => PickAFeature.destroy();
  }, [user?.uid, user?.email]);

  return <button onClick={() => PickAFeature.open()}>Feature requests</button>;
}
```

## Headless

```ts
const api = PickAFeature.client("YOUR_API_KEY");
const requests = await api.list();
await api.vote(requests[0].id, "up");
await api.submit({ title: "Dark mode", description: "Please!" });
```

The widget renders inside a Shadow DOM so your CSS and its CSS never collide.
The API key is a public project key (the same one shipped inside mobile apps);
abuse is limited by per-key rate limiting on the server.

## Build

```bash
npm run build   # → dist/ and ../../public/sdk/v1/pickafeature.js (ESM, CJS, IIFE + types)
```
