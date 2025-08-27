document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let answers = {};
    for (let i = 1; i <= 30; i++) {
        let value = document.querySelector(`input[name="q${i}"]:checked`);
        answers[`q${i}`] = value ? value.value : null;
    }
    let email = prompt("Enter your email to receive results:");

    let res = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, email })
    });

    let data = await res.json();
    alert(data.message);
});
