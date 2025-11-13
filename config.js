// FILE: config.js
// Put this file on your GitHub Pages repo (same domain as Quiz2026.html).
// Keep ENDPOINT, PRIMARY_KEY and ADMIN_KEY exactly as below.

window.ADCA = {
  // Your deployed Apps Script Web App (use the /exec URL)
  ENDPOINT: "https://script.google.com/macros/s/AKfycbxiQK2dwe-sAQLQZfyz8skiTmzaA6s_S9pDLJZPh75NhRg8zYnmCN9I1YkB5xejptjC/exec",

  // MUST match backend SCRIPT_PROPS.PRIMARY_KEY & ADMIN_KEY
  PRIMARY_KEY: "primary_Ea7f4c2b",
  ADMIN_KEY: "admin_Zk3q9p8X",

  // Optional client-side toggles (safe defaults)
  USE_SHEET_QUESTIONS: true,
  TOKEN_TTL_SEC: 600,
  DUP_WINDOW_MIN: 3
};

