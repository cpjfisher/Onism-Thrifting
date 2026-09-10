// ==========================================
// ONISM THRIFTING
// CONTACT FORM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.querySelector("#contact-form");

    const status =
        document.querySelector("#contact-success");


    if (!form) {
        return;
    }


    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        const submitButton =
            form.querySelector('button[type="submit"]');


        const originalButtonHTML =
            submitButton.innerHTML;


        // Hide old status message before new submission

        if (status) {

            status.hidden = true;

            status.textContent =
                "Thanks — your message has been received.";

        }


        // Disable button while sending

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <span>Sending...</span>
            <span>→</span>
        `;


        try {

            const formData =
                new FormData(form);


            const data =
                Object.fromEntries(
                    formData.entries()
                );


            const response =
                await fetch("/api/contact", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)

                });


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Something went wrong."
                );

            }


            // Successful submission

            form.reset();


            if (status) {

                status.textContent =
                    "Thanks — your message has been received.";

                status.hidden = false;

            }


        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );


            if (status) {

                status.textContent =
                    "Sorry, your message could not be sent. Please try again.";

                status.hidden = false;

            }


        } finally {

            // Re-enable button

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalButtonHTML;

        }

    });

});