import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.join(__dirname, '..', 'enterprise_demo', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.slice(0, index).trim();
        const val = trimmed.slice(index + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in the environment.");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:streamGenerateContent?key=${apiKey}&alt=sse`;

async function main() {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Query our treasury balance for USDC.' }]
      }
    ],
    tools: [
      {
        functionDeclarations: [
          {
            name: 'treasury_balance',
            description: 'Queries treasury balance for a given asset.',
            parameters: {
              type: 'object',
              properties: {
                currency: { type: 'string', description: 'The currency code (e.g. USDC, ETH).' }
              },
              required: ['currency']
            }
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log("HTTP Status:", res.status);
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.trim()) {
          console.log("LINE:", line);
        }
      }
    }
    if (buffer.trim()) {
      console.log("REMAINING:", buffer);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

main();
