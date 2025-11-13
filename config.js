// FILE: config.js
// Place this file on your GitHub Pages repository (same domain where Quiz2026.html lives).
// This file exposes window.ADCA which other pages (quiz.html, review.html, dashboard.html, Quiz2026.html) will use.

// IMPORTANT:
// - ENDPOINT must be the deployed Apps Script web app URL (the /exec URL).
// - PRIMARY_KEY and ADMIN_KEY must match the values in backend.gs (server-side).
// - Do NOT put any SECRET on client-side in production. These keys are for convenience/admin pages only.

window.ADCA = {
  // Your deployed Google Apps Script Web App (use the /exec URL you provided)
  ENDPOINT: "https://script.google.com/macros/s/AKfycbxiQK2dwe-sAQLQZfyz8skiTmzaA6s_S9pDLJZPh75NhRg8zYnmCN9I1YkB5xejptjC/exec",

  // These must match backend SCRIPT_PROPS.PRIMARY_KEY & ADMIN_KEY
  // They are used by admin pages (dashboard/review) to request privileged endpoints.
  PRIMARY_KEY: "primary_Ea7f4c2b",
  ADMIN_KEY: "admin_Zk3q9p8X",

  // Optional flags (safe defaults)
  USE_SHEET_QUESTIONS: true,   // client can request /action=questions
  TOKEN_TTL_SEC: 600,          // token time-to-live in seconds
  DUP_WINDOW_MIN: 3            // duplicate attempt prevention window in minutes
};
