// config.js
window.ADCA = {
  ENDPOINT: "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxx/exec",
  PRIMARYKEY: "primaryEa7f4c2b",
  ADMINKEY: "admin83c1d",
  USE_SHEET_QUESTIONS: true,    // true => Sheet API, false => JSON files
  JSON_PATHS: {
    MAIN: (series, set) => `sets/Series_${series}_Set${String(set).padStart(3,"0")}.json`,
    HW:   (series, set) => `hw/HW_Series_${series}_Set${String(set).padStart(3,"0")}.json`,
    CW:   (series, set) => `hw/CW_Series_${series}_Set${String(set).padStart(3,"0")}.json`
  },
  TOKEN_TTL_SEC: 600,
  DUP_WINDOW_MIN: 3
};
