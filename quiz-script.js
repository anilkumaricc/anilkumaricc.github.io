let questions = [], current = 0, timer = 60, interval, totalTime = 0;
let userAnswers = [], score = 0, allHomework = [];
let prevQ = null, prevUser = null, prevCorrect = null, prevExp = null;

// Global sheet endpoint used for history/checks and posting results
const sheetURL = "https://script.google.com/macros/s/AKfycbx4WuvzB7R3m8RCbiKZwGNm4g713baJuprDFKfWt__m8RyA9x9rjyJPzfTp5sC6qSm2zQ/exec";

// Build identifier in the new format: {SeriesLetter}{SetNumber}{RollNumber} e.g. A001085
function makeIdentifier(series, set, roll) {
  // series: 'Series_A' or 'A'
  // set: 'Set001' or filename 'Series_A_Set001_WTCA.json'
  let seriesLetter = '';
  if (typeof series === 'string') {
    const m = series.match(/Series_([A-Z])/) || series.match(/^([A-Z])$/);
    if (m) seriesLetter = m[1];
  }
  // fallback: try to extract from set filename
  if (!seriesLetter && typeof set === 'string') {
    const m2 = set.match(/Series_([A-Z])/);
    if (m2) seriesLetter = m2[1];
  }
  seriesLetter = (seriesLetter || '').toUpperCase();

  // extract set number (three digits)
  let setNumber = '000';
  if (typeof set === 'string') {
    const ms = set.match(/Set(\d{3})/);
    if (ms) setNumber = ms[1];
  }
  // fallback: maybe series string contains set
  if (setNumber === '000' && typeof series === 'string') {
    const ms2 = series.match(/Set(\d{3})/);
    if (ms2) setNumber = ms2[1];
  }

  const rollNumber = String(roll || '').padStart(3, '0');
  return (seriesLetter + setNumber + rollNumber).toUpperCase();
}

document.addEventListener('DOMContentLoaded', function() {
  loadJSON();
  document.getElementById("skipBtn").onclick = skipQuestion;
  document.getElementById("addTime").onclick = addExtraTime;
  document.getElementById("nextBtn").onclick = nextQuestion;
});

// Check if student has already taken this quiz
async function checkPreviousAttempt(series, set, roll) {
  try {
    const identifier = makeIdentifier(series, set, roll);
    const url = `${sheetURL}?id=${identifier}`;
    console.log("checkPreviousAttempt: identifier=", identifier, "url=", url);
    const response = await fetch(url);
    if (!response.ok) {
      const txt = await response.text().catch(() => '<<no body>>');
      console.warn(`checkPreviousAttempt: non-OK response ${response.status} -> ${txt}`);
      return { exists: false };
    }
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const txt = await response.text().catch(() => '<<invalid json>>');
      console.warn("checkPreviousAttempt: invalid JSON response:", txt);
      return { exists: false };
    }
    
    if (Array.isArray(data) && data.length > 0) {
      const latestAttempt = data[data.length - 1]; // Get most recent attempt
      const attemptDate = new Date(latestAttempt[0]).toLocaleDateString();
      const score = latestAttempt[7]; // score column
      const total = latestAttempt[8]; // total column
      return {
        exists: true,
        message: `आपने यह प्रश्न सेट पहले ही ${attemptDate} को हल कर लिया है। स्कोर: ${score}/${total}`
      };
    }
    return { exists: false };
  } catch (err) {
    console.error("Check attempt error:", err);
    return { exists: false }; // Proceed even if check fails
  }
}

function loadJSON() {
  const file = new URLSearchParams(window.location.search).get("set");
  if (!file) return alert("Set file missing!");
  
  // Get student data
  const s = JSON.parse(localStorage.getItem('studentData') || '{}');
  if (!s.roll || !s.series || !file) {
    return alert("सभी जानकारी भरें (रोल नंबर, सीरीज़, और सेट)");
  }

  // First check if already attempted
  checkPreviousAttempt(s.series, file, s.roll).then(result => {
    if (result.exists) {
      if (!confirm(result.message + "\n\nक्या आप फिर से हल करना चाहते हैं?")) {
        window.location.href = "index.html";
        return;
      }
    }
    // Continue with quiz if new attempt or user confirms retry
    loadQuizFiles(file);
  });
}

function loadQuizFiles(file) {
  console.log("loadQuizFiles called with file:", file);

  const match = (file || '').match(/(Series_[A-Z])_Set(\d{3})_WTCA\.json/);
  if (!match) {
    const msg = `Invalid file name or missing 'set' parameter: ${file}`;
    console.error(msg);
    return document.body.innerHTML = `<h2 style="color:red">${msg}</h2>`;
  }

  const series = match[1], setNum = match[2];
  const quizPath = `sets/${file}`;
  const hwPath = `hw/${series}_Set${setNum}_HW.json`;
  console.log("Attempting to fetch quizPath:", quizPath, "hwPath:", hwPath);

  fetch(quizPath)
    .then(async r => {
      if (!r.ok) {
        const txt = await r.text().catch(() => '<<no body>>');
        return Promise.reject(`Quiz fetch failed: ${quizPath} (status ${r.status}) -> ${txt}`);
      }
      try {
        return r.json();
      } catch (e) {
        const txt = await r.text().catch(() => '<<invalid json>>');
        return Promise.reject(`Quiz JSON parse error for ${quizPath}: ${txt}`);
      }
    })
    .then(data => {
      questions = data;
      document.getElementById("totalQuestions").textContent = questions.length;
      return fetch(hwPath).then(async r => {
        if (!r.ok) return ["No HW"];
        try { return r.json(); } catch { return ["No HW"]; }
      });
    })
    .then(hw => {
      allHomework = Array.isArray(hw) ? hw : [hw];
      startQuiz();
    })
    .catch(err => {
      console.error(err);
      document.body.innerHTML = `<h2 style="color:red">${String(err)}</h2>`;
    });
}

