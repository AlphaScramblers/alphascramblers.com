let header = document.querySelector("header");
let main = document.querySelector("main");
let footer = document.querySelector("footer");
let overlay=document.querySelector(".overlay");
let bars = document.querySelector(".navcon");
let menu = document.querySelector(".navcon-ele");
let scrolltop = document.querySelector(".top");
let currstat="unvis";
bars.addEventListener("click",()=>{
if(currstat=="unvis"){
    currstat="vis"
    menu.classList.remove("navcon-ele");
    menu.classList.add("navcon-ele-new");
}
else{
    currstat="unvis"
    menu.classList.remove("navcon-ele-new");
    menu.classList.add("navcon-ele");
}
})
overlay.style.height=`${document.documentElement.scrollHeight}px`
let register = document.querySelector(".register");
let regbtn = document.querySelector(".login");
let cross= document.querySelector(".cross")
regbtn.addEventListener("click",()=>{
    register.classList.remove("regdis");
    header.style.opacity="1";
    main.style.opacity="0.3";
    footer.style.opacity="0.3";
    overlay.classList.add("overlay1");
    document.body.style.overflow="hidden";
})
cross.addEventListener("click",()=>{
    register.classList.add("regdis");
    header.style.opacity="1";
    main.style.opacity="1";
    footer.style.opacity="1";
    overlay.classList.remove("overlay1");
    document.body.style.overflow="scroll";
})
scrolltop.addEventListener("click",()=>{
    window.scrollTo(0,0);
})
window.addEventListener("scroll",()=>{
    if(scrollY>innerHeight/4){
        console.log("scroll")
        scrolltop.classList.remove("d");
    }
    if(scrollY<innerHeight/innerHeight){
        console.log("scroll")
        scrolltop.classList.add("d");
    }
})
let contactus=document.querySelector(".contactus")
let crossct = document.querySelector(".crossct")
crossct.addEventListener("click",()=>{
    contactus.classList.add("dis");
    header.style.opacity="1";
    main.style.opacity="1";
    footer.style.opacity="1";
    overlay.classList.remove("overlay1");
})
let button = document.querySelector(".contactuslogo");
let offsetX;
let offsetY;
let isdragging = false;
let hasmoved= false;
button.addEventListener("click",(e)=>{
    if(hasmoved){
        e.preventDefault();
        e.stopImmediatePropagation();
        hasmoved=false;
        return;
    }
    contactus.classList.remove("dis");
    header.style.opacity="1";
    main.style.opacity="0.3";
    footer.style.opacity="0.3";
    overlay.classList.add("overlay1");
})
button.addEventListener("mousedown",(e)=>{
    hasmoved=false
    isdragging = true;
    offsetX = e.clientX - button.offsetLeft;
    offsetY = e.clientY - button.offsetTop;
    
    button.style.cursor = "grabbing"
})
document.addEventListener("mousemove",(e)=>{
    if(isdragging){
        hasmoved=true;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        
        button.style.top = y + "px"
        button.style.left = x + "px"
    }
})
document.addEventListener("mouseup",(e)=>{
    isdragging = false;
    button.style.cursor = "pointer"
    let screenmiddle = window.innerWidth/2;
    let rect = button.getBoundingClientRect();
    if(rect.left<screenmiddle){
        button.style.left = "10px"
    }
    else{
        button.style.left = (window.innerWidth-rect.width-20) + "px";
    }
})