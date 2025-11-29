document.addEventListener("DOMContentLoaded", () => {

    // INPUT FIELDS
    const logfname = document.getElementById("logfname");
    const loglname = document.getElementById("loglname");
    const logmob = document.getElementById("logmob");
    const logmail = document.getElementById("logmail");
    const logpass1 = document.getElementById("logpass1");
    const logpass2 = document.getElementById("logpass2");
    const logname = document.getElementById("logname");

    // BUTTONS
    const logsub = document.querySelector(".logsub");
    const logsignin = document.querySelector(".logsignin");
    const logoutBtn = document.querySelector(".lgtBtn");

    // ERROR BOXES
    const error1 = document.querySelector(".error");
    const error2 = document.querySelector(".error1");

    // UI SECTIONS
    const profile = document.querySelector(".profile");
    const profile1 = document.querySelector(".profile1");
    const login = document.querySelector(".login");
    const login1 = document.querySelector(".login1");
    const profilesection = document.querySelector(".profile-section");

    // AVATAR + TEXT
    const avatar = document.querySelector(".avatar");
    const avatar1 = document.querySelector(".avatar1");
    const naam = document.querySelector(".namedata");
    const naam1 = document.querySelector(".namedatahead");
    const emailva = document.querySelector(".emaildata");
    const number = document.querySelector(".cnum");

    // LOADER + OVERLAY
    const cloader = document.querySelector(".contactloader");
    const alphalogin = document.querySelector(".alphalogin");
    const overlay = document.querySelector(".overlay");

    // RESPONSIVE
    const tab = window.matchMedia("(min-width: 700px) and (max-width: 1000px)");
    const mobile = window.matchMedia("(max-width: 700px)");
    const lap = window.matchMedia("(min-width: 1000px)");

    // -------------------------------------
    // HELPERS: UI SHOW/HIDE
    // -------------------------------------
    function showLoader() {
        cloader.style.display = "flex";
        overlay.classList.add("overlay1");
        if (alphalogin) alphalogin.style.opacity = "0.3";
    }

    function hideLoader() {
        cloader.style.display = "none";
        overlay.classList.remove("overlay1");
        if (alphalogin) alphalogin.style.opacity = "1";
    }

    function showLoginUI() {
        login.style.display = mobile.matches ? "none" : "block";
        login1.style.display = mobile.matches ? "block" : "none";

        profile.style.display = "none";
        profile1.style.display = "none";

        localStorage.removeItem("token");
    }

    function showProfileUI() {
        login.style.display = "none";
        login1.style.display = "none";

        if (tab.matches || lap.matches) profile.style.display = "block";
        if (mobile.matches) profile1.style.display = "block";
    }

    // -------------------------------------
    // FETCH PROFILE
    // -------------------------------------
    async function loadProfile() {
        const token = localStorage.getItem("token");
        if (!token) return showLoginUI();

        try {
            const res = await fetch("/api/profile", {
                headers: { Authorization: "Bearer " + token },
            });

            const data = await res.json();
            if (!data.success) return showLoginUI();

            const { firstName, lastName, email, mobileNumber } = data.profile;

            naam.textContent = `${firstName} ${lastName}`;
            naam1.textContent = `${firstName} ${lastName}`;
            emailva.textContent = email;
            number.textContent = mobileNumber;

            avatar.textContent = firstName[0] + lastName[0];
            avatar1.textContent = firstName[0] + lastName[0];

            showProfileUI();
        } catch (err) {
            console.error("PROFILE ERROR", err);
            showLoginUI();
        }
    }

    // -------------------------------------
    // SIGNUP
    // -------------------------------------
    if (logsub) {
        logsub.addEventListener("click", async (e) => {
            e.preventDefault();

            const firstName = logfname.value.trim();
            const lastName = loglname.value.trim();
            const email = logmail.value.trim();
            const mobileno = logmob.value.trim();
            const password = logpass1.value.trim();

            error1.style.display = "none";
            showLoader();

            try {
                const res = await fetch("/api/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ firstName, lastName, email, mobileno, password })
                });

                const data = await res.json();

                if (!data.success) {
                    error1.textContent = data.message;
                    error1.style.display = "block";
                    return;
                }

                localStorage.setItem("token", data.token);
                await loadProfile();

                logsub.textContent = "Account Created";
                logsub.disabled = true;

            } catch (err) {
                error1.textContent = "Something went wrong.";
                error1.style.display = "block";
            } finally {
                hideLoader();
            }
        });
    }

    // -------------------------------------
    // LOGIN
    // -------------------------------------
    if (logsignin) {
        logsignin.addEventListener("click", async (e) => {
            e.preventDefault();

            const email = logname.value.trim();
            const password = logpass2.value.trim();

            error2.style.display = "none";
            showLoader();

            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!data.success) {
                    error2.textContent = data.message;
                    error2.style.display = "block";
                    return;
                }

                localStorage.setItem("token", data.token);
                await loadProfile();

                logsignin.textContent = "Signed In Successfully";
                logsignin.disabled = true;
                logname.readOnly = true;
                logpass2.readOnly = true;

            } catch (err) {
                error2.textContent = "Login failed.";
                error2.style.display = "block";
            } finally {
                hideLoader();
            }
        });
    }

    // -------------------------------------
    // LOGOUT
    // -------------------------------------
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            showLoginUI();
            window.location.reload();
        });
    }

    // -------------------------------------
    // PROFILE DROPDOWN
    // -------------------------------------
    profile?.addEventListener("click", (e) => {
        e.stopPropagation();
        profilesection.classList.toggle("show");
    });

    profile1?.addEventListener("click", (e) => {
        e.stopPropagation();
        profilesection.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!profilesection.contains(e.target)) {
            profilesection.classList.remove("show");
        }
    });

    // -------------------------------------
    // INITIAL PROFILE LOAD
    // -------------------------------------
    loadProfile();
});