// Edit this file and re-run "Send" to see the policy verdict change.
//
// Try this: change maxValue to parseEther('0.0001'). The session will reject
// the 0.001 ETH transfer with a `spending_limit` verdict — that's bounded
// authority enforced cryptographically by the session key, not by a server.

import { parseEther } from 'ethers';

export const policy = {
  // How long the session key is valid for, in seconds.
  duration: 86_400, // 24 hours

  // Hard cap on a single transaction signed by this session.
  maxValue: parseEther('0.05'),

  // Human-readable label for the UI. Keep in sync with maxValue.
  maxValueLabel: '0.05 ETH',
} as const;
