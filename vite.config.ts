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
  // The SDK has a few CJS/ESM dual-format deps (wormhole query SDK, axios,
  // ethers) that Vite needs to pre-bundle into proper ESM. Without this list,
  // dynamic imports inside the SDK (e.g. transferViaRelayer → prepareAuth →
  // hubState) can resolve a class as `undefined` and throw
  // "Class extends value undefined is not a constructor or null".
  optimizeDeps: {
    include: [
      '@veridex/sdk',
      '@wormhole-foundation/wormhole-query-sdk',
      'ethers',
      'axios',
      'buffer',
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // The SDK uses `await import('../auth/prepareAuth.js')` inside
    // transferViaRelayer. Rollup tries to extract that into a separate chunk,
    // which can split the wormhole-query-sdk's class hierarchy across chunks
    // and produce a "Class extends value undefined" error at runtime. Inline
    // every dynamic import so we ship a single bundle.
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    host: true, // bind to 0.0.0.0 so Stackblitz's WebContainer can expose it
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
