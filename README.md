# Veridex Playground

A zero-install, browser-based sandbox for Veridex. Register a passkey, mint a bounded session key, and ship a governed transfer on Base Sepolia in under five minutes.

## Try it now

**[Open in Stackblitz →](https://stackblitz.com/github/Veridex-Protocol/playground?file=src/main.ts)**

The Stackblitz tab will boot a Vite dev server, expose it at a public URL, and let you click through Register → Create Session → Send Transfer. Every transfer renders its signed Veridex trace inline.

> **Why a new tab?** Browser passkey prompts (`navigator.credentials.create`) misbehave inside cross-origin iframes — Safari and some Chrome profiles refuse to surface the FaceID/TouchID dialog. Always open the playground in a top-level Stackblitz tab.

## Run locally

```bash
git clone https://github.com/Veridex-Protocol/playground.git
cd playground
npm install
npm run dev
```

Open <http://localhost:5173>.

## What's in this repo

| File | What it does |
|------|--------------|
| `src/main.ts` | End-to-end script wired to three buttons: passkey, session, transfer. |
| `src/policies.ts` | The session policy — `duration` and `maxValue`. Edit and re-run to see verdicts flip. |
| `src/trace-view.ts` | Renders the activity log and the most recent signed trace. |
| `index.html` | UI shell. |
| `vite.config.ts` | Vite dev server config (binds to `0.0.0.0` so Stackblitz can proxy it). |
| `stackblitz.config.json` | Tells Stackblitz to autorun `npm run dev`. |

## Where the relayer lives

The playground talks to the public Veridex relayer at **`https://relayer.veridex.network`** — no API key required on testnet. The relayer is rate-limited to **5 transactions per hour per IP** on Base Sepolia. If you hit the limit, either wait or provision your own key from the [Developer Portal](https://app.veridex.network) (still free during beta).

## Try changing the policy

Open `src/policies.ts` and change `maxValue` to `parseEther('0.0001')`. Click **Send 0.001 ETH** again — the session will reject the transfer with a `spending_limit` verdict, because the requested amount exceeds the cap baked into the session key. That's bounded authority enforced cryptographically, not by a server.

## Where to go next

- **Wire it into your own project:** [Developer Quickstart](https://docs.veridex.network/quickstarts/developer)
- **Understand what just happened:** [Core Concepts](https://docs.veridex.network/getting-started/concepts)
- **Build an agent on top of it:** [Agent Payments guide](https://docs.veridex.network/guides/agent-payments)
- **Operator perspective:** [Operator Quickstart](https://docs.veridex.network/quickstarts/operator)

## License

MIT
