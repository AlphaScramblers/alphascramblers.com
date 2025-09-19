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
    r.addEventListener("click",(e)=>{
    e.stopPropagation()
    alphalogin.classList.remove("alphadis");
    header.style.opacity="1";
    main.style.opacity="0.3";
    bottom.style.opacity="0.3";
    overlay.classList.add("overlay1");
    document.body.style.overflow="hidden";
    document.documentElement.style.overflow = "hidden";
})
})
cross.addEventListener("click",(e)=>{
    e.stopPropagation()
    alphalogin.classList.add("alphadis");
    header.style.opacity="1";
    main.style.opacity="1";
    bottom.style.opacity="1";
    overlay.classList.remove("overlay1");
    document.body.style.overflow="auto";
    document.documentElement.style.overflow = "auto";
})
document.addEventListener("click", (e) => {
    if (!alphalogin.contains(e.target) && !e.target.classList.contains("r")) {
        alphalogin.classList.add("alphadis");
        header.style.opacity = "1";
        main.style.opacity = "1";
        bottom.style.opacity = "1";
        overlay.classList.remove("overlay1");
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
    }
});
alphalogin.addEventListener("click", (e) => {
    e.stopPropagation();
});
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
  e.stopPropagation();
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
  e.stopPropagation();
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
  e.stopPropagation();
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
document.addEventListener("click",(e)=>{
 if(!contactus.contains(e.target) 
  && e.target !== button
  && e.target !== contactus1
  && e.target !== contactus2
){
    contactus.classList.add("dis");
    header.style.opacity="1";
    main.style.opacity="1";
    bottom.style.opacity="1";
    overlay.classList.remove("overlay1");
 }
})
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
let error2 = document.querySelector(".error1")
let logsub = document.querySelector(".logsub")
let profile = document.querySelector(".profile")
let profile1 = document.querySelector(".profile1")
let login = document.querySelector(".login")
let login1 = document.querySelector(".login1")
let logpass2 = document.getElementById("logpass2");
let logname = document.getElementById("logname");
let logsignin = document.querySelector(".logsignin");
let tab = window.matchMedia("(min-width: 700px) and (max-width: 1000px)");
let mobile = window.matchMedia("(max-width: 700px)");
let lap = window.matchMedia("(min-width: 700px)");
let profilesection = document.querySelector(".profile-section");
logsub.addEventListener("click", async (e) => {
    e.preventDefault();
    cloader.style.display="flex";
    alphalogin.style.opacity="0.3";
    header.style.opacity="0";
    main.style.opacity="0";
    bottom.style.opacity="0";
    overlay.classList.add("overlay1");
    alphalogin.classList.remove("alphadis");
    const firstNamerun = document.getElementById("logfname");
    const lastNamerun = document.getElementById("loglname");
    const emailrun = document.getElementById("logmail");
    const mobilenorun = document.getElementById("logmob");
    const passwordrun = document.getElementById("logpass1");
    const firstName = firstNamerun.value;
    const lastName = lastNamerun.value;
    const email = emailrun.value;
    const mobileno = mobilenorun.value;
    const password = passwordrun.value;
    try{
        const res = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password,mobileno }),
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
     localStorage.setItem("email", email);
     localStorage.setItem("no", mobileno);
     
            localStorage.setItem("loggedIn", "true");
           
            logfname.readOnly = true
            loglname.readOnly = true
            logmail.readOnly = true
            logmob.readOnly = true
            logpass1.readOnly = true
            logsub.disabled = true
            logsub.innerHTML="Account Created"
            error1.style.display = "none";
            if(tab.matches){
                profile.style.display="block"
            }
            if(mobile.matches){
                profile1.style.display="block"  
            }
            if(lap.matches){
                profile.style.display="block"
            }
            login1.style.display="none";
            login.style.display="none";

        } else {
            error1.innerHTML = data.message || "Something went wrong!";
            error1.style.display = "block"; 
            firstNamerun.value=""
            lastNamerun.value=""
            emailrun.value=""
            mobilenorun.value=""
            passwordrun.value=""
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
         if(localStorage.getItem("loggedIn") === "true"){
            window.location.reload();}
    }

  });
  document.querySelector(".logsignin").addEventListener("click", async (e) => {
    e.preventDefault();
    cloader.style.display="flex";
    alphalogin.style.opacity="0.3";
    header.style.opacity="0";
    main.style.opacity="0";
    bottom.style.opacity="0";
    overlay.classList.add("overlay1");
    alphalogin.classList.remove("alphadis");
    try{
    const emailrun = document.getElementById("logname");
    const passwordrun = document.getElementById("logpass2");
    const email = emailrun.value;
    const password= passwordrun.value;
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
         localStorage.setItem("loggedIn", "true");
            localStorage.setItem("firstName", data.profile.firstName);
            localStorage.setItem("lastName", data.profile.lastName);
            localStorage.setItem("email", data.profile.email);
            localStorage.setItem("no", data.profile.mobileNumber); 
        localStorage.setItem("loggedIn", "true");
        
        error2.style.display = "none";
        login.style.display="none";
        login1.style.display="none";
        if(tab.matches){
            profile.style.display="block"
       }
        if(mobile.matches){
            profile1.style.display="block"  
        }
        if(lap.matches){
            profile.style.display="block"
        } 
        logsignin.innerHTML="Signed In Successfully"
        logname.readOnly=true;
        logpass2.readOnly=true;
        logsignin.disabled=true;
    } else {
        error2.innerHTML = data.message || "Something went wrong!";
        error2.style.display = "block";     
        overlay.classList.add("overlay1");
        emailrun.value="";
        passwordrun.value="";
    }
    }
    catch (err){
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
         if(localStorage.getItem("loggedIn") === "true"){
            window.location.reload();}
    }
  });
