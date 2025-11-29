// document.addEventListener("DOMContentLoaded", () => {
//   if (localStorage.getItem("loggedIn") === "true") {
//     login.style.display = "none";
//     login1.style.display = "none";
//     if (tab.matches || lap.matches) {
//       profile.style.display = "block";
//     }
//   } else {
//     if (mobile.matches) {
//       login1.style.display = "block";
//       login.style.display = "none"
//     }
//     if (tab.matches || lap.matches) {
//       login.style.display = "block";
//       login1.style.display = "none";
//     }
//     profile.style.display = "none";
//     profile1.style.display = "none";
//   }
//   const storedFirstName = localStorage.getItem("firstName");
//   const email= localStorage.getItem("email");
//   const no=localStorage.getItem("no");
//   const storedLastName = localStorage.getItem("lastName");
//   const mainprof = document.querySelector(".profile-section")
//   const loggedIn = localStorage.getItem("loggedIn");
//   if (loggedIn) {
//     const avatar = document.querySelector(".avatar");
//     const avatar1 = document.querySelector(".avatar1");
//     const naam = document.querySelector(".namedata");
//     const naam1 = document.querySelector(".namedatahead");
//     const emailva=document.querySelector(".emaildata");
//     const number = document.querySelector(".cnum");
//     login.style.display = "none";
//     login1.style.display = "none";
//     if (naam && storedFirstName && storedLastName &&emailva && number && email && no && avatar) {
//             naam.innerHTML = `${storedFirstName} ${storedLastName}`;
//             naam1.innerHTML = `${storedFirstName} ${storedLastName}`;
//             emailva.innerHTML=`${email}`;
//             number.innerHTML=`${no}`;
//             avatar.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
//             avatar1.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
//         }
//     if (tab.matches) {
//       profile.style.display = "block";
//     }
//     if (mobile.matches) {
//       profile1.style.display = "block";
//     }
//     if (lap.matches) {
//       profile.style.display = "block";
//     }
//     logsignin.innerHTML = "Signed In Successfully";
//     logsignin.disabled = true;
//     logname.readOnly = true;
//     logpass2.readOnly = true;
//   } else {
//     login.style.display = "block";
//     login1.style.display = "block";
//     profile.style.display = "none";
//     profile1.style.display = "none";
//   }
//   const logoutbut=document.querySelector(".lgtBtn")
//   logoutbut.addEventListener("click",() => {
//     localStorage.removeItem("loggedIn")
//     const uploggedIn=localStorage.getItem("loggedIn");
//     if (!uploggedIn) {
//     login.style.display = "block";
//     login1.style.display = "block";
//     mainprof.style.display="none";

//     if (tab.matches) {
//       profile.style.display = "none";
//     }
//     if (mobile.matches) {
//       profile1.style.display = "none";
//     }
//     if (lap.matches) {
//       profile.style.display = "none";
//     }
//     logsignin.innerHTML = "Sign In";
//     logsignin.disabled = false;
//     logname.readOnly = false;
//     logpass2.readOnly = false;
//   } else {
//     login.style.display = "none";
//     login1.style.display = "none";
//     profile.style.display = "block";
//     profile1.style.display = "block";
//     } 
//   }
// ) 
// });
// 



document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  const loggedIn = localStorage.getItem("loggedIn");
  const logoutBtn = document.querySelector(".lgtBtn");

  // UI elements
  const avatar = document.querySelector(".avatar");
  const avatar1 = document.querySelector(".avatar1");
  const naam = document.querySelector(".namedata");
  const naam1 = document.querySelector(".namedatahead");
  const emailva = document.querySelector(".emaildata");
  const number = document.querySelector(".cnum");
  const mainprof = document.querySelector(".profile-section");

  // If NOT logged in → show login only
  if (!loggedIn || !token) {
    login.style.display = mobile.matches ? "none" : "block";
    login1.style.display = mobile.matches ? "block" : "none";
    profile.style.display = "none";
    profile1.style.display = "none";
    return;
  }

  // If logged in → hide login UI
  login.style.display = "none";
  login1.style.display = "none";

  // =============== FETCH PROFILE FROM API ===============

  let profileData;
  try {
    const res = await fetch("/api/profile", {
      headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json();

    if (!data.success) {
      console.error("Profile fetch failed:", data.message);
      return;
    }

    profileData = data.profile;

  } catch (error) {
    console.error("Profile fetch error:", error);
    return;
  }

  // =============== FILL UI WITH PROFILE DATA ===============

  const firstName = profileData.firstName;
  const lastName = profileData.lastName;
  const email = profileData.email;
  const mobile = profileData.mobileNumber;

  if (naam) naam.innerHTML = `${firstName} ${lastName}`;
  if (naam1) naam1.innerHTML = `${firstName} ${lastName}`;
  if (emailva) emailva.innerHTML = email;
  if (number) number.innerHTML = mobile;

  if (avatar) avatar.innerHTML = firstName.charAt(0) + lastName.charAt(0);
  if (avatar1) avatar1.innerHTML = firstName.charAt(0) + lastName.charAt(0);

  // =============== SHOW PROFILE UI ===============

  if (tab.matches || lap.matches) profile.style.display = "block";
  if (mobile.matches) profile1.style.display = "block";

  logsignin.innerHTML = "Signed In Successfully";
  logsignin.disabled = true;

  logname.readOnly = true;
  logpass2.readOnly = true;

  // =============== LOGOUT FUNCTION ===============

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("token");

    mainprof.style.display = "none";

    login.style.display = mobile.matches ? "none" : "block";
    login1.style.display = mobile.matches ? "block" : "none";
    profile.style.display = "none";
    profile1.style.display = "none";

    logsignin.innerHTML = "Sign In";
    logsignin.disabled = false;
    logname.readOnly = false;
    logpass2.readOnly = false;
  });

});