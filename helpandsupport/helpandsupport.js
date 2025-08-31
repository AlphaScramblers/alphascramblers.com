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