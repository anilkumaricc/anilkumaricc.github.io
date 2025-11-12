// config.js
window.ADCA = {
  // Set your /exec Web App URL here
  ENDPOINT: "https://script.google.com/macros/s/AKfycbyC_kGdWjTuMOm0-blHhqjyn4mq_iJKkhTYr6zMj_NMVQd0EZgcgfM2ztjNWCoRW3q2/exec",
  PRIMARYKEY: "primaryEa7f4c2b",
  ADMINKEY: "admin83c1d",

  // Question source: true => Sheet API; false => JSON files (fallback)
  USE_SHEET_QUESTIONS: true,

  // Local JSON fallback paths
  JSON_PATHS: {
    MAIN: (series, set) => `sets/Series_${series}_Set${String(set).padStart(3,"0")}.json`,
    HW:   (series, set) => `hw/HW_Series_${series}_Set${String(set).padStart(3,"0")}.json`,
    CW:   (series, set) => `hw/CW_Series_${series}_Set${String(set).padStart(3,"0")}.json`
  },

  // Token + duplicate window
  TOKEN_TTL_SEC: 600,
  DUP_WINDOW_MIN: 3
};