const link = document.querySelector(".link1"); 
  link.addEventListener("click", (e) => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
      e.preventDefault(); 
      alert("Please log in first to access the Psychometric Test page!");   
    }
  });
let state = "unvis";
profile.addEventListener("click", (e) => {
  e.stopPropagation();
    if (state == "vis") {
        profilesection.classList.remove("show");
        state = "unvis";
    } else {
        profilesection.classList.add("show");
        state = "vis";
    }
});
let state1 = "unvis";
profile1.addEventListener("click", (e) => {
  e.stopPropagation();
    if (state1 == "vis") {
        profilesection.classList.remove("show");
        state1 = "unvis";
    } else {
        profilesection.classList.add("show");
        state1 = "vis";
        menu.classList.remove("navcon-ele-new");
        menu.classList.add("navcon-ele");
        currstat="unvis"
    }
});
document.addEventListener("click",(e)=>{
 if((state=="vis" || state1 == "vis")
  && !profilesection.contains(e.target) 
  && e.target!==profile 
  && e.target!==profile1){
  profilesection.classList.remove("show");
  state="unvis"
  state1="unvis"
 }
})
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("loggedIn") === "true") {
    login.style.display = "none";
    login1.style.display = "none";
    if (tab.matches || lap.matches) {
      profile.style.display = "block";
    }
  } else {
    if (mobile.matches) {
      login1.style.display = "block";
      login.style.display = "none"
    }
    if (tab.matches || lap.matches) {
      login.style.display = "block";
      login1.style.display = "none";
    }
    profile.style.display = "none";
    profile1.style.display = "none";
  }
  const storedFirstName = localStorage.getItem("firstName");
  const email= localStorage.getItem("email");
  const no=localStorage.getItem("no");
  const storedLastName = localStorage.getItem("lastName");
  const mainprof = document.querySelector(".profile-section")
  const loggedIn = localStorage.getItem("loggedIn");
  if (loggedIn) {
    const avatar = document.querySelector(".avatar");
    const avatar1 = document.querySelector(".avatar1");
    const naam = document.querySelector(".namedata");
    const naam1 = document.querySelector(".namedatahead");
    const emailva=document.querySelector(".emaildata");
    const number = document.querySelector(".cnum");
    login.style.display = "none";
    login1.style.display = "none";
    if (naam && storedFirstName && storedLastName &&emailva && number && email && no && avatar) {
            naam.innerHTML = `${storedFirstName} ${storedLastName}`;
            naam1.innerHTML = `${storedFirstName} ${storedLastName}`;
            emailva.innerHTML=`${email}`;
            number.innerHTML=`${no}`;
            avatar.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
            avatar1.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
        }
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
  const logoutbut=document.querySelector(".lgtBtn")
  logoutbut.addEventListener("click",() => {
    localStorage.removeItem("loggedIn")
    const uploggedIn=localStorage.getItem("loggedIn");
    if (!uploggedIn) {
    login.style.display = "block";
    login1.style.display = "block";
    mainprof.style.display="none";

    if (tab.matches) {
      profile.style.display = "none";
    }
    if (mobile.matches) {
      profile1.style.display = "none";
    }
    if (lap.matches) {
      profile.style.display = "none";
    }
    logsignin.innerHTML = "Sign In";
    logsignin.disabled = false;
    logname.readOnly = false;
    logpass2.readOnly = false;
  } else {
    login.style.display = "none";
    login1.style.display = "none";
    profile.style.display = "block";
    profile1.style.display = "block";
    } 
  }
) 
});