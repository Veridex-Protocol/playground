// Tiny rendering helpers for the playground UI.
// Renders the activity log and the most recent signed trace.

type Tone = 'good' | 'bad' | 'muted' | undefined;

const $log = () => document.querySelector<HTMLPreElement>('#log')!;
const $trace = () => document.querySelector<HTMLPreElement>('#trace')!;

export function log(line: string, tone?: Tone) {
  const el = document.createElement('span');
  el.className = ['log-line', tone ? `log-${tone}` : ''].filter(Boolean).join(' ');
  el.textContent = `${new Date().toLocaleTimeString()}  ${line}`;
  $log().appendChild(el);
  $log().appendChild(document.createElement('br'));
  $log().scrollTop = $log().scrollHeight;
}

export interface Trace {
  traceId: string;
  sessionId: string;
  action: { type: string; chain: string; token: string; amount: string };
  reasoning: string;
  verdicts: { rule: string; verdict: string; detail: string }[];
  signatures: { by: string; hash: string }[];
  transactionHash?: string;
  timestamp: string;
}

export function renderTrace(trace: Trace) {
  $trace().textContent = JSON.stringify(trace, null, 2);
}

export function resetUI() {
  $log().innerHTML = '';
  $trace().textContent = 'No transfer yet.';
  log('Reset. Register a passkey to begin again.', 'muted');
}
