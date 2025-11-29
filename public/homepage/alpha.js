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

  function handleClick(e) {
    e.preventDefault();

    const token = localStorage.getItem("token"); // NEW LOGIN CHECK
    const paymentDone = localStorage.getItem("paymentDone");

    if (!token) {
      alert("Please log in first to access the Psychometric Test page!");
      return;
    }

    if (paymentDone === "true") {
      window.location.href = "../Psychometric_Tests/psychomid.html";
    } else {
      window.location.href = "../Psychometric_Tests/beforepg.html";
    }
  }

  const buttons = [
    ".strtbut",
    ".bottompsycho",
    ".bottompsycho1",
    ".bannerpsycho"
  ];

  buttons.forEach(selector => {
    const btn = document.querySelector(selector);
    if (btn) btn.addEventListener("click", handleClick);
  });

});