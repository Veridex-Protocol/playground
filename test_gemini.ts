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

console.log("Using API Key:", apiKey.slice(0, 10) + "..." + apiKey.slice(-5));

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

async function main() {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Hello, what is your model name?' }]
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
    const json = await res.json();
    console.log("JSON Response:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

main();
