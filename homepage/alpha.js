let banner = document.querySelector(".banner");
let bannerno=1;
let d1 = document.querySelector(".d1");
let d2 = document.querySelector(".d2");
let d3 = document.querySelector(".d3");
let d4 = document.querySelector(".d4");
function newBanner(){
    if(bannerno<5){
        banner.style.transform=`translateX(-${bannerno*100}vw)`
        bannerno=bannerno+1;
    if(bannerno==2){
        d1.style.backgroundColor="white";
        d2.style.backgroundColor="gray";
        d3.style.backgroundColor="white";
        d4.style.backgroundColor="white";
    }
    if(bannerno==3){
        d1.style.backgroundColor="white";
        d2.style.backgroundColor="white";
        d3.style.backgroundColor="gray";
        d4.style.backgroundColor="white";
    }
    if(bannerno==4){
        d1.style.backgroundColor="white";
        d2.style.backgroundColor="white";
        d3.style.backgroundColor="white";
        d4.style.backgroundColor="gray";
    }
    if(bannerno==5){
        d1.style.backgroundColor="gray";
        d2.style.backgroundColor="white";
        d3.style.backgroundColor="white";
        d4.style.backgroundColor="white";
    }
    }
    else if(bannerno==5){
        setTimeout(()=>{
            banner.style.transition="none";
            banner.style.transform="translateX(0%)";
        },0)
        setTimeout(()=>{
            banner.style.transition="transform 1.5s ease-in-out";
            bannerno=1;
        },50)}
}
let interval = setInterval(newBanner,3000);
d1.addEventListener("click",()=>{
    clearInterval(interval);
    banner.style.transform=`translateX(0vw)`
    d1.style.backgroundColor="gray";
    d2.style.backgroundColor="white";
    d3.style.backgroundColor="white";
    d4.style.backgroundColor="white";
})
d2.addEventListener("click",()=>{
    clearInterval(interval);
    banner.style.transform=`translateX(-100vw)`
    d1.style.backgroundColor="white";
    d2.style.backgroundColor="gray";
    d3.style.backgroundColor="white";
    d4.style.backgroundColor="white";
})
d3.addEventListener("click",()=>{
    clearInterval(interval);
    banner.style.transform=`translateX(-200vw)`
    d1.style.backgroundColor="white";
    d2.style.backgroundColor="white";
    d3.style.backgroundColor="gray";
    d4.style.backgroundColor="white";
})
d4.addEventListener("click",()=>{
    clearInterval(interval);
    banner.style.transform=`translateX(-300vw)`
    d1.style.backgroundColor="white";
    d2.style.backgroundColor="white";
    d3.style.backgroundColor="white";
    d4.style.backgroundColor="gray";
})

document.addEventListener("DOMContentLoaded", () => {
  
  const banner = document.querySelector(".banner");
  const pp = document.querySelector(".profile-section");
  const d1 = document.querySelector(".d1");
  const d2 = document.querySelector(".d2");
  const d3 = document.querySelector(".d3");
  const d4 = document.querySelector(".d4");
  const logout = document.querySelector(".lgtBtn");
  const login = document.querySelector(".login");
  const login1 = document.querySelector(".login1");
  const profile = document.querySelector(".profile");
  const profile1 = document.querySelector(".profile1");
  const logsignin = document.querySelector(".logsignin");
  const logname = document.getElementById("logname");
  const logpass2 = document.getElementById("logpass2");
  const error2 = document.querySelector(".error1");
  const tab = window.matchMedia("(min-width: 700px) and (max-width: 1000px)");
  const mobile = window.matchMedia("(max-width: 700px)");
  const lap = window.matchMedia("(min-width: 700px)");



  
  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn === "true") {
    login.style.display = "none";
    login1.style.display = "none";
    profile.style.display = lap.matches ? "block" : "none";
    profile1.style.display = mobile.matches ? "block" : "none";
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
  if (link) {
    link.addEventListener("click", e => {
      if (localStorage.getItem("loggedIn") !== "true") {
        e.preventDefault();
        alert("Please log in first to access the Psychometric Test page!");
      }
    });
  }


  if (logout) {
    logout.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      error2.style.display = "block";
      login.style.display = "block";
      login1.style.display = "block";
      profile.style.display = "none";
      profile1.style.display = "none";
      pp.style.display="none";

    });
  }
});

