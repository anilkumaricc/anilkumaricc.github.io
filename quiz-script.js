let questions = [], current = 0, timer = 60, interval, totalTime = 0;
let userAnswers = [], score = 0, allHomework = [];
let prevQ = null, prevUser = null, prevCorrect = null, prevExp = null;

document.addEventListener('DOMContentLoaded', function() {
  loadJSON();
  document.getElementById("skipBtn").onclick = skipQuestion;
  document.getElementById("addTime").onclick = addExtraTime;
  document.getElementById("nextBtn").onclick = nextQuestion;
});

function loadJSON() {
  const file = new URLSearchParams(window.location.search).get("set");
  if (!file) return alert("Set file missing!");

  const match = file.match(/(Series_[A-Z])_Set(\d{3})_WTCA\.json/);
  if (!match) return alert("Invalid file name!");

  const series = match[1], setNum = match[2];
  const quizPath = `sets/${file}`;
  const hwPath = `hw/${series}_Set${setNum}_HW.json`;

  fetch(quizPath)
    .then(r => r.ok ? r.json() : Promise.reject("Quiz not found"))
    .then(data => {
      questions = data;
      document.getElementById("totalQuestions").textContent = questions.length;
      return fetch(hwPath).then(r => r.ok ? r.json() : ["No HW"]);
    })
    .then(hw => {
      allHomework = Array.isArray(hw) ? hw : [hw];
      startQuiz();
    })
    .catch(err => document.body.innerHTML = `<h2 style="color:red">${err}</h2>`);
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
  if (current >= questions.length) return showSummary();

  const q = questions[current];
  document.getElementById("questionNumber").textContent = current + 1;
  document.getElementById("questionArea").innerHTML = `<p><strong>${q.question}</strong></p>`;

  const opts = document.getElementById("optionsArea");
  opts.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => selectOption(i);
    opts.appendChild(btn);
  });

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
  const studentId = (s.name.split(" ")[0] + s.father.split(" ")[0] + s.roll).toLowerCase();

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
  const sheetURL = "https://script.google.com/macros/s/AKfycby2ElAenHy59_M3EhRQx0Mf5mijglA-u1bgJhWyDBN2NOXicUpmR3K0C6ZkqWvfQoPIjA/exec";
  fetch(sheetURL, {
    method: "POST",
    body: JSON.stringify({
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
    }),
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(result => {
    if (result.status === "success") {
      alert("✅ आपका परिणाम सफलतापूर्वक Google Sheet में सुरक्षित हो गया है!");
    } else {
      alert("⚠️ परिणाम सुरक्षित नहीं हो पाया: " + result.message);
    }
  })
  .catch(error => {
    console.error("Google Sheet भेजने में त्रुटि:", error);
  });

  // Fetch past quiz history
  const historyURL = `https://script.google.com/macros/s/AKfycby2ElAenHy59_M3EhRQx0Mf5mijglA-u1bgJhWyDBN2NOXicUpmR3K0C6ZkqWvfQoPIjA/exec?id=${studentId}`;
  fetch(historyURL)
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById("studentHistory");
      if (data.length === 0) {
        container.innerHTML = "<p style='color:red;'>कोई पुराना रिकॉर्ड नहीं मिला!</p>";
        return;
      }

      let html = `<div class="history-panel">
        <h3>📘 पिछले क्विज़ का प्रदर्शन</h3>
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
