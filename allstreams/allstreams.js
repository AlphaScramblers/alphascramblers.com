for(let i=1;i<=12;i++){
    let button = document.querySelector(`.C${i}`);
    let fc = document.querySelector(`.fc${i}`);
    let fcnew = document.querySelector(`.fc${i}n`)

    button.addEventListener("click",()=>{
    if(currstat=="unvis"){
        currstat="vis"
        fc.classList.remove(`fc${i}`);
        fc.classList.add(`fc${i}n`);
        fc.scrollIntoView();
    }
    else{
        currstat="unvis"
        fc.classList.remove(`fc${i}n`);
        fc.classList.add(`fc${i}`)
    }
})
}