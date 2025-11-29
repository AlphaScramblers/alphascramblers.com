for(let i=1;i<=10;i++){
    let button = document.querySelector(`.b${i}`);
    let answer = document.querySelector(`.a${i}`);
    let answernew = document.querySelector(`.a${i}n`)

    button.addEventListener("click",()=>{
    if(currstat=="unvis"){
        currstat="vis"
        answer.classList.remove(`a${i}`);
        answer.classList.add(`a${i}n`)
        button.innerHTML="-"
    }
    else{
        currstat="unvis"
        answer.classList.remove(`a${i}n`);
        answer.classList.add(`a${i}`)
        button.innerHTML="+"
    }
})
}

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  const queryForm = document.getElementById("queryForm");
  const messageArea = document.getElementById("formMessage");

  if (!token) {
    queryForm.style.display = "none";
    messageArea.textContent = "Please log in to submit a query.";
    return;
  }

  let firstName, lastName, email, contact;

  try {
    const res = await fetch("/api/profile", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();

    if (!data.success) {
      queryForm.style.display = "none";
      messageArea.textContent = "Please log in to submit a query.";
      return;
    }

    firstName = data.profile.firstName;
    lastName = data.profile.lastName;
    email = data.profile.email;
    contact = data.profile.mobileNumber;

  } catch (err) {
    messageArea.textContent = "Could not load user info.";
    return;
  }

  queryForm.style.display = "block";

  queryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageArea.textContent = "Sending query...";

    const userName = `${firstName} ${lastName}`;
    const queryMessage = document.getElementById("queryContentId").value.trim();

    const payload = {
      userName,
      userEmail: email,
      userContact: contact,
      queryMessage
    };

    try {
      const response = await fetch(queryForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        messageArea.textContent = "Query sent successfully!";
        document.getElementById("queryContentId").value = "";
      } else {
        messageArea.textContent = "Failed: " + (result.message || "Server error.");
      }

    } catch (error) {
      messageArea.textContent = "Network error occurred.";
    }
  });

});