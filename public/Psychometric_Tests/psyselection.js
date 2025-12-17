document.addEventListener("DOMContentLoaded", () => {

  const testBtn = document.querySelector(".psycho-test-1");
  if (!testBtn) return;

  testBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("../api/check-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (!data.success) {
        alert("Something went wrong. Please try again.");
        return;
      }

      // 🔀 Redirect based on payment status
      if (data.paymentDone) {
        window.location.href = "psychomid.html";
      } else {
        window.location.href = "beforepg.html";
      }

    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  });

});