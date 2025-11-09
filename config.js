// config.js (pure JS; no <script> tags)
window.ADCA = {
  // === Apps Script Web App Deployment URL (BOUND project) ===
  ENDPOINT: "https://script.google.com/macros/s/AKfycbxqn_SJ6bEU1n2wHwfyWQ8a2WFKEU1Kb_yRycoU-nzOfKyOktxIKTY11DTkEGBiRBqq/exec",

  // === Public submit key (PRIMARY) — client-side is okay ===
  PRIMARY_KEY: "primary_Ea7f4c2b",

  // === Questions source flags ===
  USE_SHEET_QUESTIONS: false,   // (we’ll turn on later when questions API is ready)
  FALLBACK_BASE: "",            // e.g. "https://<username>.github.io/<repo>/sets"

  // === Misc UI config ===
  REQUIRE_PASSWORD: true,
  REGISTRATION_PASSWORD: "ICC2026",
  QUESTION_TIME_SECONDS: 60,
  DUP_WINDOW_HINT_MIN: 3
};
