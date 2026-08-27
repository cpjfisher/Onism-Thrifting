// ==========================================
// ONISM THRIFTING
// DONATE PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const donateForm =
        document.querySelector("#sell-form");

    const submitText =
        document.querySelector("#submit-text");

    const submissionType =
        document.querySelector("#submission-type");


    // Make sure the page always starts as Donate

    if (submissionType) {
        submissionType.value = "Donate";
    }


    // Form submission

    if (donateForm) {

        donateForm.addEventListener("submit", (event) => {

            event.preventDefault();

            submitText.textContent =
                "Donation Request Received ✓";

            donateForm.reset();

            // Keep submission type as Donate
            submissionType.value = "Donate";

            setTimeout(() => {

                submitText.textContent =
                    "Submit Donation";

            }, 2500);

        });

    }

});