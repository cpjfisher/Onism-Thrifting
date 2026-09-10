document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#contact-form");
    const status = document.querySelector("#contact-status");

    if (!form) return;

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const submitButton =
            form.querySelector('button[type="submit"]');

        const originalButtonText =
            submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        if (status) {
            status.textContent = "";
        }

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


            if (status) {

                status.textContent =
                    "Thanks! Your message has been sent successfully.";

            }

            form.reset();


        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );

            if (status) {

                status.textContent =
                    "Sorry, your message could not be sent. Please try again.";

            }

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                originalButtonText;

        }

    });

});