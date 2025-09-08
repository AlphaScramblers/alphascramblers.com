const question = document.querySelectorAll(".question");
const submit = document.querySelector(".sbt");
const bar = document.querySelector(".ipbar");
const qh = document.querySelector(".qh");
const section = document.querySelector(".section");
let pcalvalue = document.querySelector(".pcalvalue");
let currentIndex = 0;

function showQuestion(index){
    question.forEach((q,i)=>{
        q.classList.toggle("active",i===index);
    })
}

submit.addEventListener("click",()=>{
    const currentQuestion = question[currentIndex];
    const selected = currentQuestion.querySelector("input[type='radio']:checked");

    if(!selected){
        alert("Please select any option before continuing!!");
        return;
    }

    currentIndex++;
    const progress = (currentIndex/question.length)*100;
    bar.style.width= progress + "%";
    pcalvalue.innerHTML=`${Math.round(progress)}%`
    if(currentIndex<question.length){
        showQuestion(currentIndex);
    }
    else{
        submit.style.display="none"
    }
    for(let i=0;i<10;i++){
        if(currentIndex<=10){
            qh.innerHTML=`Question ${currentIndex+1} of 10`;
        }
        if(currentIndex>=10 && currentIndex<=20){
            qh.innerHTML=`Question ${currentIndex-9} of 10`;  
            section.innerHTML="Behaviour" 
        }
        if(currentIndex>=20 && currentIndex<=30){
            qh.innerHTML=`Question ${currentIndex-19} of 10`;
            section.innerHTML="Mental & Psychology" 
        }
    }
})
showQuestion(currentIndex);