// Must match home_service_qa_demo/src/api/client.ts (TOKEN_KEY / USER_KEY).
// Used by global-setup.ts to seed localStorage directly instead of driving
// the login form for every authenticated test.
export const TOKEN_STORAGE_KEY = 'home-service-qa.token.v1';
export const USER_STORAGE_KEY = 'home-service-qa.user.v1';
