

const teamCards = document.querySelectorAll(".team-card");

teamCards.forEach(card => {
    card.addEventListener("click", () => {
        card.classList.toggle("flipped");
    });
});
