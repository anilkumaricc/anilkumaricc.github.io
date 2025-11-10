// config.js  —  KEEP THIS FILE PURE JS (no <script> tags!)
window.ADCA = {
  // === Apps Script Web App Deployment URL (आपने जो latest दिया है) ===
  ENDPOINT: "https://script.google.com/macros/s/AKfycbyC_kGdWjTuMOm0-blHhqjyn4mq_iJKkhTYr6zMj_NMVQd0EZgcgfM2ztjNWCoRW3q2/exec",

  // === Public submit key (PRIMARY) — client में रहेगा ===
  PRIMARY_KEY: "primary_Ea7f4c2b",

  // === Optional UI flags ===
  REQUIRE_PASSWORD: true,
  REGISTRATION_PASSWORD: "ICC2026",

  // === Questions source (अभी Sheet API नहीं चाहिए तो false रखें) ===
  USE_SHEET_QUESTIONS: false,
  FALLBACK_BASE: "", // e.g., "https://<username>.github.io/<repo>/sets"

  // === Misc (UI hints only) ===
  QUESTION_TIME_SECONDS: 60,
  DUP_WINDOW_HINT_MIN: 3
};
