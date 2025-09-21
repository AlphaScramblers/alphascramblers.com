document.addEventListener("DOMContentLoaded", () => {
    let subbtn = document.querySelector(".btn");
    let checkbox = document.querySelector("input[type='checkbox']");

    function submit() {
        if (!checkbox.checked) {
            subbtn.disabled = true;
            subbtn.style.backgroundColor = "grey";
            subbtn.classList.remove("b");
            subbtn.style.opacity = 0.5;
        } else {
            subbtn.disabled = false;
            subbtn.style.backgroundColor = "rgb(25, 25, 203)";
            subbtn.classList.add("b");
            subbtn.style.opacity = 1;
        }
    }

    submit();
    checkbox.addEventListener("change", submit);
});