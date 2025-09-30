for(let i=1;i<=10;i++){
    let button = document.querySelector(`.b${i}`);
    let answer = document.querySelector(`.a${i}`);
    let answernew = document.querySelector(`.a${i}n`)

    button.addEventListener("click",()=>{
    if(currstat=="unvis"){
        currstat="vis"
        answer.classList.remove(`a${i}`);
        answer.classList.add(`a${i}n`)
        button.innerHTML="-"
    }
    else{
        currstat="unvis"
        answer.classList.remove(`a${i}n`);
        answer.classList.add(`a${i}`)
        button.innerHTML="+"
    }
})
}
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("loggedIn") === "true") {
    login.style.display = "none";
    login1.style.display = "none";
    if (tab.matches || lap.matches) {
      profile.style.display = "block";
    }
  } else {
    if (mobile.matches) {
      login1.style.display = "block";
      login.style.display = "none"
    }
    if (tab.matches || lap.matches) {
      login.style.display = "block";
      login1.style.display = "none";
    }
    profile.style.display = "none";
    profile1.style.display = "none";
  }
  const storedFirstName = localStorage.getItem("firstName");
  const email= localStorage.getItem("email");
  const no=localStorage.getItem("no");
  const storedLastName = localStorage.getItem("lastName");
  const mainprof = document.querySelector(".profile-section")
  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn) {
    const avatar = document.querySelector(".avatar");
    const avatar1 = document.querySelector(".avatar1");
    const naam = document.querySelector(".namedata");
    const naam1 = document.querySelector(".namedatahead");
    const emailva=document.querySelector(".emaildata");
    const number = document.querySelector(".cnum");
    login.style.display = "none";
    login1.style.display = "none";
    if (naam && storedFirstName && storedLastName &&emailva && number && email && no && avatar) {
            naam.innerHTML = `${storedFirstName} ${storedLastName}`;
            naam1.innerHTML = `${storedFirstName} ${storedLastName}`;
            emailva.innerHTML=`${email}`;
            number.innerHTML=`${no}`;
            avatar.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
            avatar1.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
        }
    if (tab.matches) {
      profile.style.display = "block";
    }
    if (mobile.matches) {
      profile1.style.display = "block";
    }
    if (lap.matches) {
      profile.style.display = "block";
    }
    logsignin.innerHTML = "Signed In Successfully";
    logsignin.disabled = true;
    logname.readOnly = true;
    logpass2.readOnly = true;
  } else {
    login.style.display = "block";
    login1.style.display = "block";
    profile.style.display = "none";
    profile1.style.display = "none";
  }
  const logoutbut=document.querySelector(".lgtBtn")
  logoutbut.addEventListener("click",() => {
    localStorage.removeItem("loggedIn")
    const uploggedIn=localStorage.getItem("loggedIn");
    if (!uploggedIn) {
    login.style.display = "block";
    login1.style.display = "block";
    mainprof.style.display="none";

    if (tab.matches) {
      profile.style.display = "none";
    }
    if (mobile.matches) {
      profile1.style.display = "none";
    }
    if (lap.matches) {
      profile.style.display = "none";
    }
    logsignin.innerHTML = "Sign In";
    logsignin.disabled = false;
    logname.readOnly = false;
    logpass2.readOnly = false;
  } else {
    login.style.display = "none";
    login1.style.display = "none";
    profile.style.display = "block";
    profile1.style.display = "block";
    } 
  }
) 
});
document.getElementById('queryForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const form = event.target;
  const messageArea = document.getElementById('formMessage');
  messageArea.textContent = "Sending query...";

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      messageArea.textContent = " Query sent successfully!";
      document.getElementById("queryContentId").value = "";
    } else {
      const result = await response.json();
      messageArea.textContent = "Failed: " + (result.message || "Server error.");
    }
  } catch (error) {
    messageArea.textContent = " Network error occurred.";
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("queryForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Get email from localStorage
    const email = localStorage.getItem("email");
    if (!email) {
      document.getElementById("formMessage").innerText = "User email not found!";
      return;
    }

    // Send to backend as userEmail
    data.userEmail = email;

    try {
      const response = await fetch("/api/sendQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result); // for debugging
      document.getElementById("formMessage").innerText = result.message;

      if (response.ok) form.reset();
    } catch (err) {
      console.error("Fetch failed:", err);
      document.getElementById("formMessage").innerText =
        "Failed to send query. Check console.";
    }
  });
});