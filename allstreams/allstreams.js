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
window.addEventListener("load", () => {
  document.body.style.overflowY = "hidden";  
  document.body.offsetHeight; // forces reflow
  document.body.style.overflowY = "auto";
});