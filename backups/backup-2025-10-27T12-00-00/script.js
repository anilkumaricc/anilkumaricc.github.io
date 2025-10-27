// Series to Set Mapping
const seriesMap = {
  Series_A: Array.from({ length: 20 }, (_, i) => `Set${String(i + 1).padStart(3, '0')}`),
  Series_B: Array.from({ length: 20 }, (_, i) => `Set${String(i + 21).padStart(3, '0')}`),
  Series_C: Array.from({ length: 40 }, (_, i) => `Set${String(i + 41).padStart(3, '0')}`),
  Series_D: Array.from({ length: 25 }, (_, i) => `Set${String(i + 81).padStart(3, '0')}`),
  Series_E: Array.from({ length: 15 }, (_, i) => `Set${String(i + 106).padStart(3, '0')}`),
  Series_F: Array.from({ length: 35 }, (_, i) => `Set${String(i + 121).padStart(3, '0')}`),
  Series_G: Array.from({ length: 15 }, (_, i) => `Set${String(i + 156).padStart(3, '0')}`),
  Series_H: Array.from({ length: 20 }, (_, i) => `Set${String(i + 171).padStart(3, '0')}`),
  Series_I: Array.from({ length: 15 }, (_, i) => `Set${String(i + 191).padStart(3, '0')}`)
};

// Populate Set Dropdown on Series Change
document.getElementById('seriesSelect').addEventListener('change', function () {
  const selectedSeries = this.value;
  const setSelect = document.getElementById('setSelect');
  setSelect.innerHTML = '<option value="">-- Set चुनें --</option>';

  if (seriesMap[selectedSeries]) {
    seriesMap[selectedSeries].forEach(setCode => {
      const option = document.createElement('option');
      option.value = setCode;
      option.textContent = setCode;
      setSelect.appendChild(option);
    });
  }
});

// Start Quiz Button Logic
document.getElementById('startQuiz').addEventListener('click', function () {
  const name = document.getElementById('studentName').value.trim();
  const father = document.getElementById('fatherName').value.trim();
  const roll = document.getElementById('rollNo').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const series = document.getElementById('seriesSelect').value;
  const set = document.getElementById('setSelect').value;
  const hwDone = document.getElementById('hwDone').checked;

  // Reset previous error styles
  document.querySelectorAll('input, select').forEach(el => el.classList.remove('error'));

  const errors = [];

  // Name validation
  if (name.length < 5 || !/\s/.test(name)) {
    errors.push('नाम कम से कम 5 अक्षर का और स्पेस के साथ हो');
   // Live Preview Logic
  document.getElementById('studentName').addEventListener('input', function () {
  const val = this.value.trim();
  document.getElementById('namePreview').textContent = val ? `आपका नाम: ${val}` : '';
});

  }

  // Father's name validation
  if (father.length < 5 || !/\s/.test(father)) {
    errors.push('पिता का नाम कम से कम 5 अक्षर का और स्पेस के साथ हो');
    document.getElementById('fatherName').classList.add('error');
  }

  // Roll number validation
  const rollNum = parseInt(roll);
  if (!/^\d{3}$/.test(roll) || rollNum < 1 || rollNum > 250) {
    errors.push('रोल नंबर 001 से 250 के बीच 3 अंक का हो');
    document.getElementById('rollNo').classList.add('error');
  }

  // Mobile number validation
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    errors.push('मोबाइल 10 अंक का और 6-9 से शुरू हो');
    document.getElementById('mobile').classList.add('error');
  }

  // Series and Set validation
  if (!series) {
    errors.push('Series चुनें');
    document.getElementById('seriesSelect').classList.add('error');
  }

  if (!set) {
    errors.push('Set चुनें');
    document.getElementById('setSelect').classList.add('error');
  }

  // Show errors if any
  if (errors.length > 0) {
    alert('त्रुटियाँ:\n• ' + errors.join('\n• '));
    return;
  }

  // Generate unique student ID
  const nameId = name.replace(/\s+/g, '').slice(0, 3).toUpperCase();
  const fatherId = father.replace(/\s+/g, '').slice(0, 3).toUpperCase();
  const studentId = nameId + fatherId + roll;

  // Prevent duplicate quiz attempt
  const examKey = `${studentId}_${series}_${set}`;
  if (localStorage.getItem(examKey)) {
    alert('आप पहले ही यह क्विज़ दे चुके हैं!');
    return;
  }

  // Save student data
  const studentData = { name, father, roll, mobile, series, set, hwDone, studentId };
  localStorage.setItem('studentData', JSON.stringify(studentData));
  localStorage.setItem(examKey, 'completed');

  // Redirect to quiz page
  window.location.href = `quiz.html?set=${series}_${set}_WTCA.json`;
});