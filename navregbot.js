let header = document.querySelector("header");
let main = document.querySelector("main");
let footer = document.querySelector("footer");
let overlay=document.querySelector(".overlay");
let bars = document.querySelector(".navcon");
let menu = document.querySelector(".navcon-ele");
let bottom = document.querySelector(".bottom");
let currstat="unvis";
window.addEventListener("load", () => {
    document.querySelector(".preloader").style.display = "none";
    document.querySelector("header").style.display = "block";
    document.querySelector("main").style.display = "block";
    document.querySelector("footer").style.display = "block";
    button.style.display = "flex";
});
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
// overlay.style.height= document.documentElement.scrollHeight + "px";
let cross= document.querySelector(".cross")
let alphalogin = document.querySelector(".alphalogin");
let reg = document.querySelectorAll(".r");
reg.forEach(r=>{
    r.addEventListener("click",()=>{
    alphalogin.classList.remove("alphadis");
    header.style.opacity="1";
    main.style.opacity="0.3";
    bottom.style.opacity="0.3";
    overlay.classList.add("overlay1");
    document.body.style.overflow="hidden";
    document.documentElement.style.overflow = "hidden";
})
})
cross.addEventListener("click",()=>{
    alphalogin.classList.add("alphadis");
    header.style.opacity="1";
    main.style.opacity="1";
    bottom.style.opacity="1";
    overlay.classList.remove("overlay1");
    document.body.style.overflow="auto";
    document.documentElement.style.overflow = "auto";
})
let calcScrollValue = () => {
    let scrollProgress = document.querySelector(".progress");
    let progressValue = document.querySelector(".progress-value");
    let pos = document.documentElement.scrollTop;
    let calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrollValue = Math.round((pos * 100) / calcHeight);
    if (scrollY>innerHeight/4) {
        scrollProgress.style.display = "flex";
    }
    if(scrollY<innerHeight/innerHeight){
        scrollProgress.style.display = "none";    
    }
    scrollProgress.addEventListener("click",()=>{
        document.documentElement.scrollTop = 0;
    })
    scrollProgress.style.background = `conic-gradient(#4d5bf9 ${scrollValue}%, #d7d7d7 ${scrollValue}%)`;
}
window.onscroll = calcScrollValue;
window.onload = calcScrollValue;
let contactus=document.querySelector(".contactus")
let contactus1=document.querySelector(".cntus")
let contactus2=document.querySelector(".cntus1")
let crossct = document.querySelector(".crossct")
crossct.addEventListener("click",()=>{
    contactus.classList.add("dis");
    header.style.opacity="1";
    main.style.opacity="1";
    bottom.style.opacity="1";
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
    bottom.style.opacity="0.3";
    overlay.classList.add("overlay1");
})
contactus1.addEventListener("click",(e)=>{
    if(hasmoved){
        e.preventDefault();
        e.stopImmediatePropagation();
        hasmoved=false;
        return;
    }
    contactus.classList.remove("dis");
    header.style.opacity="1";
    main.style.opacity="0.3";
    bottom.style.opacity="0.3";
    overlay.classList.add("overlay1");
})
contactus2.addEventListener("click",(e)=>{
    if(hasmoved){
        e.preventDefault();
        e.stopImmediatePropagation();
        hasmoved=false;
        return;
    }
    contactus.classList.remove("dis");
    header.style.opacity="1";
    main.style.opacity="0.3";
    bottom.style.opacity="0.3";
    overlay.classList.add("overlay1");
})
if(window.matchMedia("(pointer: coarse)").matches){
    console.log("Touch device");
}
else{
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
        hasmoved = false    
        let screenmiddle = window.innerWidth/2;
        let rect = button.getBoundingClientRect();
        if(rect.left<screenmiddle){
            button.style.left = "10px"
        }
        else{
            button.style.left = (window.innerWidth-rect.width-20) + "px";
        }
    })
}
let talk = document.querySelector(".ct");
let namect = document.querySelector("#namect");
let mailct = document.querySelector("#mailct");
let contactct = document.querySelector("#contactct");
let cloader = document.querySelector(".contactloader");
document.getElementById("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    cloader.style.display="flex";
    contactus.style.opacity="0.3";
    header.style.opacity="0";
    main.style.opacity="0";
    bottom.style.opacity="0";
    const formData = {
      name: document.getElementById("namect").value,
      mail: document.getElementById("mailct").value,
      contact: document.getElementById("contactct").value
    };
    
    try{
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (data.success) {
      talk.innerHTML="Query Submitted";
      talk.disabled = true;
      namect.disabled = true;
      mailct.disabled = true;
      contactct.disabled = true;
    } else {
      alert("❌ Error: " + data.error);
    }
    }
    catch (err) {
        alert("❌ Something went wrong.");
    } 
    finally {
        cloader.style.display = "none";
        contactus.classList.add("dis");
        header.style.opacity="1";
        main.style.opacity="1";
        bottom.style.opacity="1";
        overlay.classList.remove("overlay1");
        contactus.style.opacity="1"
    }
});
let loginform = document.querySelector(".loginform");
let signup = document.querySelector(".signup");
let caa = document.querySelector(".caa");
let log = document.querySelector(".log");
log.addEventListener("click",()=>{
    signup.classList.add("signdis");
    loginform.classList.remove("logdis");
    loginform.style.display="flex"
})
caa.addEventListener("click",()=>{
    signup.classList.remove("signdis");
    loginform.classList.add("logdis")
    loginform.style.display="none"
})
let logfname = document.getElementById("logfname");
let loglname = document.getElementById("loglname");
let logmob = document.getElementById("logmob");
let logmail = document.getElementById("logmail");
let logpass1 = document.getElementById("logpass1");
let error1 = document.querySelector(".error")
let logsub = document.querySelector(".logsub")
let profile = document.querySelector(".profile")
let profile1 = document.querySelector(".profile1")
let login = document.querySelector(".login")
logsub.addEventListener("click", async (e) => {
    e.preventDefault();
    cloader.style.display="flex";
    alphalogin.style.opacity="0.3";
    header.style.opacity="0";
    main.style.opacity="0";
    bottom.style.opacity="0";
    overlay.classList.add("overlay1");
    alphalogin.classList.remove("alphadis");
    const firstName = document.getElementById("logfname").value;
    const lastName = document.getElementById("loglname").value;
    const email = document.getElementById("logmail").value;
    const mobileno=document.getElementById("logmob").value;
    const password = document.getElementById("logpass1").value;
    try{
        const res = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password,mobileno }),
        });
        const data = await res.json();
            console.log("Raw API Response:", res.status, data);
        if (data.success) {
            logfname.readOnly = true
            loglname.readOnly = true
            logmail.readOnly = true
            logmob.readOnly = true
            logpass1.readOnly = true
            logsub.disabled = true
            logsub.innerHTML="Account Created"
            error1.style.display = "none";
            login.style.display="none";
            profile.style.display="block"
            profile1.style.display="block"  
        } else {
            error1.innerHTML = data.message || "Something went wrong!";
            error1.style.display = "block"; 
        }
    }
    catch (err) {
        alert("❌ Something went wrong.");
    }
    finally{
        cloader.style.display = "none";
        header.style.opacity="1";
        main.style.opacity="1";
        bottom.style.opacity="1";
        overlay.classList.remove("overlay1");
        alphalogin.style.opacity="1"
        document.body.style.overflow="auto";
        document.documentElement.style.overflow = "auto";
    }
  });
  document.querySelector(".logsignin").addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("logname").value;
    const password = document.getElementById("logpass2").value;
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log(data);
    if (data.success) {
      alert("Login successful!");
      localStorage.setItem("userProfile", JSON.stringify(data.profile));
    } else {
      alert(data.error);
    }
  });