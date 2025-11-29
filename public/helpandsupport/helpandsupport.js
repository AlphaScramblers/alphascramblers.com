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
// document.addEventListener("DOMContentLoaded", () => {
//   if (localStorage.getItem("loggedIn") === "true") {
//     login.style.display = "none";
//     login1.style.display = "none";
//     if (tab.matches || lap.matches) {
//       profile.style.display = "block";
//     }
//   } else {
//     if (mobile.matches) {
//       login1.style.display = "block";
//       login.style.display = "none"
//     }
//     if (tab.matches || lap.matches) {
//       login.style.display = "block";
//       login1.style.display = "none";
//     }
//     profile.style.display = "none";
//     profile1.style.display = "none";
//   }
//   const storedFirstName = localStorage.getItem("firstName");
//   const email= localStorage.getItem("email");
//   const no=localStorage.getItem("no");
//   const storedLastName = localStorage.getItem("lastName");
//   const mainprof = document.querySelector(".profile-section")
//   const loggedIn = localStorage.getItem("loggedIn");
//   if (loggedIn) {
//     const avatar = document.querySelector(".avatar");
//     const avatar1 = document.querySelector(".avatar1");
//     const naam = document.querySelector(".namedata");
//     const naam1 = document.querySelector(".namedatahead");
//     const emailva=document.querySelector(".emaildata");
//     const number = document.querySelector(".cnum");
//     login.style.display = "none";
//     login1.style.display = "none";
//     if (naam && storedFirstName && storedLastName &&emailva && number && email && no && avatar) {
//             naam.innerHTML = `${storedFirstName} ${storedLastName}`;
//             naam1.innerHTML = `${storedFirstName} ${storedLastName}`;
//             emailva.innerHTML=`${email}`;
//             number.innerHTML=`${no}`;
//             avatar.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
//             avatar1.innerHTML = `${storedFirstName.charAt(0)}${storedLastName.charAt(0)}`;
//         }
//     if (tab.matches) {
//       profile.style.display = "block";
//     }
//     if (mobile.matches) {
//       profile1.style.display = "block";
//     }
//     if (lap.matches) {
//       profile.style.display = "block";
//     }
//     logsignin.innerHTML = "Signed In Successfully";
//     logsignin.disabled = true;
//     logname.readOnly = true;
//     logpass2.readOnly = true;
//   } else {
//     login.style.display = "block";
//     login1.style.display = "block";
//     profile.style.display = "none";
//     profile1.style.display = "none";
//   }
//   const logoutbut=document.querySelector(".lgtBtn")
//   logoutbut.addEventListener("click",() => {
//     localStorage.removeItem("loggedIn")
//     const uploggedIn=localStorage.getItem("loggedIn");
//     if (!uploggedIn) {
//     login.style.display = "block";
//     login1.style.display = "block";
//     mainprof.style.display="none";

//     if (tab.matches) {
//       profile.style.display = "none";
//     }
//     if (mobile.matches) {
//       profile1.style.display = "none";
//     }
//     if (lap.matches) {
//       profile.style.display = "none";
//     }
//     logsignin.innerHTML = "Sign In";
//     logsignin.disabled = false;
//     logname.readOnly = false;
//     logpass2.readOnly = false;
//   } else {
//     login.style.display = "none";
//     login1.style.display = "none";
//     profile.style.display = "block";
//     profile1.style.display = "block";
//     } 
//   }
// ) 
// });
// const uploggedIn=localStorage.getItem("loggedIn");
// document.addEventListener("DOMContentLoaded",()=>{
//   const email = localStorage.getItem("email");
//   const firstname = localStorage.getItem("firstName");
//   const lastname = localStorage.getItem("lastName");
//   const contact = localStorage.getItem("no");

//   if (!uploggedIn) { 
//     document.getElementById("queryForm").style.display = "none";
//     document.getElementById("formMessage").textContent = "Please log in to submit a query.";
//     return;
//   }

//   document.getElementById('queryForm').addEventListener('submit', async function(event) {
//     event.preventDefault();

//     const form = event.target;
//     const messageArea = document.getElementById('formMessage');
//     messageArea.textContent = "Sending query...";
//     const userName = `${firstname} ${lastname}`;
//     const queryMessage = document.getElementById("queryContentId").value.trim();
//     const data = { userName, userEmail: email, userContact: contact, queryMessage };


//     try {
//       const response = await fetch(form.action, {
//         method: 'POST',
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (response.ok) {
//         messageArea.textContent = "Query sent successfully!";
//         document.getElementById("queryContentId").value = "";
//       } else {
//         const result = await response.json();
//         messageArea.textContent = "Failed: " + (result.message || "Server error.");
//       }
//     } catch (error) {
//       messageArea.textContent = "Network error occurred.";
//     }
//   });
// })

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  const queryForm = document.getElementById("queryForm");
  const messageArea = document.getElementById("formMessage");

  // If not logged in → block form
  if (!token) {
    queryForm.style.display = "none";
    messageArea.textContent = "Please log in to submit a query.";
    return;
  }

  // ---------------------------------------
  // Fetch Profile Using Token
  // ---------------------------------------
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

    // Extract user info
    firstName = data.profile.firstName;
    lastName = data.profile.lastName;
    email = data.profile.email;
    contact = data.profile.mobileNumber;

  } catch (err) {
    messageArea.textContent = "Could not load user info.";
    return;
  }

  // If profile loaded successfully → allow form submission
  queryForm.style.display = "block";

  // ---------------------------------------
  // SUBMIT QUERY
  // ---------------------------------------
  queryForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    messageArea.textContent = "Sending query...";

    const userName = `${firstName} ${lastName}`;
    const queryMessage = document.getElementById("queryContentId").value.trim();

    const data = {
      userName,
      userEmail: email,
      userContact: contact,
      queryMessage
    };

    try {
      const response = await fetch(queryForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        messageArea.textContent = "Query sent successfully!";
        document.getElementById("queryContentId").value = "";
      } 
      else {
        messageArea.textContent =
          "Failed: " + (result.message || "Server error.");
      }

    } catch (error) {
      messageArea.textContent = "Network error occurred.";
    }
  });

});
