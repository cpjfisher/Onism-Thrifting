export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }


    try {

        const {
            name,
            email,
            subject,
            message
        } = req.body || {};


        if (!name || !email || !message) {

            return res.status(400).json({
                error:
                    "Name, email and message are required."
            });

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            return res.status(400).json({
                error:
                    "Please enter a valid email address."
            });

        }


        const resendResponse =
            await fetch(
                "https://api.resend.com/emails",
                {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${process.env.RESEND_API_KEY}`,

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        from:
                            process.env.RESEND_FROM_EMAIL ||
                            "Onism Thrifting <onboarding@resend.dev>",

                        to: [
                            process.env.ONISM_CONTACT_EMAIL
                        ],

                        reply_to: email,

                        subject:
                            `Onism Thrifting Contact: ${
                                subject ||
                                "New Message"
                            }`,

                        text: `
NEW ONISM THRIFTING MESSAGE

Name: ${name}

Email: ${email}

Subject: ${subject || "Not provided"}

Message:

${message}
                        `

                    })

                }
            );


        const resendData =
            await resendResponse.json();


        if (!resendResponse.ok) {

            console.error(
                "Resend error:",
                resendData
            );

            return res.status(500).json({
                error:
                    "Email could not be sent."
            });

        }


        return res.status(200).json({

            success: true

        });


    } catch (error) {

        console.error(
            "Contact API error:",
            error
        );


        return res.status(500).json({

            error:
                "Internal server error."

        });

    }

}