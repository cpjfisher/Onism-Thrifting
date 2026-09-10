// ==========================================
// ONISM THRIFTING
// PAYFAST ITN
// SANDBOX TEST
// ==========================================

export default async function handler(
    req,
    res
) {

    if (req.method !== "POST") {

        return res
            .status(405)
            .send("Method not allowed");

    }


    try {

        console.log(
            "PayFast ITN received"
        );


        console.log(
            "PayFast ITN data:",
            req.body
        );


        // PayFast expects HTTP 200
        return res
            .status(200)
            .send("OK");


    } catch (error) {

        console.error(
            "PayFast ITN error:",
            error
        );


        return res
            .status(500)
            .send("ITN error");

    }

}