import type { Config } from "@react-router/dev/config";

export default {
  // Puter.js is a browser-only SDK loaded via <script> tag,
  // so SSR is not compatible — use SPA mode instead.
  ssr: false,
} satisfies Config;

