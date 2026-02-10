/* =========================
   BASIC ELEMENTS
========================= */
const header = document.querySelector("header");
const main = document.querySelector("main");
const footer = document.querySelector("footer");
const overlay = document.querySelector(".overlay");
const bottom = document.querySelector(".bottom");

const bars = document.querySelector(".navcon");
const menu = document.querySelector(".navcon-ele");
const button = document.querySelector(".contactuslogo");

const lap = window.matchMedia("(min-width: 700px)");

let currstat = "unvis";

/* =========================
   PRELOADER (GO LIVE SAFE)
========================= */
function hideLoader() {
  const preloader = document.querySelector(".preloader");
  if (!preloader) return;

  preloader.style.opacity = "0";
  preloader.style.transition = "opacity 0.4s ease";

  setTimeout(() => {
    preloader.style.display = "none";
    header.style.display = "block";
    main.style.display = "block";
    footer.style.display = "block";
    if (button) button.style.display = "flex";
  }, 400);
}

/* Fires in Go Live */
document.addEventListener("DOMContentLoaded", hideLoader);

/* Fires in production */
window.addEventListener("load", hideLoader);

/* Absolute failsafe */
setTimeout(hideLoader, 2000);

/* =========================
   MOBILE NAV
========================= */
if (bars && menu) {
  bars.addEventListener("click", () => {
    currstat === "unvis"
      ? (currstat = "vis",
        menu.classList.replace("navcon-ele", "navcon-ele-new"))
      : (currstat = "unvis",
        menu.classList.replace("navcon-ele-new", "navcon-ele"));
  });
}

/* =========================
   LOGIN / SIGNUP MODAL
========================= */
const cross = document.querySelector(".cross");
const alphalogin = document.querySelector(".alphalogin");
const regBtns = document.querySelectorAll(".r");

regBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    alphalogin?.classList.remove("alphadis");
    main.style.opacity = bottom.style.opacity = "0.3";
    overlay?.classList.add("overlay1");
    document.body.style.overflow = "hidden";
  });
});

cross?.addEventListener("click", () => {
  alphalogin?.classList.add("alphadis");
  main.style.opacity = bottom.style.opacity = "1";
  overlay?.classList.remove("overlay1");
  document.body.style.overflow = "auto";
});

/* =========================
   SCROLL TO TOP PROGRESS
========================= */
const scrollProgress = document.querySelector(".progress");

scrollProgress?.addEventListener("click", () => {
  document.documentElement.scrollTop = 0;
});

function calcScrollValue() {
  if (!scrollProgress || !lap.matches) {
    if (scrollProgress) scrollProgress.style.display = "none";
    return;
  }

  const pos = document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const percent = Math.round((pos * 100) / height);

  scrollProgress.style.display =
    pos > innerHeight / 4 ? "flex" : "none";

  scrollProgress.style.background =
    `conic-gradient(#4d5bf9 ${percent}%, #d7d7d7 ${percent}%)`;
}

window.addEventListener("scroll", calcScrollValue);
window.addEventListener("load", calcScrollValue);

/* =========================
   CONTACT MODAL
========================= */
const contactus = document.querySelector(".contactus");
const contactBtns = document.querySelectorAll(".cntus, .cntus1");
const crossct = document.querySelector(".crossct");

contactBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    contactus?.classList.remove("dis");
    main.style.opacity = bottom.style.opacity = "0.3";
    overlay?.classList.add("overlay1");
  });
});

crossct?.addEventListener("click", () => {
  contactus?.classList.add("dis");
  main.style.opacity = bottom.style.opacity = "1";
  overlay?.classList.remove("overlay1");
});

/* =========================
   DRAGGABLE CONTACT BUTTON
========================= */
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

if (button && !window.matchMedia("(pointer: coarse)").matches) {
  button.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - button.offsetLeft;
    offsetY = e.clientY - button.offsetTop;
    button.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    button.style.left = e.clientX - offsetX + "px";
    button.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    button.style.cursor = "pointer";

    const mid = window.innerWidth / 2;
    const rect = button.getBoundingClientRect();
    button.style.left =
      rect.left < mid ? "10px" : `${window.innerWidth - rect.width - 20}px`;
  });
}

/* =========================
   CONTACT FORM SUBMIT
========================= */
const contactForm = document.getElementById("contactForm");
const cloader = document.querySelector(".contactloader");

contactForm?.addEventListener("submit", async e => {
  e.preventDefault();
  cloader.style.display = "flex";

  const data = {
    name: namect.value,
    mail: mailct.value,
    contact: contactct.value
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error);

  } catch {
    alert("❌ Something went wrong.");
  } finally {
    cloader.style.display = "none";
    contactus.classList.add("dis");
    main.style.opacity = bottom.style.opacity = "1";
    overlay.classList.remove("overlay1");
  }
});

/* =========================
   LOGIN / SIGNUP TOGGLE
========================= */
const loginform = document.querySelector(".loginform");
const signup = document.querySelector(".signup");
const caa = document.querySelector(".caa");
const log = document.querySelector(".log");

log?.addEventListener("click", () => {
  signup.classList.add("signdis");
  loginform.style.display = "flex";
});

caa?.addEventListener("click", () => {
  signup.classList.remove("signdis");
  loginform.style.display = "none";
});