function startQuiz() {
  showQuestion();
  interval = setInterval(() => {
    timer--; totalTime++;
    document.getElementById("timeLeft").textContent = `00:${String(timer).padStart(2,'0')}`;
    document.getElementById("totalTime").textContent = `00:${String(totalTime).padStart(2,'0')}`;
    if (timer <= 0) nextQuestion();
  }, 1000);
}

function showQuestion() {
  console.log("showQuestion() called. current:", current, "questions.length:", questions.length);
  if (!Array.isArray(questions) || questions.length === 0) {
    const msg = "कोई प्रश्न उपलब्ध नहीं हैं (questions array खाली है)";
    console.error(msg, { questions });
    document.getElementById("questionArea").innerHTML = `<p style=\"color:red;\">${msg}</p>`;
    document.getElementById("optionsArea").innerHTML = '';
    return;
  }

  if (current >= questions.length) return showSummary();

  const q = questions[current];
  console.log("Rendering question:", q);
  document.getElementById("questionNumber").textContent = current + 1;
  document.getElementById("questionArea").innerHTML = `<p><strong>${q.question}</strong></p>`;

  const opts = document.getElementById("optionsArea");
  opts.innerHTML = "";
  if (!q || !Array.isArray(q.options) || q.options.length === 0) {
    const msg = "प्रश्न में विकल्प उपलब्ध नहीं हैं। JSON में 'options' फील्ड चेक करें।";
    console.error(msg, { q });
    opts.innerHTML = `<p style=\"color:red;\">${msg}</p>`;
  } else {
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.onclick = () => selectOption(i);
      opts.appendChild(btn);
    });
  }

  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("skipBtn").style.display = "inline-block";
  document.getElementById("answerDisplay").style.display = "none";

  if (current > 0 && prevQ) {
    document.getElementById("previousQ").style.display = "block";
    document.getElementById("previousQuestion").textContent = prevQ;
    document.getElementById("previousUserAnswer").innerHTML = `<strong>आपका:</strong> ${prevUser}`;
    document.getElementById("previousCorrectAnswer").innerHTML = `<strong>सही:</strong> ${prevCorrect}`;
    document.getElementById("previousExplanation").innerHTML = `<strong>विवरण:</strong> ${prevExp}`;
  } else {
    document.getElementById("previousQ").style.display = "none";
  }

  const hwList = document.getElementById("homeworkList");
  hwList.innerHTML = allHomework.map(hw => `<li>${hw}</li>`).join('');
  document.getElementById("homeworkBox").style.display = "block";

  timer = 60;
}

function selectOption(i) {
  userAnswers[current] = i;
  const q = questions[current];
  const correct = q.answer[0];
  const isCorrect = i === correct;

  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
  document.querySelectorAll('.option-btn')[i].classList.add(isCorrect ? 'correct' : 'incorrect');
  if (!isCorrect) document.querySelectorAll('.option-btn')[correct].classList.add('correct');

  if (isCorrect) score++;

  document.getElementById("userAnswer").innerHTML = `<strong>आपका उत्तर:</strong> ${q.options[i]}`;
  document.getElementById("correctAnswer").innerHTML = `<strong>सही उत्तर:</strong> ${q.options[correct]}`;
  document.getElementById("explanationText").innerHTML = `<strong>विवरण:</strong> ${q.explanation || 'N/A'}`;
  document.getElementById("answerDisplay").style.display = "block";

  document.getElementById("nextBtn").style.display = "inline-block";
  document.getElementById("skipBtn").style.display = "none";

  prevQ = q.question;
  prevUser = q.options[i];
  prevCorrect = q.options[correct];
  prevExp = q.explanation || 'N/A';
}

function skipQuestion() {
  userAnswers[current] = null;
  const q = questions[current];
  prevQ = q.question;
  prevUser = "(Skipped)";
  prevCorrect = q.options[q.answer[0]];
  prevExp = q.explanation || 'N/A';
  current++;
  showQuestion();
}

function nextQuestion() {
  current++;
  showQuestion();
}

function addExtraTime() {
  timer += 60;
}

