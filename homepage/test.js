document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    let answers = {};
    for (let i = 1; i <= 30; i++) {
        let value = document.querySelector(`input[name="q${i}"]:checked`);
        answers[`q${i}`] = value ? value.value : null;
    }

    try {
        let res = await fetch("http://localhost:3000/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers })
        });

        let data = await res.json();

        const reportDiv = document.getElementById("aiReport");
        const reportContent = document.getElementById("reportContent");
        reportContent.textContent = data.report;
        reportDiv.style.display = "block";

        reportDiv.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
        console.error("Error fetching report:", err);
        alert("Failed to generate AI report. Try again later.");
    }
});
