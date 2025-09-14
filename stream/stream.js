document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn) {
    login.style.display = "none";
    login1.style.display = "none";

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
});
document.addEventListener("DOMContentLoaded", () => {
   const storedFirstName = localStorage.getItem("firstName");
   const email= localStorage.getItem("email");
   const no=localStorage.getItem("no");
    const storedLastName = localStorage.getItem("lastName");
  let tab = window.matchMedia("(min-width: 700px) and (max-width: 1000px)");
let mobile = window.matchMedia("(max-width: 700px)");
let lap = window.matchMedia("(min-width: 700px)");
const mainprof = document.querySelector(".profile-section")

   const login      = document.querySelector(".login");
  const login1     = document.querySelector(".login1");
  const profile    = document.querySelector(".profile");
  const profile1   = document.querySelector(".profile1");
let logsignin = document.querySelector(".logsignin");
  let logname = document.getElementById("logname");
let logpass2 = document.getElementById("logpass2");

  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn) {
    const avatar = document.querySelector(".avatar");
     const avatar1 = document.querySelector(".avatar1");
    const naam = document.querySelector(".namedata");
    const emailva=document.querySelector(".emaildata");
    const number = document.querySelector(".cnum");
    login.style.display = "none";
    login1.style.display = "none";
    if (naam && storedFirstName && storedLastName &&emailva && number && email && no && avatar) {
            naam.innerHTML = `${storedFirstName} ${storedLastName}`;
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
  const link = document.querySelector(".link1"); 
  link.addEventListener("click", (e) => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
      e.preventDefault(); 
      alert("Please log in first to access the Psychometric Test page!");   
    }
  });
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