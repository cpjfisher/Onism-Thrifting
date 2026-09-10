// ==========================================
// ONISM THRIFTING
// DONATION API
// ==========================================

export default async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res
            .status(405)
            .json({

                error:
                    "Method not allowed."

            });

    }


    try {

        const {

            submissionType,
            name,
            email,
            phone,
            clothingType,
            quantity,
            condition,
            message,
            photos

        } = req.body || {};


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !name ||
            !email ||
            !phone ||
            !clothingType ||
            !quantity ||
            !condition
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Please complete all required fields."

                });

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                email
            )
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Please enter a valid email address."

                });

        }


        if (
            !process.env.RESEND_API_KEY ||
            !process.env.ONISM_CONTACT_EMAIL
        ) {

            console.error(
                "Required environment variables are missing."
            );


            return res
                .status(500)
                .json({

                    error:
                        "Email service is not configured."

                });

        }


        // ======================================
        // CLEAN VALUES
        // ======================================

        const safeName =
            String(name)
                .replace(
                    /[\r\n]+/g,
                    " "
                )
                .trim();


        const safeEmail =
            String(email)
                .trim();


        const safePhone =
            String(phone)
                .trim();


        const safeMessage =
            message
                ? String(message).trim()
                : "No additional information provided.";


        // ======================================
        // ATTACHMENTS
        // ======================================

        const attachments =
            Array.isArray(photos)
                ? photos
                    .slice(0, 5)
                    .filter(
                        (photo) =>
                            photo &&
                            photo.content &&
                            photo.filename
                    )
                    .map(
                        (photo) => ({

                            content:
                                photo.content,

                            filename:
                                photo.filename

                        })
                    )
                : [];


        // ======================================
        // EMAIL CONTENT
        // ======================================

        const emailText = `
NEW ONISM THRIFTING DONATION

Submission Type:
${submissionType || "Donate"}

Full Name:
${safeName}

Email:
${safeEmail}

WhatsApp / Phone:
${safePhone}

Clothing Type:
${clothingType}

Approx. Number of Pieces:
${quantity}

Overall Condition:
${condition}

Additional Information:

${safeMessage}

Photos Attached:
${attachments.length}
        `.trim();


        const emailPayload = {

            from:
                process.env.RESEND_FROM_EMAIL ||
                "Onism Thrifting <onboarding@resend.dev>",

            to: [
                process.env.ONISM_CONTACT_EMAIL
            ],

            reply_to:
                safeEmail,

            subject:
                `Onism Thrifting Donation — ${safeName}`,

            text:
                emailText

        };


        if (
            attachments.length > 0
        ) {

            emailPayload.attachments =
                attachments;

        }


        // ======================================
        // SEND EMAIL WITH RESEND
        // ======================================

        const resendResponse =
            await fetch(
                "https://api.resend.com/emails",
                {

                    method:
                        "POST",

                    headers: {

                        Authorization:
                            `Bearer ${process.env.RESEND_API_KEY}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            emailPayload
                        )

                }
            );


        const resendData =
            await resendResponse.json();


        if (
            !resendResponse.ok
        ) {

            console.error(
                "Resend donation error:",
                resendData
            );


            return res
                .status(500)
                .json({

                    error:
                        "Your donation could not be submitted."

                });

        }


        // ======================================
        // SUCCESS
        // ======================================

        return res
            .status(200)
            .json({

                success:
                    true

            });


    } catch (error) {

        console.error(
            "Donation API error:",
            error
        );


        return res
            .status(500)
            .json({

                error:
                    "Internal server error."

            });

    }

}