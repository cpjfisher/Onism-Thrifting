import crypto from "crypto";


// ==========================================
// ONISM THRIFTING
// PAYFAST ITN HANDLER
// ==========================================


// ==========================================
// PAYFAST URL ENCODING
// PHP urlencode-style encoding
// ==========================================

function encodePayFastValue(value) {

    return encodeURIComponent(
        String(value)
    )
        .replace(
            /[!'()*~]/g,
            character =>
                "%" +
                character
                    .charCodeAt(0)
                    .toString(16)
                    .toUpperCase()
        )
        .replace(/%20/g, "+");

}


// ==========================================
// NORMALISE REQUEST BODY
// ==========================================

function getPayFastData(body) {

    if (!body) {
        return {};
    }


    // If Vercel gives us a raw
    // URL-encoded string
    if (typeof body === "string") {

        return Object.fromEntries(
            new URLSearchParams(body)
        );

    }


    return body;

}


// ==========================================
// CREATE PAYFAST PARAMETER STRING
// ==========================================

function createParameterString(data) {

    const parameters = [];


    for (
        const [key, value]
        of Object.entries(data)
    ) {

        // PayFast places signature at the end.
        // Stop before adding it to the string.
        if (key === "signature") {
            break;
        }


        // IMPORTANT:
        // ITN signature validation must include
        // empty fields sent by PayFast.
        parameters.push(

            `${key}=${encodePayFastValue(
                value ?? ""
            )}`

        );

    }


    return parameters.join("&");

}


// ==========================================
// VERIFY PAYFAST SIGNATURE
// ==========================================

function verifySignature(
    payFastData,
    parameterString
) {

    const receivedSignature =
        String(
            payFastData.signature || ""
        )
            .trim()
            .toLowerCase();


    if (!receivedSignature) {
        return false;
    }


    const passphrase =
        process.env
            .PAYFAST_PASSPHRASE;


    let signatureString =
        parameterString;


    if (passphrase) {

        signatureString +=
            `&passphrase=${encodePayFastValue(
                passphrase.trim()
            )}`;

    }


    const calculatedSignature =
        crypto
            .createHash("md5")
            .update(signatureString)
            .digest("hex");


    return (
        receivedSignature ===
        calculatedSignature
    );

}


// ==========================================
// IP HELPERS
// ==========================================

function normaliseIp(ip) {

    if (!ip) {
        return "";
    }


    return String(ip)
        .trim()
        .replace(/^::ffff:/, "");

}


function ipv4ToNumber(ip) {

    const parts =
        ip.split(".")
            .map(Number);


    if (
        parts.length !== 4 ||
        parts.some(
            part =>
                !Number.isInteger(part) ||
                part < 0 ||
                part > 255
        )
    ) {

        return null;

    }


    return (

        (
            parts[0] * 256 * 256 * 256
        ) +

        (
            parts[1] * 256 * 256
        ) +

        (
            parts[2] * 256
        ) +

        parts[3]

    );

}


function ipInCidr(
    ip,
    network,
    prefixLength
) {

    const ipNumber =
        ipv4ToNumber(ip);


    const networkNumber =
        ipv4ToNumber(network);


    if (
        ipNumber === null ||
        networkNumber === null
    ) {

        return false;

    }


    const blockSize =
        2 ** (
            32 -
            prefixLength
        );


    return (

        Math.floor(
            ipNumber / blockSize
        ) ===

        Math.floor(
            networkNumber / blockSize
        )

    );

}


// ==========================================
// VERIFY PAYFAST SOURCE
// ==========================================

function verifyPayFastSource(req) {

    const forwardedFor =
        req.headers[
            "x-forwarded-for"
        ];


    let requestIp = "";


    if (forwardedFor) {

        requestIp =
            normaliseIp(
                String(forwardedFor)
                    .split(",")[0]
            );

    } else {

        requestIp =
            normaliseIp(
                req.socket
                    ?.remoteAddress
            );

    }


    // PayFast published server ranges

    const validRanges = [

        {
            network:
                "197.97.145.144",
            prefix:
                28
        },

        {
            network:
                "41.74.179.192",
            prefix:
                27
        },

        {
            network:
                "102.216.36.0",
            prefix:
                28
        },

        {
            network:
                "102.216.36.128",
            prefix:
                28
        }

    ];


    const validSingleIps = [

        "144.126.193.139"

    ];


    const exactMatch =
        validSingleIps.includes(
            requestIp
        );


    const rangeMatch =
        validRanges.some(
            range =>
                ipInCidr(
                    requestIp,
                    range.network,
                    range.prefix
                )
        );


    if (
        !exactMatch &&
        !rangeMatch
    ) {

        console.error(
            "Invalid PayFast source IP:",
            requestIp
        );


        return false;

    }


    return true;

}


// ==========================================
// SUPABASE CONFIG
// ==========================================

function getSupabaseConfig() {

    const url =
        process.env
            .SUPABASE_URL;


    const secret =
        process.env
            .SUPABASE_SECRET_KEY;


    if (
        !url ||
        !secret
    ) {

        throw new Error(
            "Supabase environment variables are missing."
        );

    }


    return {
        url,
        secret
    };

}


// ==========================================
// GET ORDER FROM SUPABASE
// ==========================================

async function getOrder(orderId) {

    const {
        url,
        secret
    } = getSupabaseConfig();


    const response =
        await fetch(

            `${url}/rest/v1/orders?id=eq.${encodeURIComponent(
                orderId
            )}&select=id,status,total,payfast_payment_id`,

            {

                method:
                    "GET",

                headers: {

                    apikey:
                        secret,

                    Authorization:
                        `Bearer ${secret}`,

                    Accept:
                        "application/json"

                }

            }

        );


    if (!response.ok) {

        const errorText =
            await response.text();


        console.error(
            "Supabase get order error:",
            errorText
        );


        throw new Error(
            "Unable to retrieve order."
        );

    }


    const orders =
        await response.json();


    return (
        orders[0] ||
        null
    );

}


// ==========================================
// VERIFY ITN WITH PAYFAST SERVER
// ==========================================

async function verifyWithPayFast(
    parameterString
) {

    const validationUrl =

        process.env.PAYFAST_MODE ===
        "live"

            ? "https://www.payfast.co.za/eng/query/validate"

            : "https://sandbox.payfast.co.za/eng/query/validate";


    const response =
        await fetch(

            validationUrl,

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                },

                body:
                    parameterString

            }

        );


    if (!response.ok) {

        console.error(
            "PayFast validation HTTP error:",
            response.status
        );


        return false;

    }


    const result =
        await response.text();


    console.log(
        "PayFast validation response:",
        result.trim()
    );


    return (
        result.trim() ===
        "VALID"
    );

}


