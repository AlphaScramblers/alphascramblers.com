for(let i=1;i<=12;i++){
    let button = document.querySelector(`.C${i}`);
    let fc = document.querySelector(`.fc${i}`);
    let fcnew = document.querySelector(`.fc${i}n`)
    button.addEventListener("click",()=>{
    if(fc.classList.contains(`fc${i}`)){
        fc.classList.remove(`fc${i}`);
        fc.classList.add(`fc${i}n`);
        fc.scrollIntoView();
    }
    else{
        fc.classList.remove(`fc${i}n`);
        fc.classList.add(`fc${i}`)
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