// ==========================================
// ONISM THRIFTING
// SELL / DONATE PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const choiceCards =
        document.querySelectorAll(".choice-card");

    const submissionType =
        document.querySelector("#submission-type");

    const formHeading =
        document.querySelector("#form-heading");

    const formDescription =
        document.querySelector("#form-description");

    const submitText =
        document.querySelector("#submit-text");

    const sellForm =
        document.querySelector("#sell-form");


    // ==========================================
    // SELL / DONATE SWITCHER
    // ==========================================

    choiceCards.forEach((card) => {

        card.addEventListener("click", () => {

            choiceCards.forEach((item) => {
                item.classList.remove("active");
            });

            card.classList.add("active");


            const choice =
                card.dataset.choice;


            if (choice === "donate") {

                submissionType.value =
                    "Donate";

                formHeading.innerHTML =
                    `DONATE YOUR <span>PIECES WITH US.</span>`;

                formDescription.textContent =
                    "Have clothes you no longer need? Tell us about them and we'll review your donation.";

                submitText.textContent =
                    "Submit Donation";

            } else {

                submissionType.value =
                    "Sell";

                formHeading.innerHTML =
                    `SELL YOUR <span>PIECES WITH US.</span>`;

                formDescription.textContent =
                    "Tell us a little about what you have. We'll review your submission and contact you with the next steps.";

                submitText.textContent =
                    "Submit Request";

            }

        });

    });


    // ==========================================
    // FORM
    // ==========================================

    sellForm.addEventListener("submit", (event) => {

        event.preventDefault();


        const type =
            submissionType.value;


        submitText.textContent =
            "Request Received ✓";


        sellForm.reset();


        // Restore default choice

        submissionType.value =
            type;


        choiceCards.forEach((card) => {

            card.classList.toggle(
                "active",
                card.dataset.choice ===
                    type.toLowerCase()
            );

        });


        setTimeout(() => {

            submitText.textContent =
                type === "Donate"
                    ? "Submit Donation"
                    : "Submit Request";

        }, 2500);

    });

});