// ==========================================
// CONFIRM PAID ORDER IN SUPABASE
// ==========================================

async function confirmOrder(
    orderId,
    payFastPaymentId,
    amount
) {

    const {
        url,
        secret
    } = getSupabaseConfig();


    const response =
        await fetch(

            `${url}/rest/v1/rpc/confirm_paid_order`,

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    apikey:
                        secret,

                    Authorization:
                        `Bearer ${secret}`

                },

                body:
                    JSON.stringify({

                        p_order_id:
                            orderId,

                        p_payfast_payment_id:
                            payFastPaymentId,

                        p_amount:
                            Number(amount)

                    })

            }

        );


    const responseText =
        await response.text();


    let result;


    try {

        result =
            JSON.parse(
                responseText
            );

    } catch {

        result =
            responseText;

    }


    if (!response.ok) {

        console.error(
            "Confirm order error:",
            result
        );


        throw new Error(
            "Supabase could not confirm the paid order."
        );

    }


    return result;

}


// ==========================================
// MAIN PAYFAST ITN HANDLER
// ==========================================

export default async function handler(
    req,
    res
) {

    // ======================================
    // ONLY ACCEPT POST
    // ======================================

    if (
        req.method !==
        "POST"
    ) {

        return res
            .status(405)
            .send(
                "Method not allowed"
            );

    }


    try {

        // ======================================
        // READ PAYFAST DATA
        // ======================================

        const payFastData =
            getPayFastData(
                req.body
            );


        const orderId =
            payFastData
                .m_payment_id;


        const paymentId =
            payFastData
                .pf_payment_id;


        const paymentStatus =
            payFastData
                .payment_status;


        const amountGross =
            Number(
                payFastData
                    .amount_gross
            );


        console.log(
            "PayFast ITN received:",
            {
                orderId,
                paymentId,
                paymentStatus,
                amountGross
            }
        );


        // ======================================
        // REQUIRED VALUES
        // ======================================

        if (
            !orderId ||
            !paymentId
        ) {

            console.error(
                "Missing PayFast payment details"
            );


            return res
                .status(400)
                .send(
                    "Missing payment details"
                );

        }


        // ======================================
        // ONLY PROCESS COMPLETE PAYMENTS
        // ======================================

        if (
            paymentStatus !==
            "COMPLETE"
        ) {

            console.log(
                "PayFast payment not COMPLETE:",
                paymentStatus
            );


            // Notification was received,
            // but there is nothing to fulfil.

            return res
                .status(200)
                .send("OK");

        }


        // ======================================
        // CREATE PARAMETER STRING
        // ======================================

        const parameterString =
            createParameterString(
                payFastData
            );


        // ======================================
        // CHECK 1
        // VERIFY SIGNATURE
        // ======================================

        const signatureValid =
            verifySignature(

                payFastData,

                parameterString

            );


        if (!signatureValid) {

            console.error(
                "Invalid PayFast signature"
            );


            return res
                .status(400)
                .send(
                    "Invalid signature"
                );

        }


        console.log(
            "PayFast signature valid"
        );


        // ======================================
        // CHECK 2
        // VERIFY SOURCE
        // ======================================

        const sourceValid =
            verifyPayFastSource(
                req
            );


        if (!sourceValid) {

            return res
                .status(400)
                .send(
                    "Invalid PayFast source"
                );

        }


        console.log(
            "PayFast source valid"
        );


        // ======================================
        // GET REAL ORDER FROM DATABASE
        // ======================================

        const order =
            await getOrder(
                orderId
            );


        if (!order) {

            console.error(
                "Order not found:",
                orderId
            );


            return res
                .status(400)
                .send(
                    "Order not found"
                );

        }


        // ======================================
        // CHECK 3
        // VERIFY AMOUNT
        // ======================================

        const expectedAmount =
            Number(
                order.total
            );


        if (
            !Number.isFinite(
                amountGross
            ) ||
            !Number.isFinite(
                expectedAmount
            ) ||
            Math.abs(
                expectedAmount -
                amountGross
            ) > 0.01
        ) {

            console.error(
                "PayFast amount mismatch:",
                {
                    expected:
                        expectedAmount,

                    received:
                        amountGross
                }
            );


            return res
                .status(400)
                .send(
                    "Amount mismatch"
                );

        }


        console.log(
            "PayFast amount valid:",
            amountGross
        );


        // ======================================
        // CHECK 4
        // VERIFY DIRECTLY WITH PAYFAST
        // ======================================

        const serverConfirmed =
            await verifyWithPayFast(
                parameterString
            );


        if (!serverConfirmed) {

            console.error(
                "PayFast server validation failed"
            );


            return res
                .status(400)
                .send(
                    "PayFast validation failed"
                );

        }


        console.log(
            "PayFast server confirmation valid"
        );


        // ======================================
        // ALL CHECKS PASSED
        //
        // MARK ORDER PAID
        // MARK PRODUCTS SOLD
        // ======================================

        const confirmation =
            await confirmOrder(

                orderId,

                paymentId,

                amountGross

            );


        console.log(
            "Onism order confirmed:",
            confirmation
        );


        // ======================================
        // SUCCESS
        // ======================================

        return res
            .status(200)
            .send("OK");


    } catch (error) {

        console.error(
            "PayFast ITN processing error:",
            error
        );


        // Non-200 means PayFast may retry
        // the notification.

        return res
            .status(500)
            .send(
                "ITN processing error"
            );

    }

}