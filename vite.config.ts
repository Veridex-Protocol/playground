import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Vite gives us a real browser origin (http://localhost:5173 by default) which is
// required for WebAuthn / passkey APIs. Pure Node scripts (tsx, ts-node) cannot
// register passkeys — there is no `navigator.credentials` in Node.
//
// The SDK pulls in Node built-ins (`crypto`, `buffer`, `util`) through its Solana
// adapter. We polyfill them so the bundle runs in browser + Stackblitz WebContainer.
export default defineConfig({
  plugins: [nodePolyfills({ protocolImports: true })],
  server: {
    host: true, // bind to 0.0.0.0 so Stackblitz's WebContainer can expose it
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
