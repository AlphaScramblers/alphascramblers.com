// document.addEventListener("DOMContentLoaded", () => {

//   const submission = document.querySelector(".subbtn1");
//   if (!submission) return;

//   const stream = document.body.dataset.stream;
//   if (!stream) {
//     console.error("Stream not defined on body tag");
//     return;
//   }

//   submission.addEventListener("click", (e) => {
//     e.preventDefault();

//     let aptitudeScore = 0;
//     let behaviorScore = 0;
//     let mentalScore = 0;

//     document.querySelectorAll(".Aptitude .question").forEach(q => {
//       const selected = q.querySelector("input:checked");
//       if (selected) aptitudeScore += Number(selected.value);
//     });

//     document.querySelectorAll(".behaviour .question").forEach(q => {
//       const selected = q.querySelector("input:checked");
//       if (selected) behaviorScore += Number(selected.value);
//     });

//     document.querySelectorAll(".mental .question").forEach(q => {
//       const selected = q.querySelector("input:checked");
//       if (selected) mentalScore += Number(selected.value);
//     });

//     const totalScore = aptitudeScore + behaviorScore + mentalScore;

//     // 🔐 Store using stream prefix
//     localStorage.setItem(`${stream}AptitudeScore`, aptitudeScore);
//     localStorage.setItem(`${stream}BehaviorScore`, behaviorScore);
//     localStorage.setItem(`${stream}MentalScore`, mentalScore);
//     localStorage.setItem(`${stream}TotalScore`, totalScore);

//     window.location.href = `${stream}streamreport.html`;
//   });

// });

// const question = document.querySelectorAll(".question");
// const submit = document.querySelector(".sbt");
// const submit0 = document.querySelector(".subbtn");
// const submit1 = document.querySelector(".subbtn1");
// const bar = document.querySelector(".ipbar");
// const qh = document.querySelector(".qh");
// const section = document.querySelector(".section");
// let pcalvalue = document.querySelector(".pcalvalue");
// let currentIndex = 0;

// function showQuestion(index){
//     question.forEach((q,i)=>{
//         q.classList.toggle("active",i===index);
//     })
// }

// submit.addEventListener("click",()=>{
//     const currentQuestion = question[currentIndex];
//     const selected = currentQuestion.querySelector("input[type='radio']:checked");

//     if(!selected){
//         alert("Please select any option before continuing!!");
//         return;
//     }

//     currentIndex++;
//     const progress = (currentIndex/question.length)*100;
//     bar.style.width= progress + "%";
//     pcalvalue.innerHTML=`${Math.round(progress)}%`
//     if(currentIndex<question.length){
//         showQuestion(currentIndex);
//     }
//     else{
//         currentIndex-=1
//         submit.style.display="none"
//         submit0.style.display="none"
//         submit1.style.display="flex"
//     }
//     for(let i=0;i<10;i++){
//         if(currentIndex<=10){
//             qh.innerHTML=`Question ${currentIndex+1} of 10`;
//         }
//         if(currentIndex>=10 && currentIndex<=20){
//             qh.innerHTML=`Question ${currentIndex-9} of 10`;  
//             section.innerHTML="Behaviour" 
//         }
//         if(currentIndex>=20 && currentIndex<=30){
//             qh.innerHTML=`Question ${currentIndex-19} of 10`;
//             section.innerHTML="Mental & Psychology" 
//         }
//     }
//     if(progress==100){
//         bar.style.borderRadius = "10px"
//     }
// })
// showQuestion(currentIndex);
// document.addEventListener("DOMContentLoaded", () => {

//   /* =======================
//      STREAM + TEST METADATA
//   ======================== */

//   const submission = document.querySelector(".subbtn1");
//   const stream = document.body.dataset.stream;
//   const testId = document.body.dataset.testId;

//   if (!submission || !stream || !testId) {
//     console.error("Missing submission button / stream / testId");
//     return;
//   }

//   /* =======================
//      QUESTION FLOW LOGIC
//   ======================== */

//   const questions = document.querySelectorAll(".question");
//   const nextBtn = document.querySelector(".sbt");
//   const submitHidden = document.querySelector(".subbtn");
//   const progressBar = document.querySelector(".ipbar");
//   const qh = document.querySelector(".qh");
//   const section = document.querySelector(".section");
//   const pcalvalue = document.querySelector(".pcalvalue");

//   let currentIndex = 0;

//   function showQuestion(index) {
//     questions.forEach((q, i) => {
//       q.classList.toggle("active", i === index);
//     });
//   }

//   function updateHeader(index) {
//     if (index < 10) {
//       section.innerText = "Aptitude";
//       qh.innerText = `Question ${index + 1} of 10`;
//     } 
//     else if (index < 20) {
//       section.innerText = "Behaviour";
//       qh.innerText = `Question ${index - 9} of 10`;
//     } 
//     else {
//       section.innerText = "Mental & Psychology";
//       qh.innerText = `Question ${index - 19} of 10`;
//     }
//   }

//   nextBtn.addEventListener("click", () => {
//     const currentQuestion = questions[currentIndex];
//     const selected = currentQuestion.querySelector("input[type='radio']:checked");

