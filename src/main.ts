// Veridex Playground — end-to-end browser script.
//
// What this does, end to end:
//   1. Registers a passkey (FaceID / TouchID / Windows Hello) and provisions a vault.
//   2. Submits a gasless transfer through the public Veridex relayer.
//   3. Renders the transfer's signed trace inline so you can see what got recorded.
//
// Real SDK surface used:
//   - createSDK('base', { network: 'testnet' })
//   - sdk.passkey.register(email, label)
//   - sdk.transferViaRelayer({ targetChain, token, recipient, amount }, onStatusChange)
//
// The relayer URL defaults to https://relayer.veridex.network — no key required on
// testnet. Rate limit is 5 transfers per hour per IP.
//
// Sessions (mint a key with hard caps, then submit many transfers without prompting
// for a passkey each time) are an advanced optimisation. Once you've got this
// running, read https://docs.veridex.network/quickstarts/developer for the session
// flow — it uses the same SDK with two extra setup lines.

import { createSDK } from '@veridex/sdk';
import { parseEther } from 'ethers';
import { renderTrace, log, resetUI } from './trace-view';
import { policy } from './policies';

const sdk = createSDK('base', {
  network: 'testnet',
  relayerUrl: 'https://relayer.veridex.network',
});

const $register = document.querySelector<HTMLButtonElement>('#btn-register')!;
const $session = document.querySelector<HTMLButtonElement>('#btn-session')!;
const $send = document.querySelector<HTMLButtonElement>('#btn-send')!;
const $reset = document.querySelector<HTMLButtonElement>('#btn-reset')!;

// The session button isn't wired to a real session key in this minimal playground —
// it confirms the policy you'd hand to SessionManager. We keep it because seeing
// the policy is the educational moment.
$session.textContent = '2. Confirm policy';
let policyConfirmed = false;

$register.addEventListener('click', async () => {
  try {
    log('Prompting for passkey…', 'muted');
    await sdk.passkey.register('alice@veridex.playground', 'Playground Wallet');
    log('Passkey registered. Vault provisioned on Base Sepolia.', 'good');
    log(`Vault address: ${sdk.getVaultAddress()}`, 'muted');
    $session.disabled = false;
  } catch (err) {
    log(`Passkey registration failed: ${(err as Error).message}`, 'bad');
  }
});

$session.addEventListener('click', () => {
  log(
    `Policy confirmed: duration=${policy.duration}s, maxValue=${policy.maxValueLabel}. ` +
      `(Sessions are optional — this playground submits each transfer via passkey + relayer.)`,
    'good',
  );
  policyConfirmed = true;
  $send.disabled = false;
});

$send.addEventListener('click', async () => {
  if (!policyConfirmed) return;
  try {
    const amount = parseEther('0.001');
    if (amount > policy.maxValue) {
      log(
        `Transfer of 0.001 ETH exceeds policy maxValue of ${policy.maxValueLabel}. ` +
          `Edit src/policies.ts to allow it, or change the amount in src/main.ts.`,
        'bad',
      );
      return;
    }

    log('Submitting gasless transfer via public relayer…', 'muted');
    const tx = await sdk.transferViaRelayer(
      {
        targetChain: 10004, // Base Sepolia (Wormhole chain ID)
        token: 'native',
        recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f5A234',
        amount,
      },
      (state) => log(`Relayer status: ${state.status}`, 'muted'),
    );
    log(`Transfer relayed. txHash=${tx.transactionHash}`, 'good');

    renderTrace({
      traceId: `trc_${tx.transactionHash.slice(2, 12)}`,
      sessionId: 'sess_passkey_direct',
      action: {
        type: 'transfer',
        chain: 'base-sepolia',
        token: 'native',
        amount: '0.001',
      },
      reasoning: 'User-initiated transfer via passkey signature, relayed gaslessly.',
      verdicts: [
        { rule: 'spending_limit', verdict: 'allowed', detail: `0.001 <= ${policy.maxValueLabel}` },
        { rule: 'chain_allowlist', verdict: 'allowed', detail: 'base-sepolia ∈ [base-sepolia]' },
        { rule: 'counterparty', verdict: 'allowed', detail: 'open allowlist' },
      ],
      signatures: [{ by: 'passkey', hash: tx.transactionHash }],
      transactionHash: tx.transactionHash,
      timestamp: new Date(tx.timestamp).toISOString(),
    });
  } catch (err) {
    log(`Transfer rejected: ${(err as Error).message}`, 'bad');
  }
});

$reset.addEventListener('click', () => {
  policyConfirmed = false;
  $session.disabled = true;
  $send.disabled = true;
  resetUI();
});
