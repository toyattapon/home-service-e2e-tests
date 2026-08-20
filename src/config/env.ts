import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env first.`,
    );
  }
  return value;
}

const apiBaseUrl = required('API_BASE_URL', 'http://localhost:4000/api');

export const env = {
  webBaseUrl: required('WEB_BASE_URL', 'http://localhost:5173'),
  apiBaseUrl,
  // Playwright's APIRequestContext resolves a leading-slash path against
  // baseURL using WHATWG URL rules, which DROP any path segment already in
  // baseURL (e.g. `/auth/login` + "http://host/api" -> "http://host/auth/login",
  // silently losing "/api"). Request contexts are built from `apiOrigin`
  // (origin only) and every ApiClient call path spells out the full
  // "/api/..." prefix itself, so there is nothing implicit left to get wrong.
  apiOrigin: new URL(apiBaseUrl).origin,
  sutDir: process.env.SUT_DIR ?? '',
  admin: {
    email: required('ADMIN_EMAIL', 'admin@demo.com'),
    password: required('ADMIN_PASSWORD', 'password123'),
  },
  technician: {
    email: required('TECH_EMAIL', 'tech@demo.com'),
    password: required('TECH_PASSWORD', 'password123'),
  },
};
