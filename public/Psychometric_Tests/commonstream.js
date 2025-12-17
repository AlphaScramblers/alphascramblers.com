/* =====================================================
   AUTO CHECK: TEST ALREADY GIVEN (WITH LOADER + RETAKE)
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const loader = document.getElementById("pageLoader");
  const testUI = document.getElementById("testContainer");

  const stream = document.body.dataset.stream;
  const testId = document.body.dataset.testId;
  const token = localStorage.getItem("token");

  if (!loader || !testUI) return;

  // Default: hide test, show loader
  loader.style.display = "flex";
  testUI.style.display = "none";

  // Allow retake explicitly
  const isRetake = new URLSearchParams(window.location.search).get("retake");
  if (isRetake === "true") {
    loader.style.display = "none";
    testUI.style.display = "block";
    return;
  }

  if (!stream || !testId) {
    loader.style.display = "none";
    testUI.style.display = "block";
    return;
  }

  if (!token) {
    alert("Please login first");
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch(`/api/stream-report?testId=${testId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    // ✅ Already given → go to report
    if (data.success) {
      window.location.href =
        `/Psychometric_Tests/stream-report.html?testId=${testId}`;
      return;
    }

    // ❌ Not given → show test
    loader.style.display = "none";
    testUI.style.display = "block";

  } catch (err) {
    console.error("Test check failed:", err);
    loader.style.display = "none";
    testUI.style.display = "block";
  }
});


/* =====================================================
   QUESTION FLOW + SUBMISSION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const submission = document.querySelector(".subbtn1");
  const nextBtn = document.querySelector(".sbt");

  const stream = document.body.dataset.stream;
  const testId = document.body.dataset.testId;

  if (!submission || !stream || !testId) return;

  const questions = document.querySelectorAll(".question");
  const submitHidden = document.querySelector(".subbtn");
  const progressBar = document.querySelector(".ipbar");
  const qh = document.querySelector(".qh");
  const section = document.querySelector(".section");
  const pcalvalue = document.querySelector(".pcalvalue");

  let currentIndex = 0;

  function showQuestion(index) {
    questions.forEach((q, i) => q.classList.toggle("active", i === index));
  }

  function updateHeader(index) {
    if (index < 10) {
      section.innerText = "Aptitude";
      qh.innerText = `Question ${index + 1} of 10`;
    } else if (index < 20) {
      section.innerText = "Behaviour";
      qh.innerText = `Question ${index - 9} of 10`;
    } else {
      section.innerText = "Mental & Psychology";
      qh.innerText = `Question ${index - 19} of 10`;
    }
  }

  nextBtn.addEventListener("click", () => {
    const selected = questions[currentIndex]
      .querySelector("input[type='radio']:checked");

    if (!selected) {
      alert("Please select an option before continuing!");
      return;
    }

    currentIndex++;

    const progress = (currentIndex / questions.length) * 100;
    progressBar.style.width = progress + "%";
    pcalvalue.innerText = `${Math.round(progress)}%`;

    if (currentIndex < questions.length) {
      showQuestion(currentIndex);
      updateHeader(currentIndex);
    } else {
      currentIndex--;
      nextBtn.style.display = "none";
      submitHidden.style.display = "none";
      submission.style.display = "flex";
    }
  });

  showQuestion(currentIndex);
  updateHeader(currentIndex);

  /* ================= SUBMIT TEST ================= */

  submission.addEventListener("click", async (e) => {
    e.preventDefault();

    let aptitudeScore = 0;
    let behaviorScore = 0;
    let mentalScore = 0;

    document.querySelectorAll(".Aptitude .question input:checked")
      .forEach(i => aptitudeScore += Number(i.value));

    document.querySelectorAll(".behaviour .question input:checked")
      .forEach(i => behaviorScore += Number(i.value));

    document.querySelectorAll(".mental .question input:checked")
      .forEach(i => mentalScore += Number(i.value));

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/stream-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stream,
          testId,
          scores: [
            { section: "aptitude", score: aptitudeScore },
            { section: "behavior", score: behaviorScore },
            { section: "mental", score: mentalScore }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Failed to submit test");
        return;
      }

      window.location.href =
        `/Psychometric_Tests/stream-report.html?testId=${testId}`;

    } catch (err) {
      alert("Network error. Please try again.");
    }
  });

});