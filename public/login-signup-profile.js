document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------
  // ELEMENTS
  // ------------------------------
  const logfname = document.getElementById("logfname");
  const loglname = document.getElementById("loglname");
  const logmob = document.getElementById("logmob");
  const logmail = document.getElementById("logmail");
  const logpass1 = document.getElementById("logpass1");
  const logpass2 = document.getElementById("logpass2");
  const logname = document.getElementById("logname");

  const logsub = document.querySelector(".logsub");
  const logsignin = document.querySelector(".logsignin");
  const logoutBtn = document.querySelector(".lgtBtn");

  const profile = document.querySelector(".profile");
  const profile1 = document.querySelector(".profile1");

  const login = document.querySelector(".login");
  const login1 = document.querySelector(".login1");

  const error1 = document.querySelector(".error");
  const error2 = document.querySelector(".error1");

  const avatar = document.querySelector(".avatar");
  const avatar1 = document.querySelector(".avatar1");
  const naam = document.querySelector(".namedata");
  const naam1 = document.querySelector(".namedatahead");
  const emailva = document.querySelector(".emaildata");
  const number = document.querySelector(".cnum");

  // Media
  const tab = window.matchMedia("(min-width: 700px) and (max-width: 1000px)");
  const mobile = window.matchMedia("(max-width: 700px)");
  const lap = window.matchMedia("(min-width: 1000px)");

  // ------------------------------
  // SHOW LOGIN / PROFILE BASED ON TOKEN
  // ------------------------------
  async function loadProfileUI() {
    const token = localStorage.getItem("token");

    if (!token) {
      showLoginUI();
      return;
    }

    // Fetch profile from backend
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();
      if (!data.success) {
        showLoginUI();
        return;
      }

      const { firstName, lastName, email, mobileNumber } = data.profile;

      // Fill UI
      if (naam) naam.innerHTML = `${firstName} ${lastName}`;
      if (naam1) naam1.innerHTML = `${firstName} ${lastName}`;
      if (emailva) emailva.innerHTML = email;
      if (number) number.innerHTML = mobileNumber;

      if (avatar) avatar.innerHTML = firstName[0] + lastName[0];
      if (avatar1) avatar1.innerHTML = firstName[0] + lastName[0];

      showProfileUI();

    } catch (error) {
      showLoginUI();
    }
  }

  function showProfileUI() {
    login.style.display = "none";
    login1.style.display = "none";
    if (tab.matches || lap.matches) profile.style.display = "block";
    if (mobile.matches) profile1.style.display = "block";
  }

  function showLoginUI() {
    localStorage.removeItem("token");
    if (mobile.matches) {
      login1.style.display = "block";
      login.style.display = "none";
    } else {
      login.style.display = "block";
      login1.style.display = "none";
    }
    profile.style.display = "none";
    profile1.style.display = "none";
  }

  // ------------------------------
  // SIGNUP
  // ------------------------------
  if (logsub) {
    logsub.addEventListener("click", async (e) => {
      e.preventDefault();

      const firstName = logfname.value;
      const lastName = loglname.value;
      const email = logmail.value;
      const mobileno = logmob.value;
      const password = logpass1.value;

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, mobileno, password })
      });

      const data = await res.json();

      if (!data.success) {
        error1.innerHTML = data.message;
        error1.style.display = "block";
        return;
      }

      // Signup success → Auto login: save token
      localStorage.setItem("token", data.token);
      error1.style.display = "none";

      await loadProfileUI();
    });
  }

  // ------------------------------
  // LOGIN
  // ------------------------------
  if (logsignin) {
    logsignin.addEventListener("click", async (e) => {
      e.preventDefault();

      const email = logname.value;
      const password = logpass2.value;

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.success) {
        error2.innerHTML = data.message;
        error2.style.display = "block";
        return;
      }

      localStorage.setItem("token", data.token);
      error2.style.display = "none";

      await loadProfileUI();
    });
  }

  // ------------------------------
  // LOGOUT
  // ------------------------------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      showLoginUI();
    });
  }

  // ------------------------------
  // INIT
  // ------------------------------
  loadProfileUI();
});