//     if (!selected) {
//       alert("Please select an option before continuing!");
//       return;
//     }

//     currentIndex++;

//     const progress = (currentIndex / questions.length) * 100;
//     progressBar.style.width = progress + "%";
//     pcalvalue.innerText = `${Math.round(progress)}%`;

//     if (currentIndex < questions.length) {
//       showQuestion(currentIndex);
//       updateHeader(currentIndex);
//     } else {
//       currentIndex--;
//       nextBtn.style.display = "none";
//       submitHidden.style.display = "none";
//       submission.style.display = "flex";
//     }

//     if (progress === 100) {
//       progressBar.style.borderRadius = "10px";
//     }
//   });

//   showQuestion(currentIndex);
//   updateHeader(currentIndex);

//   /* =======================
//      SUBMIT + SAVE REPORT
//   ======================== */

//   submission.addEventListener("click", async (e) => {
//     e.preventDefault();

//     let aptitudeScore = 0;
//     let behaviorScore = 0;
//     let mentalScore = 0;

//     document.querySelectorAll(".Aptitude .question").forEach(q => {
//       const s = q.querySelector("input:checked");
//       if (s) aptitudeScore += Number(s.value);
//     });

//     document.querySelectorAll(".behaviour .question").forEach(q => {
//       const s = q.querySelector("input:checked");
//       if (s) behaviorScore += Number(s.value);
//     });

//     document.querySelectorAll(".mental .question").forEach(q => {
//       const s = q.querySelector("input:checked");
//       if (s) mentalScore += Number(s.value);
//     });

//     const totalScore = aptitudeScore + behaviorScore + mentalScore;

//     // Optional fallback (can remove later)
//     localStorage.setItem(`${stream}_${testId}_totalScore`, totalScore);

//     try {
//       await fetch("/api/save-stream-report", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${localStorage.getItem("token")}`
//         },
//         body: JSON.stringify({
//           stream,
//           testId,
//           aptitudeScore,
//           behaviorScore,
//           mentalScore,
//           totalScore
//         })
//       });
//     } catch (err) {
//       console.error("Failed to save report, continuing anyway");
//     }

//     window.location.href = `${stream}streamreport.html?testId=${testId}`;
//   });

// });
document.addEventListener("DOMContentLoaded", () => {

  /* =======================
     STREAM + TEST METADATA
  ======================== */

  const submission = document.querySelector(".subbtn1");
  const stream = document.body.dataset.stream;
  const testId = document.body.dataset.testId;

  if (!submission || !stream || !testId) {
    console.error("Missing submission button / stream / testId");
    return;
  }

  /* =======================
     QUESTION FLOW LOGIC
  ======================== */

  const questions = document.querySelectorAll(".question");
  const nextBtn = document.querySelector(".sbt");
  const submitHidden = document.querySelector(".subbtn");
  const progressBar = document.querySelector(".ipbar");
  const qh = document.querySelector(".qh");
  const section = document.querySelector(".section");
  const pcalvalue = document.querySelector(".pcalvalue");

  let currentIndex = 0;

  function showQuestion(index) {
    questions.forEach((q, i) => {
      q.classList.toggle("active", i === index);
    });
  }

  function updateHeader(index) {
    if (index < 10) {
      section.innerText = "Aptitude";
      qh.innerText = `Question ${index + 1} of 10`;
    } 
    else if (index < 20) {
      section.innerText = "Behaviour";
      qh.innerText = `Question ${index - 9} of 10`;
    } 
    else {
      section.innerText = "Mental & Psychology";
      qh.innerText = `Question ${index - 19} of 10`;
    }
  }

  nextBtn.addEventListener("click", () => {
    const currentQuestion = questions[currentIndex];
    const selected = currentQuestion.querySelector("input[type='radio']:checked");

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

    if (progress === 100) {
      progressBar.style.borderRadius = "10px";
    }
  });

  showQuestion(currentIndex);
  updateHeader(currentIndex);

  /* =======================
     SUBMIT + SAVE REPORT
  ======================== */

  submission.addEventListener("click", async (e) => {
    e.preventDefault();

    let aptitudeScore = 0;
    let behaviorScore = 0;
    let mentalScore = 0;

    document.querySelectorAll(".Aptitude .question").forEach(q => {
      const s = q.querySelector("input:checked");
      if (s) aptitudeScore += Number(s.value);
    });

    document.querySelectorAll(".behaviour .question").forEach(q => {
      const s = q.querySelector("input:checked");
      if (s) behaviorScore += Number(s.value);
    });

    document.querySelectorAll(".mental .question").forEach(q => {
      const s = q.querySelector("input:checked");
      if (s) mentalScore += Number(s.value);
    });

    const totalScore = aptitudeScore + behaviorScore + mentalScore;

    // Optional local fallback (safe to keep)
    localStorage.setItem(`${stream}_${testId}_totalScore`, totalScore);

    try {
      await fetch("/api/stream-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          stream,
          testId,
          aptitudeScore,
          behaviorScore,
          mentalScore,
          totalScore
        })
      });
    } catch (err) {
      console.error("Failed to save report, redirecting anyway");
    }
    window.location.href = `/Psychometric_Tests/stream-report.html?testId=${testId}`;
  });

});