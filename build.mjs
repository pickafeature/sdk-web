// Builds the web SDK three ways:
//   dist/pickafeature.js       IIFE, exposes window.PickAFeature - for <script> tags
//   dist/pickafeature.esm.js   ESM - for `import PickAFeature from "pickafeature"`
//   dist/index.d.ts            types
// and copies the IIFE build to ../../public/sdk/v1/pickafeature.js so the
// Next.js site serves it at https://pickafeature.com/sdk/v1/pickafeature.js.
//
// Uses the esbuild/typescript already installed at the repo root, so run it from
// there: `node packages/sdk_web/build.mjs` (or `npm run build` inside this dir).
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(here, "package.json"), "utf8"));
const banner = `/* pick a feature web SDK v${pkg.version} - https://pickafeature.com */`;

const common = {
  entryPoints: [join(here, "src/index.ts")],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  banner: { js: banner },
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
};

await build({ ...common, format: "iife", globalName: "PickAFeature", outfile: join(here, "dist/pickafeature.js"),
  // `export default` inside an IIFE would make window.PickAFeature = { default: {...}, init, ... }.
  // Flatten it so `PickAFeature.init(...)` works as documented.
  footer: { js: "PickAFeature=PickAFeature.default||PickAFeature;" } });
await build({ ...common, format: "esm", outfile: join(here, "dist/pickafeature.esm.js") });

// Types: emit declarations with tsc into dist/types then keep index.d.ts as the entry.
execSync(`npx tsc -p ${join(here, "tsconfig.json")} --noEmit false --emitDeclarationOnly --declaration --outDir ${join(here, "dist/types")}`, {
  stdio: "inherit",
  cwd: join(here, "../.."),
});
copyFileSync(join(here, "dist/types/index.d.ts"), join(here, "dist/index.d.ts"));

const publicDir = join(here, "../../public/sdk/v1");
mkdirSync(publicDir, { recursive: true });
copyFileSync(join(here, "dist/pickafeature.js"), join(publicDir, "pickafeature.js"));

console.log(`built pickafeature web SDK v${pkg.version} → dist/ and public/sdk/v1/pickafeature.js`);
