let waitloader = document.querySelector(".waitloader");

document.addEventListener("DOMContentLoaded", () => {

  // 🟢 FIX: Hide loader if coming back via browser back button
  window.addEventListener("pageshow", () => {
    waitloader.style.display = "none";
  });

  async function handleClick(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first to access the Psychometric Test page!");
      return;
    }

    // SHOW LOADER
    waitloader.style.display = "flex";

    try {
      const res = await fetch("/api/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (!data.success) {
        alert("Something went wrong. Please login again.");
        waitloader.style.display = "none";
        return;
      }

      const paymentDone = data.paymentDone;

      if (paymentDone) {
        window.location.href = "../Psychometric_Tests/psychomid.html";
      } else {
        window.location.href = "../Psychometric_Tests/beforepg.html";
      }

    } catch (err) {
      alert("Network error! Please try again.");
      console.error(err);
      waitloader.style.display = "none";
    }
  }

  const buttons = [
    ".psy1testbut",
  ];

  buttons.forEach(selector => {
    const btn = document.querySelector(selector);
    if (btn) btn.addEventListener("click", handleClick);
  });
});