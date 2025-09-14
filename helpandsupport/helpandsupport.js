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