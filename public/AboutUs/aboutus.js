// ===== OUTER SCHOOL SLIDER =====

const schoolsTrack = document.querySelector(".schools-track");
const schoolSlides = document.querySelectorAll(".school-slide");
const prevBtn = document.querySelector(".school-prev");
const nextBtn = document.querySelector(".school-next");

let schoolIndex = 0;

function updateSchoolSlider() {
    const slideWidth = schoolSlides[0].offsetWidth;
    schoolsTrack.style.transform = `translateX(-${schoolIndex * slideWidth}px)`;
}

nextBtn.addEventListener("click", () => {
    schoolIndex = (schoolIndex + 1) % schoolSlides.length;
    updateSchoolSlider();
});

prevBtn.addEventListener("click", () => {
    schoolIndex = (schoolIndex - 1 + schoolSlides.length) % schoolSlides.length;
    updateSchoolSlider();
});


// ===== INNER AUTO IMAGE SLIDERS =====

document.querySelectorAll(".school-slide").forEach(slide => {

    const track = slide.querySelector(".image-track");
    const images = slide.querySelectorAll("img");
    let imgIndex = 0;

    function autoSlide() {
        imgIndex = (imgIndex + 1) % images.length;
        track.style.transform = `translateX(-${imgIndex * 100}%)`;
    }

    setInterval(autoSlide, 4000);

});