function showSummary() {
  clearInterval(interval);
  document.getElementById("mainPanel").style.display = "none";
  document.getElementById("summaryPanel").style.display = "block";

  const s = JSON.parse(localStorage.getItem('studentData') || '{}');
  const studentId = makeIdentifier(s.series, s.set, s.roll);

  let finalScore = score;
  if (!s.hwDone) finalScore -= 10;
  if (finalScore < 0) finalScore = 0;

  const pct = questions.length ? ((finalScore / questions.length) * 100).toFixed(2) : 0;
  document.getElementById("scoreDisplay").textContent = finalScore;
  document.getElementById("totalQs").textContent = questions.length;
  document.getElementById("percentageDisplay").textContent = pct;

  document.getElementById("infoName").textContent = s.name;
  document.getElementById("infoFather").textContent = s.father;
  document.getElementById("infoRoll").textContent = s.roll;
  document.getElementById("infoSeries").textContent = s.series.replace('Series_', '');
  document.getElementById("infoSet").textContent = s.set;
  document.getElementById("infoHW").textContent = s.hwDone ? "Yes" : "No";

  document.getElementById("summaryName").textContent = s.name;
  document.getElementById("summaryFather").textContent = s.father;
  document.getElementById("summaryRoll").textContent = s.roll;
  document.getElementById("summaryMobile").textContent = s.mobile;
  document.getElementById("summarySeries").textContent = s.series.replace('Series_', '');
  document.getElementById("summarySet").textContent = s.set;

  const review = document.getElementById("review");
  review.innerHTML = "";
  questions.forEach((q, i) => {
    const user = userAnswers[i] !== null ? (userAnswers[i] !== undefined ? q.options[userAnswers[i]] : "(Skipped)") : "(Skipped)";
    const correct = q.options[q.answer[0]];
    const correctCls = userAnswers[i] === q.answer[0] ? 'correct' : 'incorrect';
    review.innerHTML += `
      <div class="review-item ${correctCls}">
        <div class="review-question"><strong>Q${i+1}:</strong> ${q.question}</div>
        <div class="review-answers">
          <span class="correct-answer"><strong>सही:</strong> ${correct}</span>
          <span class="user-answer"><strong>आपका:</strong> ${user}</span>
        </div>
        <div class="review-explanation"><strong>विवरण:</strong> ${q.explanation || 'N/A'}</div>
      </div>`;
  });

  document.getElementById("allHomeworkList").innerHTML = allHomework.map(hw => `<li>${hw}</li>`).join('');

  // Send to Google Sheet
  console.log("Sending data to sheet:", studentId);
  const postData = {
    name: s.name,
    father: s.father,
    roll: s.roll,
    mobile: s.mobile,
    series: s.series.replace('Series_', ''),
    set: s.set,
    score: finalScore,
    total: questions.length,
    percentage: pct,
    hwDone: s.hwDone,
    identifier: studentId
  };
  console.log("Sending data:", postData);

  const formBody = new URLSearchParams();
  Object.keys(postData).forEach(k => {
    formBody.append(k, postData[k] == null ? '' : String(postData[k]));
  });

  fetch(sheetURL, {
    method: "POST",
    body: formBody
  })
  .then(response => {
    console.log("Response status:", response.status, response.type);
    return response.text();
  })
  .then(text => {
    try {
      const result = JSON.parse(text);
      console.log("Sheet response:", result);
      if (result.status === "success") {
        alert("✅ आपका परिणाम सफलतापूर्वक Google Sheet में सुरक्षित हो गया है!");
      } else {
        alert("⚠️ परिणाम सुरक्षित नहीं हो पाया: " + (result.message || text));
      }
    } catch (err) {
      console.log("Non-JSON response from sheet:", text);
      alert("⚠️ सर्वर से अप्रत्याशित प्रतिक्रिया मिली: देखिए कंसोल");
    }
  })
  .catch(error => {
    console.error("Google Sheet भेजने में त्रुटि:", error);
    alert("⚠️ डेटा भेजने में समस्या: " + (error && error.message ? error.message : error));
  });

  // ✅ Fetch past quiz history by Roll
  const rollParam = String(s.roll).padStart(3, '0');
  const historyURL = `${sheetURL}?roll=${rollParam}`;
  fetch(historyURL)
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById("studentHistory");
      if (data.length === 0) {
        container.innerHTML = "<p style='color:red;'>कोई पुराना रिकॉर्ड नहीं मिला!</p>";
        return;
      }

      let html = `<div class="history-panel">
        <h3>📘 पिछले क्विज़ का प्रदर्शन (Roll: ${rollParam})</h3>
        <table class="series-table">
          <thead><tr><th>📅 Date</th><th>📚 Series</th><th>🧩 Set</th><th>🎯 Score</th><th>%</th><th>HW</th></tr></thead>
          <tbody>`;
      data.forEach(row => {
        html += `<tr>
          <td>${new Date(row[0]).toLocaleDateString()}</td>
          <td>${row[5]}</td>
          <td>${row[6]}</td>
          <td>${row[7]}</td>
          <td>${row[9]}%</td>
          <td>${row[10]}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      container.innerHTML = html;
    })
    .catch(() => {
      document.getElementById("studentHistory").innerHTML = "<p style='color:red;'>डेटा लोड करने में त्रुटि!</p>";
    });
}
