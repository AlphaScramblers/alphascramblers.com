document.addEventListener("click", async function (e) {

  const btn = e.target.closest(".psycho-test-1");
  if (!btn) return;

  e.preventDefault();

  const token = localStorage.getItem("token"); // already logged in

  try {
    const res = await fetch("/api/check-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Something went wrong. Please refresh the page.");
      return;
    }

    if (data.paymentDone) {
      window.location.href = "/Psychometric_Tests/psychomid.html";
    } else {
      window.location.href = "/Psychometric_Tests/beforepg.html";
    }

  } catch (err) {
    console.error(err);
    alert("Network error. Please try again.");
  }
});