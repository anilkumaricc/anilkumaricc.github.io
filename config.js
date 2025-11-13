// FILE: config.js  -- single source of truth for client (non-sensitive)
window.ADCA = {
  ENDPOINT: "https://script.google.com/macros/s/AKfycbyC_kGdWjTuMOm0-blHhqjyn4mq_iJKkhTYr6zMj_NMVQd0EZgcgfM2ztjNWCoRW3q2/exec",
  PRIMARY_KEY: "primary_Ea7f4c2b",     // note underscore to match backend
  ADMIN_KEY:   "admin_Zk3q9p8X",
  USE_SHEET_QUESTIONS: true,
  JSON_PATHS: {
    MAIN: (series, setNo) => `sets/Series_${series}_Set${String(setNo).padStart(3,"0")}.json`,
    HW:   (series, setNo) => `hw/HW_Series_${series}_Set${String(setNo).padStart(3,"0")}.json`,
    CW:   (series, setNo) => `hw/CW_Series_${series}_Set${String(setNo).padStart(3,"0")}.json`
  },
  TOKEN_TTL_SEC: 600,
  DUP_WINDOW_MIN: 3
};
