import * as fs from 'fs';
import * as path from 'path';
import { GeminiProvider } from '../packages/agents/src/models/GeminiProvider';

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

async function main() {
  const provider = new GeminiProvider({
    apiKey,
    model: 'gemini-3-flash-preview',
  });

  const messages = [
    { role: 'user' as const, content: 'Query our treasury balance for USDC.' }
  ];

  const tools = [
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
  ];

  console.log("Starting streaming complete request...");
  try {
    const res = await provider.complete(messages, {
      tools,
      onToken: (token) => {
        console.log("STREAMED TOKEN:", JSON.stringify(token));
      }
    });

    console.log("\nFinal ModelResponse:");
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Complete Error:", err);
  }
}

main();
